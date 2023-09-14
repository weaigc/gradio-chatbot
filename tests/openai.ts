import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'my api key', // defaults to process.env["OPENAI_API_KEY"]
  baseURL: 'http://127.0.0.1:8080/v1'
});

async function start() {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'user', content: '1+1' },
      { role: 'assistant', content: '1 + 1 = 2' },
      { role: 'user', content: '再+2' },
    ],
    model: '10',
    stream: true,
  });
  for await (const part of completion) {
    process.stdout.write(part.choices[0]?.delta?.content || '');
  }
}

start()