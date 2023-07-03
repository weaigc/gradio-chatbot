import { GradioChatBot } from '../src';

const bot = new GradioChatBot(); // 调用默认模型

async function start() {
  let index = 0;
  const response = await bot.chat('hello', {
    onMessage(msg) {
      process.stdout.write(msg.slice(index));
      index = msg.length;
    }
  });
  console.log('response', response);
}

start();