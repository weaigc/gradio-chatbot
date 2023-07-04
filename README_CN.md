<div align="center">

# Gradio Chatbot

> 一个可以将 [Huggingface Spaces](https://huggingface.co/spaces)、[魔搭创空间](https://www.modelscope.cn/studios) 及 Gradio ChatBot 自动转成免费 API 的 Npm 包。理论上支持所有带 chatbot 的空间，目前完美支持了 [ChatGPT，Vicuna，MPT-30B，Falcon，ChatGLM](#模型列表) 等众多模型空间。

[![NPM](https://img.shields.io/npm/v/gradio-chatbot.svg)](https://www.npmjs.com/package/gradio-chatbot)
[![Apache 2.0 License](https://img.shields.io/github/license/saltstack/salt)](https://github.com/weaigc/gradio-chatbot/blob/main/license)

</div>

- [快速上手](#快速上手)
- [安装](#安装)
- [使用](#使用)
- [模型列表](#模型列表)
- [兼容性](#兼容性)
- [鸣谢](#鸣谢)
- [License](#license)

## 快速上手

一个命令体验免费的 ChatGPT 聊天机器人。

```bash
npx gradio-chatbot
# or
npm -g gradio-chatbot
chatbot
# 更多用法请输入 chatbot help
```

[![asciicast](./media/demo.gif)](https://asciinema.org/a/0ki5smP795eyXdXGlx53UDmTB)


## 安装

你可以使用 npm 或者 yarn 来安装 gradio-chatbot，Node 版本需要 >= 18。

```bash
npm install gradio-chatbot
# or
yarn add gradio-chatbot
```

## 使用
除了可以在 Cli 中使用外，你还可以自己引入 NPM 包进行二次开发。
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

你也可以把你想要转换的空间地址输入进去，如 https://huggingface.co/spaces/h2oai/h2ogpt-chatbot
```ts
import { GradioChatBot } from 'gradio-chatbot'

const bot = new GradioChatBot({
  url: 'https://huggingface.co/spaces/h2oai/h2ogpt-chatbot',
  fnIndex: 35,
}); // 调用自定义 ChatBot 模型

async function start() {
  console.log(await bot.chat('Hello'));
}

start();
```

除此之外，Npm 包里面已经内置了 10 个流行的 [Huggingface Spaces](https://huggingface.co/spaces)、[魔搭创空间](https://www.modelscope.cn/studios)，你可以直接[传入模型序号使用](#模型列表)。
```ts
import { GradioChatBot } from 'gradio-chatbot';

const bot = new GradioChatBot('1'); // 使用内置1号模型
async function start() {
  console.log(await bot.chat('Tell me about ravens.'));
}

start();
```

更多示例请前往目录: [Examples](./examples/)

> 注意：Huggingface 上的部分模型可能会收集你输入的信息，如果你对数据安全有要求，建议不要使用，使用自己搭建的模型是一个更好的选择。

## 模型列表

调用序号 | 类型 | 说明 | 模型
-----|-----|------|-------
0 | Huggingface Spaces | ChatGPT | https://huggingface.co/spaces/yuntian-deng/ChatGPT
1 | Huggingface Spaces | MosaicML MPT-30B-Chat | https://huggingface.co/spaces/mosaicml/mpt-30b-chat
2 | Huggingface Spaces | Falcon Chat | https://huggingface.co/spaces/HuggingFaceH4/falcon-chat
3 | Huggingface Spaces | Star Chat | https://huggingface.co/spaces/HuggingFaceH4/starchat-playground
4 | Huggingface Spaces | ChatGLM2 | https://huggingface.co/spaces/mikeee/chatglm2-6b-4bit
5 | Huggingface Spaces | ChatGLM | https://huggingface.co/spaces/multimodalart/ChatGLM-6B
6 | Huggingface Spaces | Vicuna 13b | https://chat.lmsys.org/
7 | Huggingface Spaces | Vicuna GGML 模型，速度较慢，不推荐 | https://huggingface.co/spaces/justest/vicuna-ggml
8 | 魔搭 | ChatGLM2 | https://modelscope.cn/studios/AI-ModelScope/ChatGLM6B-unofficial/summary
9 | 魔搭 | 姜子牙V1.1 | https://modelscope.cn/studios/Fengshenbang/Ziya_LLaMA_13B_v1_online/summary
10 | 魔搭 | 达魔院出品的角色对话机器人 | https://modelscope.cn/studios/damo/role_play_chat/summary

> 更多好用模型欢迎在 [issue](https://github.com/weaigc/gradio-chatbot/issues) 区提交贡献。


## 兼容性

- 此 Npm 包需要 `node >= 18`.

## 鸣谢

- Huge thanks to [@gradio/client](https://github.com/gradio-app/gradio/tree/main/client/js)
- [OpenAI](https://openai.com) for creating [ChatGPT](https://openai.com/blog/chatgpt/) 🔥


## License

Apache 2.0 © [LICENSE](https://github.com/weaigc/gradio-chatbot/blob/main/LICENSE).
