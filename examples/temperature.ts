import { GradioChatBot } from '../src';

const bot = new GradioChatBot({
  url: '0', // or 'https://huggingface.co/spaces/yuntian-deng/ChatGPT'
  args: ["", 1, 0.7, 1, [], null], // 0.7 is the temperature argument
});

async function start() {
  let index = 0;
  const response = await bot.chat('hello', {
    onMessage(msg) {
      process.stdout.write(msg.slice(index));
      index = msg.length;
    }
  });
  process.stdout.write('\n');
  console.log('response', response);
}

start();