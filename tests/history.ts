import { GradioChatBot } from '../src';

const bot = new GradioChatBot('https://huggingface.co/spaces/artificialguybr/qwen-14b-chat-demo');

async function start() {
  bot.history = [
    [
      "你好",
      "你好！很高兴能为你提供帮助。"
    ],
    [
      "1+1",
      "1+1=2"
    ]
  ]
  console.log(await bot.chat('你好'));
  console.log(await bot.chat('1+1'));
  console.log(await bot.chat('再+2'));
}

start();