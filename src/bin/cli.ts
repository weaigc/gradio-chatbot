#!/usr/bin/env node

import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { GradioChatBot } from '../';

const bot = new GradioChatBot(); // Default Space: yuntian-deng/ChatGPT

class Spinner {
  tick: number = 900;
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

export async function cli() {
  const rl = readline.createInterface({ input, output });
  let lastLength = 0;
  const spinner = new Spinner();
  spinner.start();
  while (true) {
    spinner.setMode('input');
    const prompt = await rl.question('Man: ');

    if (!prompt.trim()) break;
    spinner.setMode('output');
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
  }
  spinner.stop();
  rl.close();
}

cli();
