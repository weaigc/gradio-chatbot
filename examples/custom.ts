import { GradioChatBot } from '../src';

const bot = new GradioChatBot('https://huggingface.co/spaces/BlinkDL/ChatRWKV-gradio'); // 调用自定义 ChatBot 模型

async function start() {
  console.log(await bot.chat('Tell me about ravens.'));
}

start();