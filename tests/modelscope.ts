import { client } from '../src';

async function start() {
  const app = await client('https://modelscope.cn/api/v1/studio/AI-ModelScope/ChatGLM6B-unofficial/gradio');
  const inputs = ["你叫什么名字",null];
  const fn_index = 0;
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