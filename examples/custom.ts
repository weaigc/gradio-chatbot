import { GradioChatBot } from '../src';

const bot = new GradioChatBot({
  url: 'https://huggingface.co/spaces/h2oai/h2ogpt-chatbot',
  fnIndex: 35,
}); // 调用自定义 ChatBot 模型

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