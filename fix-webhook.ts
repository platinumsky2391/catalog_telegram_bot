import fetch from "node-fetch";

const token = "8875639793:AAECJD8sJEk_xv1uXFFlhueEafHBe54zXHI";
const webhookUrl = `https://bot.solien.ru/api/telegram-webhook-${token.substring(0, 10)}`;

fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`)
  .then(res => res.json())
  .then(data => console.log("Set Webhook Result:", data))
  .catch(console.error);
