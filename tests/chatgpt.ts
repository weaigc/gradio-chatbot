import { client } from '../src';

async function start() {
  const app = await client('yuntian-deng-chatgpt.hf.space');
  const inputs = ["你好", 1, 1, 0, [], null];
  const fn_index = 5;
  app.submit(fn_index, inputs)
  .on('data', (event) => {
    console.log('process data', JSON.stringify(event.data));
  })
  .on('status', (event) => {
    console.log('stage', event.stage);
  });
  const res = await app.predict(fn_index, inputs);
  console.log('result', JSON.stringify(res));
}

start();