# 以下为 API 文档

## GradioChatBot
GradioChatBot 是一个用于和 Gradio 模型进行交互的类。它可以通过构造函数传入一些选项，然后调用chat方法发起会话，或者调用 `reset` 方法重置会话历史。

### 构造函数
```
import { GradioChatBot } from 'gradio-chatbot';
const bot = new GradioChatBot(options);
```
* options: 一个字符串或者一个对象，包含以下可选属性：
  * url: 一个字符串，也可以是 [spaces.json](./src/spaces.json) 索引号。表示需要对接的空间 URL，默认为 [spaces.json](./src/spaces.json) 里的第一项。
  * endpoint: 可选。Huggingface 空间域名（此，域名必须以 `hf.space` 结尾）。
  * historySize: 可选。一个数字，表示会话历史的最大长度。默认为 `10`。
  * fnIndex: 一个数字，表示 Gradio 模型的函数索引。默认为 `0`。
  * args: 一个数组，表示 Gradio 模型的函数参数。默认为空数组。
  * inputIndex: 一个数字，表示 Gradio 模型的输入参数索引。默认为 `0`。
  * parseHtml: 一个布尔值，表示是否将Gradio模型输出的 `html` 转为 `markdown`。默认为 `true`。
  * session_hash: 一个字符串，表示会话的唯一标识。默认为随机生成的哈希值。
  * hf_token: 一个字符串，表示 `Hugging Face` 的 API 令牌。默认为空字符串。

> 当 `options` 为字符串时，则表示 `url` 属性。

### chat
发起对话
```
await bot.chat(input, options);
```
* input: 一个字符串，表示用户的输入内容。
* options: 一个对象，包含以下可选属性：
  * onMessage: 收到Gradio模型的流式输出时的回调函数。接收一个字符串参数，表示流式输出的内容。
  * onError: 发生错误时的回调函数。接收一个字符串参数，表示错误信息。

### reset
清空会话历史，并重新生成会话标识。
```
await bot.reset();
```


## 示例
```ts
import { GradioChatBot } from 'gradio-chatbot';

// 创建一个 GradioChatBot 实例
const bot = new GradioChatBot({
  url: '0',
  historySize: 5,
});

// 发起会话
const response = await bot.chat("Hi, how are you?", {
  onMessage: (msg) => {
    console.log("Bot:", msg);
    // Bot: I'm fine, thank you. How can I help you?
  },
});

// 再次发起会话
await bot.chat("What can you do?", {
  onMessage: (msg) => {
    console.log("Bot:", msg);
    // Bot: I can chat with you and answer some questions.
  },
});

// 重置会话历史
await bot.reset();
```

## generateHash
生成会话 ID 工具方法。当需要手动控制会话 ID 时，及会话记录时，可以使用此方法生成随机 ID。
```
import { generateHash } from 'gradio-chatbot';
generateHash();
```