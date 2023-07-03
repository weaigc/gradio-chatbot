import { GradioChatBot } from '../src';

const bot = new GradioChatBot({
  url: 'https://huggingface.co/spaces/mosaicml/mpt-30b-chat',
});

async function start() {
  console.log(await bot.chat('你好'));
  console.log(await bot.chat('1+1'));
  console.log(await bot.chat('再+2'));
}

start();