import { client } from '../src';

async function start() {
  const app = await client('mosaicml-mpt-30b-chat.hf.space');
  const inputs = [
    "A conversation between a user and an LLM-based AI assistant. The assistant gives helpful and honest answers.",
    [
      [
        "Hello",
        ""
      ]
    ]
  ];
  const fn_index = 3;
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