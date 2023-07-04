#!/usr/bin/env node

import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { GradioChatBot, spaces } from '../';

class Spinner {
  tick: number = 300;
  processing = false;
  index = 0;
  tid: any;
  chars = {
    output: ['-', '\\', '|', '/'],
    input: ['│', ' '],
  }
  currentMode: 'input' | 'output' = 'output';
  setMode(mode: 'input' | 'output') {
    this.currentMode = mode;
    if (mode === 'input') {
      this.tick = 900;
    } else {
      this.tick = 300;
    }
  }

  start() {
    this.processing = true;
    if (this.tid) return;
    this.spin();
  }

  spin() {
    this.tid = setTimeout(() => {
      if (!this.processing) return;
      const chars = this.chars[this.currentMode];
      this.index = ++this.index % chars.length;
      const char = chars[this.index];
      process.stdout.write(char);
      process.stdout.moveCursor(-1, 0);
      this.spin();
    }, this.tick);
  }

  write(text: string) {
    if(text.charAt(0) === '\n') {
      process.stdout.write(' ');
    }
    process.stdout.write(text);
  }

  stop() {
    this.processing = false;
    this.tid = null;
  }
}

class RL {
  rl: ReturnType<typeof readline.createInterface>;
  constructor(readonly options: Parameters<typeof readline.createInterface>[0]) {
    this.rl = readline.createInterface(options);
  }
  async question(prompt: string) {
    this.rl.setPrompt(prompt);
    this.rl.prompt(true);
    const lines = [];
    let closeTid: NodeJS.Timeout;
    for await (const input of this.rl) {
      clearTimeout(closeTid);
      closeTid = setTimeout(() => {
        if (input === '') {
          process.stdout.write('\n');
        }
        this.close();
      }, 500);
      lines.push(input);
    }
    return lines.join('\n');
  }
  close() {
    this.rl?.close();
    this.rl = null;
  }
}

export async function cli() {
  const model = process.argv[2] || '0';
  if (!/^https?:\/\//.test(model) && !spaces[model]) {
    process.stdout.write(`> An tool that can automatically convert huggingface and modelscope spaces to free API.

Usage:
npx gradio-chatbot
npx gradio-chatbot Index
npx gradio-chatbot URL

`);
    process.stdout.write('Index\tSpaces URL\n');
    process.stdout.write(spaces.map((space, index) => `${index}\t${(space as any)?.url || space}`).join('\n'));
    process.stdout.write(`

More information: https://github.com/weaigc/gradio-chatbot
`)
    return;
  }
  const bot = new GradioChatBot(model);

  let lastLength = 0;
  const spinner = new Spinner();
  while (true) {
    const prompt = await new RL({ input, output }).question('Man: ');
    if (!prompt.trim()) break;
    spinner.start();
    spinner.write('Bot: ');

    const response = await bot.chat(prompt, {
      onMessage: (msg: string) => {
        spinner.write(msg.slice(lastLength));
        lastLength = msg.length;
      },
    });
    spinner.write(response.slice(lastLength));
    lastLength = 0;
    spinner.write('\n');
    spinner.stop();
  }
}

cli();
