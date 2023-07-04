import { NodeHtmlMarkdown } from 'node-html-markdown';
import type { MergeExclusive } from 'type-fest';
import Debug from 'debug';
import assert from 'assert';
import { client } from './client';
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
  session_hash?: string;
  hf_token?: string;
};

type ChatOptions = {
  onMessage?: (msg: string) => void;
  onError?: (error: string) => void;
}

function resolveEndpoint(url: string) {
  debug('url', url);
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
  private instance_map: any;
  constructor(opts: string | GradioAutoOptions = '0') {
    if (typeof opts === 'string') {
      this.options =  { url: opts };
    } else {
      this.options = opts;
    }
    assert(this.options.endpoint || this.options.url, 'endpoint and url must specify one of them');
    if (!isNaN(this.options.url as any)) {
      const index = parseInt(this.options.url!, 10);
      assert(index < spaces.length, `The model index range is [0 - ${spaces.length - 1}].`)
      let config: string | GradioAutoOptions = spaces[index];
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
  
    const submitFn = dependencies[fnIndex];
    const inputs = submitFn?.inputs.map(id => this.instance_map[id].props.value);
  
    debug('fnIndex', fnIndex);
    let textInputIndex = skip_text ? 0 : submitFn?.inputs.indexOf(submitFn?.targets?.[0]);
    if (textInputIndex < 0) {
      textInputIndex = submitFn?.inputs.findIndex((id: number) =>
        components?.find((com: any) =>
          id === com.id
          && (com.type === 'textbox' || com.example_input)
        ));
    }
  
    assert(textInputIndex > -1, 'Cannot find the input box');

    debug('inputIndex', textInputIndex);
    return [inputs, textInputIndex];
  }

  async reset() {
    this.history = [];
    this.instance_map = null;
    this.session_hash = generateHash();
  }

  async chat(prompt: string, options?: ChatOptions): Promise<string> {
    assert(prompt, 'prompt 不能为空');
    return new Promise(async (resolve, reject) => {
      try {
        let { endpoint, fnIndex, args = [], hf_token } = this.options;

        const app = await client(endpoint!, { session_hash: this.session_hash, hf_token: hf_token as any, normalise_files: true });

        const { components, dependencies } = app.config;
        let instance_map = this.instance_map;
        if (!instance_map) {
          instance_map = components.reduce((acc, next) => {
            acc[next.id] = next;
            return acc;
          }, {} as { [id: number]: any });
          this.instance_map = instance_map;
        }

        fnIndex = fnIndex ?? findValidSubmitByType(components, dependencies, 'submit');
        if (fnIndex < 0) {
          fnIndex = Math.max(findValidSubmitByButton(components, dependencies), findValidSubmitByType(components, dependencies, 'click'));
        }
        assert(fnIndex !== -1, 'Failed to parse this space, you may need to specify the fnIndex manually!');

        let [inps, inpIndex] = this.parseInputs(fnIndex, app.config);

        if (!args?.length) {
          args = inps;
        }
        let inputIndex = this.options.inputIndex ?? inpIndex;

        if (inputIndex > -1) {
          args[inputIndex] = prompt;
        }

        debug('args', fnIndex, JSON.stringify(args));

        const fn_status = [];
        let _error_id = -1;
        let messages: { fn_index: number, type: string, message: string, id: number }[] = [];
        const MESSAGE_QUOTE_RE = /^'([^]+)'$/;
        let submit_map: Map<number, ReturnType<typeof app.submit>> = new Map();

        const handle_update = (data: any, fn_index: number) => {
          const outputs = dependencies[fn_index].outputs;
          data?.forEach((value: any, i: number) => {
            const output = instance_map[outputs[i]];
            output.props.value_is_output = true;
            if (
              typeof value === "object" &&
              value !== null &&
              value.__type__ === "update"
            ) {
              for (const [update_key, update_value] of Object.entries(value)) {
                if (update_key === "__type__") {
                  continue;
                } else {
                  output.props[update_key] = update_value;
                }
              }
            } else {
              output.props.value = value;
              if (process.env.DEBUG) {
                debug('value', output.type, JSON.stringify(value));
              }
              if (output.type === 'chatbot' && value) {
                this.history = value.slice(-this.options.historySize);
                output.props.value = this.history;
                const message = value?.at(-1)?.at(-1);
                const lastMessage = message ? NodeHtmlMarkdown.translate(message)?.replace?.(/�/g, '').trim() : '';
                options?.onMessage?.(lastMessage);
              }
            }
          });
        }

        const trigger_api_call = async (
          dep_index: number,
          data = null,
          event_data: unknown = null
        ) => {
          let dep = dependencies[dep_index];
          const current_status = fn_status[dep_index];

          messages = messages.filter(({ fn_index }) => fn_index !== dep_index);
          if (dep.cancels) {
            await Promise.all(
              dep.cancels.map(async (fn_index) => {
                const submission = submit_map.get(fn_index);
                submission?.cancel();
                return submission;
              })
            );
          }
      
          if (current_status === "pending" || current_status === "generating") {
            return;
          }
      
          let payload = {
            fn_index: dep_index,
            data: data || dep.inputs.map((id) => instance_map[id].props.value),
            event_data: dep.collects_event_data ? event_data : null
          };
          const make_prediction = () => {
            const submission = app.submit(payload.fn_index, payload.data as unknown[], payload.event_data)
              .on("data", ({ data, fn_index }) => {
                handle_update(data, fn_index);
              })
              .on("status", ({ fn_index, ...status }) => {
                fn_status[fn_index] = status.stage;
                debug('status', status.stage);
                if (status.stage === "complete") {
                  let end = true;
                  dependencies.map(async (dep, i) => {
                    if (dep.trigger_after === fn_index) {
                      end = false;
                      trigger_api_call(i);
                    }
                  });
      
                  submission.destroy();
                  if (end) {
                    const message = this.history?.at(-1)?.at(-1);
                    const lastMessage = message ? NodeHtmlMarkdown.translate(message)?.replace?.(/�/g, '').trim() : '';
                    resolve(lastMessage);
                  }
                }
      
                if (status.stage === "error") {
                  if (status.message) {
                    const _message = status.message.replace(
                      MESSAGE_QUOTE_RE,
                      (_, b) => b
                    );
                    messages = [
                      {
                        type: "error",
                        message: _message,
                        id: ++_error_id,
                        fn_index
                      },
                      ...messages
                    ];
                  }

                  dependencies.map(async (dep, i) => {
                    if (
                      dep.trigger_after === fn_index &&
                      !dep.trigger_only_on_success
                    ) {
                      trigger_api_call(i);
                    }
                  });
                  options?.onError?.(status.message || 'error');
                  reject(status.message || 'error');
                  submission.destroy();
                }
              });
      
            submit_map.set(dep_index, submission);
          }
          if (dep.frontend_fn) {
            dep
              .frontend_fn(
                payload.data.concat(
                  dep.outputs.map((id) => instance_map[id].props.value)
                )
              )
              .then((v: []) => {
                if (dep.backend_fn) {
                  payload.data = v;
                  make_prediction();
                } else {
                  handle_update(v, dep_index);
                }
              });
          } else {
            if (dep.backend_fn) {
              make_prediction();
            }
          }
        }

        trigger_api_call(fnIndex, args);
      } catch (e) {
        reject(e);
      }
    });
  };
}