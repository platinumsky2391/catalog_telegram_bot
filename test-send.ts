import { Telegraf } from "telegraf";

const token = "8875639793:AAECJD8sJEk_xv1uXFFlhueEafHBe54zXHI";
const channelId = "-1003968267594";

const bot = new Telegraf(token);

bot.telegram.sendMessage(channelId, "Test message from the agent")
  .then((msg) => {
    console.log("SUCCESS! Message ID:", msg.message_id);
  })
  .catch((err) => {
    console.error("ERROR:", err.response ? err.response : err);
  });
