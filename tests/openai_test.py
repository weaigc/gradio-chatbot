import openai
openai.api_key = "dummy"
openai.api_base = "http://127.0.0.1:8080/v1"

# create a chat completion
chat_completion = openai.ChatCompletion.create(model="10", messages=[{"role": "user", "content": "Hello"}])

# print the completion
print(chat_completion.choices[0].message.content)