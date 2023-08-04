import { GradioChatBot } from '../src';

const bot = new GradioChatBot({
  url: 'https://modelscope.cn/studios/qwen/Qwen-7B-Chat-Demo/summary',
});

async function start() {
  console.log(await bot.chat('你好'));
  console.log(await bot.chat('1+1'));
  console.log(await bot.chat('再+2'));
}

start();