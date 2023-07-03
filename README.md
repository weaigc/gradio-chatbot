<div align="center">

# Gradio Chatbot

>  An Npm package that can automatically convert [Huggingface Spaces](https://huggingface.co/spaces), [Modelscope Studios](https://www.modelscope.cn/studios) and Gradio ChatBot into free APIs. Currently supports ChatGPT, Falcon Chat, ChatGLM, Baichuan 7B and many other model spaces.



[![NPM](https://img.shields.io/npm/v/gradio-chatbot.svg)](https://www.npmjs.com/package/gradio-chatbot)
[![Apache 2.0 License](https://img.shields.io/github/license/saltstack/salt)](https://github.com/weaigc/gradio-chatbot/blob/main/license)
</div>

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
- [Model List](#model-list)
- [Compatibility](#compatibility)
- [Credits](#credits)
- [License](#license)

## Quick Start

Experience a free ChatGPT chatbot with just one command.

> npx gradio-chatbot

[![asciicast](https://asciinema.org/a/Wredv7MMQ0Q1MJoiLW1t5rDHr.svg)](https://asciinema.org/a/Wredv7MMQ0Q1MJoiLW1t5rDHr)


## Installation

You can use npm or yarn to install gradio-chatbot. Node version 18 or higher is required.

```bash
npm install gradio-chatbot
# or
yarn add gradio-chatbot
```

## Usage
In addition to using it in the CLI, you can also import the NPM package for further development.
```ts
import { GradioChatBot } from 'gradio-chatbot'

const bot = new GradioChatBot();

async function start() {
  const message = await bot.chat('hello', {
    onMessage(partialMsg) {
      console.log('stream output:', partialMsg);
    }
  });
  console.log('message', message);
}

start();
```

You can also input the spatial address you want to convert, such as RWKV.
```ts
import { GradioChatBot } from 'gradio-chatbot'

const bot = new GradioChatBot('https://huggingface.co/spaces/BlinkDL/ChatRWKV-gradio');
async function start() {
  console.log(await bot.chat('Tell me about ravens.'));
}

start();
```

In addition, the NPM package has built-in support for 10 popular spaces from [Hugging Face Spaces](https://huggingface.co/spaces) and [Modelscope Studios](https://www.modelscope.cn/studios). You can directly use the model index to access them. Please refer to the [Model List](#model-list) for more details.
```ts
import { GradioChatBot } from 'gradio-chatbot';

const bot = new GradioChatBot('1');
async function start() {
  console.log(await bot.chat('Tell me about ravens.'));
}

start();
```

For more examples, please visit the directory: [Examples](./examples/) .

> Note: Some models on Hugging Face may collect the information you input. If you have data security concerns, it is recommended not to use them, and using self-hosted models is a better choice.

## Model List

Index | Type | Description | Model
-----|-----|------|-------
0 | Huggingface Spaces | ChatGPT | https://huggingface.co/spaces/yuntian-deng/ChatGPT
1 | Huggingface Spaces | Falcon Chat | https://huggingface.co/spaces/HuggingFaceH4/falcon-chat
2 | Huggingface Spaces | Star Chat | https://huggingface.co/spaces/HuggingFaceH4/starchat-playground
3 | Huggingface Spaces | ChatGLM2 | https://huggingface.co/spaces/mikeee/chatglm2-6b-4bit
4 | Huggingface Spaces | ChatGLM | https://huggingface.co/spaces/multimodalart/ChatGLM-6B
5 | Huggingface Spaces | Vicuna GGML, the model has slow speed and is not recommended for use. | https://huggingface.co/spaces/justest/vicuna-ggml
6 | ModelScope | ChatGLM2 | https://modelscope.cn/studios/AI-ModelScope/ChatGLM6B-unofficial/summary
7 | ModelScope | Jiang Ziya V1.1 | https://modelscope.cn/studios/Fengshenbang/Ziya_LLaMA_13B_v1_online/summary
8 | ModelScope | Character Dialogue Chatbot developed by Alibaba DAMO Academy | https://modelscope.cn/studios/damo/role_play_chat/summary
9 | ModelScope | Baichuan 7B | https://modelscope.cn/studios/baichuan-inc/baichuan-7B-demo/summary

> More useful models are welcome to contribute in the [issue](https://github.com/weaigc/gradio-chatbot/issues) section. 


## Compatibility

- This package supports `node >= 18`.

## Credits

- Huge thanks to [@gradio/client](https://github.com/gradio-app/gradio/tree/main/client/js)
- [OpenAI](https://openai.com) for creating [ChatGPT](https://openai.com/blog/chatgpt/) 🔥


## License

Apache 2.0 © [LICENSE](https://github.com/weaigc/gradio-chatbot/blob/main/LICENSE).
