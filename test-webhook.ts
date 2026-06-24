import fetch from "node-fetch";

const token = "8875639793:AAECJD8sJEk_xv1uXFFlhueEafHBe54zXHI";
fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`)
  .then(res => res.json())
  .then(data => console.log("Webhook Info:", data))
  .catch(console.error);
