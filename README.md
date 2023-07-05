<div align="center">

# Gradio Chatbot

>  An Npm package that can automatically convert [Huggingface Spaces](https://huggingface.co/spaces), [Modelscope Studios](https://www.modelscope.cn/studios) and Gradio ChatBot into free APIs. It basically supports any space with a chatbot, and currently perfectly supports many model spaces such as [ChatGPT, Vicuna, MPT-30B, Falcon, ChatGLM and so on](#model-list).

English | [中文](README_CN.md)

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

```bash
npx gradio-chatbot
# or
npm install -g gradio-chatbot
# call the default model
chatbo
# show help
chatbot help
```

[![asciicast](./media/demo.gif)](https://asciinema.org/a/0ki5smP795eyXdXGlx53UDmTB)



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

You can also input the spatial address you want to convert, such as https://huggingface.co/spaces/h2oai/h2ogpt-chatbot.
```ts
import { GradioChatBot } from 'gradio-chatbot'

const bot = new GradioChatBot({
  url: 'https://huggingface.co/spaces/h2oai/h2ogpt-chatbot',
  fnIndex: 35,
}); // 调用自定义 ChatBot 模型

async function start() {
  console.log(await bot.chat('Hello'));
}
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
1 | Huggingface Spaces | MosaicML MPT-30B-Chat | https://huggingface.co/spaces/mosaicml/mpt-30b-chat
2 | Huggingface Spaces | Falcon Chat | https://huggingface.co/spaces/HuggingFaceH4/falcon-chat
3 | Huggingface Spaces | Star Chat | https://huggingface.co/spaces/HuggingFaceH4/starchat-playground
4 | Huggingface Spaces | ChatGLM2 | https://huggingface.co/spaces/mikeee/chatglm2-6b-4bit
5 | Huggingface Spaces | ChatGLM | https://huggingface.co/spaces/multimodalart/ChatGLM-6B
6 | Huggingface Spaces | Vicuna 13b | https://chat.lmsys.org/
7 | Huggingface Spaces | Vicuna GGML, the model has slow speed and is not recommended for use. | https://huggingface.co/spaces/justest/vicuna-ggml
8 | ModelScope | ChatGLM2 | https://modelscope.cn/studios/AI-ModelScope/ChatGLM6B-unofficial/summary
9 | ModelScope | Jiang Ziya V1.1 | https://modelscope.cn/studios/Fengshenbang/Ziya_LLaMA_13B_v1_online/summary
10 | ModelScope | Character Dialogue Chatbot developed by Alibaba DAMO Academy | https://modelscope.cn/studios/damo/role_play_chat/summary

> More useful models are welcome to contribute in the [issue](https://github.com/weaigc/gradio-chatbot/issues) section. 


## Compatibility

- This package supports `node >= 18`.

## Credits

- Huge thanks to [@gradio/client](https://github.com/gradio-app/gradio/tree/main/client/js)
- [OpenAI](https://openai.com) for creating [ChatGPT](https://openai.com/blog/chatgpt/) 🔥


## License

Apache 2.0 © [LICENSE](https://github.com/weaigc/gradio-chatbot/blob/main/LICENSE).
