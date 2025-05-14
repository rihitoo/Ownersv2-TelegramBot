const axios = require('axios');

const meta = {
  name: "ai",
  version: "1.0.0",
  aliases: ["artificial intelligence"],
  description: "Ask AI models or set preferred model",
  author: "Kaizenji",
  prefix: "both",
  category: "ai",
  type: "anyone",
  cooldown: 5,
  guide: "[your question] | setmodel [1-3]"
};

const userModels = {};

const models = {
  1: { name: "GPT-4.1", endpoint: "/api/gpt-4.1?ask=", param: "ask" },
  2: { name: "Gemini Vision", endpoint: "/api/gemini-vision?q=", param: "q" },
  3: { name: "Blackbox", endpoint: "/api/blackbox?ask=", param: "ask", suffix: "&webSearch=off" }
};

async function onStart({ bot, args, message, msg, usages }) {
  const chatId = msg.chat.id;

  if (args[0]?.toLowerCase() === "setmodel") {
    const modelId = args[1];
    if (!models[modelId]) {
      return message.reply("Invalid model ID. Use:\n1 - GPT-4.1 (default)\n2 - Gemini Vision\n3 - Blackbox");
    }
    userModels[chatId] = modelId;
    return message.reply(`Model has been set to: ${models[modelId].name}`);
  }

  const question = args.join(" ");
  if (!question) return usages();

  const selectedModelId = userModels[chatId] || "1";
  const model = models[selectedModelId];
  const url = `${global.api.kaiz}${model.endpoint}${encodeURIComponent(question)}&uid=${chatId}${model.suffix || ""}`;

  try {
    const response = await axios.get(url);

    if (response.data && response.data.response) {
      return message.reply(`${response.data.response}\n\n𝗠𝗼𝗱𝗲𝗹: ${model.name}`);
    } else {
      return message.reply(`${model.name} couldn't generate a response. Please try again later.`);
    }
  } catch (error) {
    console.error(`[ ${meta.name} ] » ${error}`);
    return message.reply(`[ ${meta.name} ] » An error occurred while connecting to ${model.name}.`);
  }
}

module.exports = { meta, onStart };