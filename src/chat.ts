import { NodeHtmlMarkdown } from 'node-html-markdown';
import type { MergeExclusive } from 'type-fest';
import Debug from 'debug';
import assert from 'assert';
import { client } from './client';
import type { Event, Status } from './types'
export * from './config';
import { spaces } from './config';

const debug = Debug('gradio-chatbot');

export const generateHash = () => {
  return Math.random().toString(36).substring(2);
};

type GradioAutoOptions = MergeExclusive<{
  url?: string;
}, {
  endpoint?: string;
}> & {
  historySize?: number;
  fnIndex?: number;
  args?: unknown[];
  inputIndex?: number;
  outputIndex?: number;
  session_hash?: string;
  hf_token?: string;
};

type ChatOptions = {
  onMessage?: (msg: string) => void;
  onError?: (error: string) => void;
  abort?: AbortSignal;
}

function resolveEndpoint(url: string) {
  const uri = new URL(url);
  debug('resolve', uri.hostname);
  if (uri.hostname === 'modelscope.cn') {
    assert(/^\/studios\/([^/]+)\/([^/]+)\//.test(uri.pathname), 'not a valid modelscope studio url');
    const scope = RegExp.$1;
    const name = RegExp.$2;
    return `https://modelscope.cn/api/v1/studio/${scope}/${name}/gradio`;
  } else if (/^https:\/\/huggingface\.co\/spaces\/([^/]+)\/([^/]+)/.test(url)) {
    return `${RegExp.$1}-${RegExp.$2}.hf.space`.toLowerCase();
  } else {
    return uri.host;
  }
}

const traverseContent = (data: any): any => {
  if (!Array.isArray(data)) {
    return data?.value || data;
  }
  return traverseContent(data.at(-1));
}

export const findValidSubmitByType = (components: any[], dependencies: any[], type: string) => {
  const id = components.find(com => com.type === 'button' && com.props.value === 'Submit')?.id;
  let index = dependencies.findIndex(dep => dep.targets?.includes?.(id));
  return index === -1 ? dependencies.findIndex(
    (dep = {}) =>
      dep.inputs?.length
      && dep.outputs?.length
      && dep.backend_fn
      && dep.trigger === type
  ) : index;
}

export const findValidSubmitByButton = (components: any[], dependencies: any[]) => {
  const id = components.find(com => com.type === 'button')?.id;
  if (!id) return -1;
  return dependencies.findIndex(dep => dep.targets?.includes?.(id));
}

export class GradioChatBot {
  private options: GradioAutoOptions;
  history: any[] = [];
  session_hash: string;
  constructor(opts: string | GradioAutoOptions = '0') {
    if (typeof opts === 'string') {
      this.options =  { url: opts };
    } else {
      this.options = opts;
    }
    assert(this.options.endpoint || this.options.url, 'endpoint 和 url 必须要指定其中一个');
    if (!isNaN(this.options.url as any)) {
      let config: string | GradioAutoOptions = spaces[parseInt(this.options.url!, 10)] || this.options.url!;
      if (typeof config === 'string') {
        config = { url: config };
      }
      Object.assign(this.options, config);
    }

    if (!this.options.endpoint) {
      this.options.endpoint = resolveEndpoint(this.options.url!)
    }
    this.session_hash = this.options.session_hash || generateHash();
    if (!this.options.historySize) {
      this.options.historySize = 10;
    }
  }

  private parseInputs = (fnIndex: number, config: any, skip_text = false) => {
    const { components, dependencies } = config;
    const chatbot = components.find((com: any) => com.type === 'chatbot' && com.props?.visible);
  
    const submitFn = dependencies[fnIndex];
    const inputComponents = submitFn?.inputs?.map((inputId: number) => components.find((com: any) => com.id === inputId)) || [];
    const inputs = inputComponents.map((com: any) => com?.props?.value ?? null);
    let outputIndex = submitFn?.outputs.indexOf(chatbot?.id);
  
    debug('fnIndex', fnIndex);
    let textInputIndex = skip_text ? 0 : submitFn?.inputs.indexOf(submitFn?.targets?.[0]);
    if (textInputIndex < 0) {
      textInputIndex = submitFn?.inputs.findIndex((id: number) =>
        components?.find((com: any) =>
          id === com.id
          && (com.type === 'textbox' || com.example_input)
        ));
    }
  
    assert(textInputIndex > -1, '找不到输入框');
  
    const historyIndex = submitFn?.inputs.indexOf(chatbot?.id);
  
    debug('submit', fnIndex, textInputIndex, outputIndex, historyIndex);
    return [inputs, textInputIndex, outputIndex, historyIndex];
  }

  async reset() {
    this.history = [];
    this.session_hash = generateHash();
  }

  async chat(prompt: string, options?: ChatOptions): Promise<string> {
    assert(prompt, 'prompt 不能为空');
    return new Promise(async (resolve, reject) => {
      try {
        let { endpoint, fnIndex, args = [], hf_token } = this.options;

        const { config, submit } =
          await client(endpoint!, { session_hash: this.session_hash, hf_token: hf_token as any, normalise_files: true });

        const { components, dependencies } = config;

        fnIndex = fnIndex ?? findValidSubmitByType(components, dependencies, 'submit');
        if (fnIndex < 0) {
          fnIndex = Math.max(findValidSubmitByButton(components, dependencies), findValidSubmitByType(components, dependencies, 'click'));
        }
        assert(fnIndex !== -1, '解析此空间失败');

        let [inps, inpIndex, outIndex, historyIndex] = this.parseInputs(fnIndex, config);

        if (!args?.length) {
          args = inps;
        }
        let outputIndex = this.options.outputIndex ?? outIndex;
        let inputIndex = this.options.inputIndex ?? inpIndex;

        if (inputIndex > -1) {
          args[inputIndex] = prompt;
        }
        if (historyIndex > -1) {
          args[historyIndex] = this.history.slice(-this.options.historySize) ?? [];
        }

        debug('args', fnIndex, JSON.stringify(args));
        let app = submit(fnIndex, args);
        this.options.fnIndex = fnIndex;
        while (dependencies[++fnIndex]?.trigger === 'then') {
          await app;
          let [inps, _, outIndex] = this.parseInputs(fnIndex, config, true);
          outputIndex = outIndex;
          debug('fnIndex', fnIndex, JSON.stringify(inps));
          app = submit(fnIndex, inps);
        }

        let completed = false;
        let dataReturned = false;
        let errorMessage = '';

        let lastMessage = '';
        const handleData = (event: Event<'data'>) => {
          dataReturned = true;
          const { data = [] } = event || {};
          debug(outputIndex, JSON.stringify(data));
          if (outputIndex === -1) {
            outputIndex = data.findIndex((row: any) => JSON.stringify(row).indexOf('<') > -1);
          }
          this.history = (data?.at(outputIndex) ?? []) as any[];
          const message = traverseContent(this.history);
          if (errorMessage) {
            options?.onError?.(errorMessage);
          } else {
            lastMessage = message ? NodeHtmlMarkdown.translate(message)?.replace?.(/�/g, '').trim() : '';
            options?.onMessage?.(lastMessage);
          }
          if (completed) {
            app.destroy();
          }
        };

        const handleStatus = (event: Status & Event<'status'>) => {
          // @ts-ignore
          const status = event.stage || event.status;
          debug('response status', status);
          if (status === 'error') {
            if (completed) return;
            completed = true;
            errorMessage = event.message || status;
            debug('error message', errorMessage);
            reject(errorMessage);
          } else if (status === 'complete') {
            debug('complete');
            completed = true;
            resolve(lastMessage);
            Object.assign(this.options, {
              args,
              inputIndex,
              outputIndex,
            });
    
            if (dataReturned) {
              app.destroy();
            }
          }
        };

        app.on("status", handleStatus);
        app.on("data", handleData);

        options?.abort?.addEventListener('abort', () => {
          debug('abort signal', options?.abort?.reason);
          app.cancel();
          app.destroy();
          reject(options?.abort?.reason || 'canceled');
        });
      } catch (e) {
        reject(e);
      }
    });
  };
}