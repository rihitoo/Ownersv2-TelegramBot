const axios = require("axios");

const meta = {
  name: "cosplay",
  aliases: [],
  version: "1.0.0",
  author: "Kaizenji",
  description: "Get a random cosplay video.",
  guide: ["cosplay"],
  prefix: "both",
  cooldown: 0,
  type: "vip",
  category: "anime"
};

const API_URL = `https://kaiz-apis.gleeze.com/api/nude-cosplay?apikey=5b62d64f-f388-4e23-8110-7f74d296892e`;

async function fetchCosplayVideo() {
  try {
    const res = await axios.get(API_URL);
    if (!res.data || !res.data.url) return null;
    return res.data.url;
  } catch (error) {
    throw new Error("Failed to fetch video from API.");
  }
}

async function onStart({ msg, bot, chatId }) {
  try {
    const videoUrl = await fetchCosplayVideo();
    if (!videoUrl) return bot.sendMessage(chatId, "No cosplay video available.");

    const sentMessage = await bot.sendVideo(chatId, videoUrl, {
      caption: "Here's a random cosplay video!",
      reply_to_message_id: msg.message_id,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🔁 Refresh",
              callback_data: JSON.stringify({
                command: "cosplay",
                gameMessageId: null, // Placeholder
                args: ["refresh"]
              })
            }
          ]
        ]
      }
    });

    // Update callback data with actual message_id
    const updatedKeyboard = [
      [
        {
          text: "🔁 Refresh",
          callback_data: JSON.stringify({
            command: "cosplay",
            gameMessageId: sentMessage.message_id,
            args: ["refresh"]
          })
        }
      ]
    ];

    await bot.editMessageReplyMarkup(
      { inline_keyboard: updatedKeyboard },
      { chat_id: chatId, message_id: sentMessage.message_id }
    );
  } catch (err) {
    console.error("Cosplay Error:", err.message);
    await bot.sendMessage(chatId, `❎ Error fetching video: ${err.message}`);
  }
}

async function onCallback({ bot, callbackQuery, payload }) {
  try {
    if (payload.command !== "cosplay") return;
    if (callbackQuery.message.message_id !== payload.gameMessageId) return;

    const videoUrl = await fetchCosplayVideo();
    if (!videoUrl) {
      await bot.answerCallbackQuery(callbackQuery.id, { text: "No video found." });
      return;
    }

    await bot.editMessageMedia(
      {
        type: "video",
        media: videoUrl,
        caption: "Here's a new random cosplay video!"
      },
      {
        chat_id: callbackQuery.message.chat.id,
        message_id: payload.gameMessageId,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔁 Refresh",
                callback_data: JSON.stringify({
                  command: "cosplay",
                  gameMessageId: payload.gameMessageId,
                  args: ["refresh"]
                })
              }
            ]
          ]
        }
      }
    );

    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (err) {
    console.error("Callback error:", err.message);
    try {
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: "Error occurred. Try again."
      });
    } catch (innerErr) {
      console.error("Callback fail:", innerErr.message);
    }
  }
}

module.exports = { meta, onStart, onCallback };
