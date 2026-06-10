/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Telegraf, Markup } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Safely pull Telegram Bot Token
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
let bot: Telegraf | null = null;

if (telegramToken && telegramToken !== "MY_TELEGRAM_BOT_TOKEN" && telegramToken.trim() !== "") {
  console.log("[INFO] Инициализация Telegram Бота...");
  try {
    bot = new Telegraf(telegramToken);

    // Command /start
    bot.start((ctx) => {
      const appUrl = process.env.APP_URL || "https://localhost:3000";
      const userName = ctx.from?.first_name || "странник";
      return ctx.replyWithMarkdownV2(
        `Приветствую, ${userName}\\! ✨ Я бот\\-проводник в мир душевного исцеления и регрессивных практик\\.\n\nЗапишитесь на глубокий сеанс регрессии, гипнотерапии, энергетической чистки или встречи с Вашим Я через наше удобное интерактивное мини\\-приложение ниже\\! 👇`,
        Markup.inlineKeyboard([
          [Markup.button.webApp("🚀 Открыть каталог услуг", appUrl)],
          [Markup.button.url("💬 Написать мастеру напрямую", "https://t.me/your_telegram_username")]
        ])
      );
    });

    // Command /catalog
    bot.command("catalog", (ctx) => {
      const appUrl = process.env.APP_URL || "https://localhost:3000";
      return ctx.replyWithMarkdownV2(
        "🔮 *Каталог духовных практик и сеансов:*\n\n" +
        "1️⃣ *Путешествие в прошлые жизни* \\- 8 500 ₽ \\(2–2\\.5 ч\\)\n" +
        "2️⃣ *Гипнотерапия* \\- 6 000 ₽ \\(1\\.5–2 ч\\)\n" +
        "3️⃣ *Встреча с Высшим Я* \\- 9 000 ₽ \\(2 ч\\)\n" +
        "4️⃣ *Энергетическая чистка* \\- 5 500 ₽ \\(1\\.5 ч\\)\n\n" +
        "Нажмите на кнопку ниже, чтобы открыть интерактивное приложение с подробнейшим описанием каждого сеанса\\! 👇",
        Markup.inlineKeyboard([
          [Markup.button.webApp("✨ Открыть каталог", appUrl)]
        ])
      );
    });

    // Setup bot launch model
    if (process.env.NODE_ENV === "production" && process.env.APP_URL) {
      const appUrl = process.env.APP_URL;
      const secretPath = `/api/telegram-webhook-${telegramToken.substring(0, 10)}`;
      
      console.log(`[INFO] Настройка Webhook Telegram Бота: ${appUrl}${secretPath}`);
      app.use(bot.webhookCallback(secretPath));
      bot.telegram.setWebhook(`${appUrl}${secretPath}`)
        .then(() => console.log("[INFO] Webhook успешно установлен!"))
        .catch(err => console.error("[ERROR] Не удалось установить Webhook:", err));
    } else {
      console.log("[INFO] Запуск Telegram Бота в режиме Long Polling (локальная разработка)...");
      // Удаляем вебхук перед запуском poll-метода, чтобы избежать ошибки 409 Conflict
      bot.telegram.deleteWebhook({ drop_pending_updates: true })
        .then(() => {
          console.log("[INFO] Вебхук успешно удален перед запуском Long Polling.");
          return bot!.launch();
        })
        .then(() => console.log("[INFO] Бот успешно запущен и слушает запросы!"))
        .catch(err => console.error("[ERROR] Ошибка запуска бота:", err));
    }
  } catch (err) {
    console.error("[ERROR] Ошибка при инициализации Telegraf:", err);
  }
} else {
  console.warn(
    "[WARN] TELEGRAM_BOT_TOKEN не задан или содержит плейсхолдер. Специфический Телеграм Бот запущен в демо-режиме (без отправки сообщений, веб-интерфейс будет работать исправно). Пожалуйста, настройте токен в настройках Secrets!"
  );
}

// API Routes
app.post("/api/book", async (req, res) => {
  try {
    const { sessionId, title, price, user } = req.body;
    console.log(`[INFO] Запрос на бронирование получен на сервере: ${title} (${price} руб) от пользователя`, user);

    if (bot && user && user.id) {
      // Send confirmation message to user
      const msg = `✨ *Вы забронировали сеанс:* «${title}»\n` +
                  `💰 *Стоимость:* ${price.toLocaleString("ru-RU")} ₽\n\n` +
                  `Мастер свяжется с вами в ближайшее время для бронирования удобной даты и времени! Счастливого путешествия! 🙏`;
      
      try {
        await bot.telegram.sendMessage(user.id, msg, { parse_mode: "Markdown" });
        console.log(`[INFO] Сообщение-подтверждение успешно отправлено пользователю ${user.id}`);
      } catch (tgErr) {
        console.warn(`[WARN] Не удалось отправить сообщение в Telegram пользователю ${user.id}:`, tgErr);
      }
    }

    res.json({
      success: true,
      message: "Бронирование зарегистрировано на сервере!"
    });
  } catch (error: any) {
    console.error("[ERROR] Ошибка при обработке бронирования:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vite/Static Setup
async function initApp() {
  if (process.env.NODE_ENV !== "production") {
    console.log("[INFO] Режим разработки. Монтирование Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[INFO] Производственный режим (production). Обслуживание статики...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SUCCESS] Fullstack Server running on http://0.0.0.0:${PORT}`);
  });
}

initApp().catch((err) => {
  console.error("[FATAL] Ошибка запуска сервера:", err);
});
