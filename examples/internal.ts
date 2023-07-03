import { GradioChatBot } from '../src';

const bot = new GradioChatBot('1'); // 调用内置第2个模型

async function start() {
  console.log(await bot.chat('你好'));
  console.log(await bot.chat('1+1'));
  console.log(await bot.chat('再+2'));
}

start();