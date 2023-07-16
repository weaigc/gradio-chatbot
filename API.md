# Below is the API document

## GradioChatBot
GradioChatBot is a class for interacting with Gradio models. It can pass in some options through the constructor, then call the chat method to start a conversation, or call the `reset` method to reset the conversation history.

### Constructor
```
import { GradioChatBot } from 'gradio-chatbot';
const bot = new GradioChatBot(options);
```
* options: A string or an object, containing the following optional properties:
 * url: A string, or an index number of [spaces.json](./src/spaces.json). Indicates the space URL to be docked, defaulting to the first item in [spaces.json](./src/spaces.json).
 * endpoint: Optional. Huggingface space domain name (this domain name must end with `hf.space`).
 * historySize: Optional. A number, indicating the maximum length of the conversation history. Default is `10`.
 * fnIndex: Optional. A number, indicating the function index of the Gradio model.
 * args: Optional. An array, indicating the function arguments of the Gradio model. Default is an empty array.
 * inputIndex: Optional. A number, indicating the input argument index of the Gradio model.
 * parseHtml: Optional. A boolean value, indicating whether to convert the `html` output by the Gradio model to `markdown`. Default is `true`.
 * session_hash: Optional. A string, indicating the unique identifier of the session. Default is a randomly generated hash value.
 * hf_token: Optional. A string, indicating the API token of `Hugging Face`. Default is an empty string.

> When `options` is a string, it means the `url` property.

### chat
Start a conversation
```
await bot.chat(input, options);
```
* input: A string, indicating the user's input content.
* options: An object, containing the following optional properties:
 * onMessage: The callback function when receiving streaming output from the Gradio model. Receives a string parameter, indicating the content of the streaming output.
 * onError: The callback function when an error occurs. Receives a string parameter, indicating the error message.

### reset
Clears the conversation history and regenerates the session identifier.
```
await bot.reset();
```


## Example
```ts
import { GradioChatBot } from 'gradio-chatbot';

// Create a GradioChatBot instance
const bot = new GradioChatBot({
 url: '0',
 historySize: 5,
});

// Start a conversation
const response = await bot.chat("Hi, how are you?", {
 onMessage: (msg) => {
 console.log("Bot:", msg);
 // Bot: I'm fine, thank you. How can I help you?
 },
});

// Start another conversation
await bot.chat("What can you do?", {
 onMessage: (msg) => {
 console.log("Bot:", msg);
 // Bot: I can chat with you and answer some questions.
 },
});

// Reset conversation history
await bot.reset();
```

## generateHash
A utility method for generating session IDs. When you need to manually control the session ID, and the session record, you can use this method to generate a random ID.
```
import { generateHash } from 'gradio-chatbot';
const session_hash =generateHash();
const bot = new GradioChatBot({
 url: '0',
 historySize: 5,
 session_hash,
});
```