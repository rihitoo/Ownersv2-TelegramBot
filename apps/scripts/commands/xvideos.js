const axios = require('axios');

const meta = {
  name: "xvideos",
  version: "1.0.0",
  aliases: ["porn", "hub", "sex"],
  description: "Search videos from xvideos using keyword",
  author: "Kaizenji",
  prefix: "both",
  category: "nsfw",
  type: "anyone",
  cooldown: 5,
  guide: "[search keywords]"
};

async function onStart({ bot, args, message, msg, usages }) {
  const chatId = msg.chat.id;
  const query = args.join(" ");

  if (!query) return usages();

  const url = `https://kaiz-apis.gleeze.com/api/xvideos?query=${encodeURIComponent(query)}`;

  try {
    const response = await axios.get(url);

    if (response.data && response.data.data && response.data.data.length > 0) {
      const results = response.data.data.slice(0, 5); // limit to top 5 results

      let replyText = `🔞 𝗫𝗩𝗶𝗱𝗲𝗼𝘀 𝗿𝗲𝘀𝘂𝗹𝘁𝘀 𝗳𝗼𝗿: *${query}*\n\n`;

      for (const vid of results) {
        replyText += `🔗 *${vid.title}*\n📺 ${vid.duration} | 👀 ${vid.views}\n➡️ ${vid.url}\n\n`;
      }

      return message.reply(replyText, { parse_mode: 'Markdown' });
    } else {
      return message.reply("No results found.");
    }

  } catch (err) {
    console.error(`[ xvideos ] »`, err.message);
    return message.reply("❌ Error fetching data from xvideos API.");
  }
}

module.exports = { meta, onStart };
