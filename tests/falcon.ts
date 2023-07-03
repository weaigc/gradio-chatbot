import { client } from '../src';

async function start() {
  const app = await client('huggingfaceh4-falcon-chat.hf.space');
  const inputs = ["hello",[],"The following is a conversation between a highly knowledgeable and intelligent AI assistant, called Falcon, and a human user, called User. In the following interactions, User and Falcon will converse in natural language, and Falcon will answer User's questions. Falcon was built to be respectful, polite and inclusive. Falcon was built by the Technology Innovation Institute in Abu Dhabi. Falcon will never decline to answer a question, and always attempts to give an answer that User would be satisfied with. It knows a lot, and always tells the truth. The conversation begins.\n",0.8,0.9];
  const fn_index = 1;
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