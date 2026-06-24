/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Telegraf, Markup } from "telegraf";
import dotenv from "dotenv";

// Поиск .env файла вверх по дереву каталогов, а также по специфичному пути хостинга
function findEnvFile(startDir: string, maxLevels = 10): string | null {
  const possiblePaths = [
    path.join(startDir, ".env"),
    path.join(startDir, "../.env"),
    path.join(startDir, "../../.env"),
    path.join(startDir, "../bot-solien/.env"),
    path.join(startDir, "../../bot-solien/.env"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  let currentDir = startDir;
  for (let i = 0; i < maxLevels; i++) {
    const envPath = path.join(currentDir, ".env");
    if (fs.existsSync(envPath)) {
      return envPath;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break; // Достигли корневого каталога (/)
    currentDir = parentDir;
  }
  return null;
}

const envPath = findEnvFile(process.cwd());
if (envPath) {
  console.log(`[INFO] .env файл найден по пути: ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log("[INFO] .env файл не найден в родительских каталогах, используется стандартная загрузка.");
  dotenv.config();
}

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
    bot.start(async (ctx) => {
      const appUrl = process.env.APP_URL || "https://localhost:3000";
      const userName = ctx.from?.first_name || "странник";
      const usernameTg = ctx.from?.username ? `(@${ctx.from.username})` : "";
      
      // Отправка уведомления администратору
      const adminChannelId = process.env.ADMIN_CHANNEL_ID || "-1003968267594";
      if (adminChannelId) {
        try {
          await bot!.telegram.sendMessage(
            adminChannelId, 
            `В бот зашел новый пользователь: ${userName} ${usernameTg}`.trim()
          );
          console.log(`[INFO] Уведомление о новом пользователе отправлено в канал: ${adminChannelId}`);
        } catch (err) {
          console.error(`[ERROR] Не удалось отправить уведомление в админ-канал ${adminChannelId}. Проверьте права бота:`, err);
        }
      }

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
    if (process.env.APP_URL) {
      let appUrl = process.env.APP_URL;
      if (appUrl.endsWith('/')) {
        appUrl = appUrl.slice(0, -1);
      }
      
      const isAIStudio = appUrl.includes("run.app");
      const secretPath = `/api/telegram-webhook-${telegramToken.substring(0, 10)}`;
      
      if (!isAIStudio) {
        console.log(`[INFO] Настройка Webhook Telegram Бота: ${appUrl}${secretPath}`);
        app.use(bot.webhookCallback(secretPath));
        bot.telegram.setWebhook(`${appUrl}${secretPath}`)
          .then(() => console.log("[INFO] Webhook успешно установлен!"))
          .catch(err => console.error("[ERROR] Не удалось установить Webhook:", err));
      } else {
        console.log(`[INFO] Запуск в AI Studio. Вебхук и Long Polling отключены, чтобы не перехватывать запросы рабочего сервера.`);
      }
    } else {
      console.log("[INFO] APP_URL не задан. Запуск Telegram Бота в режиме Long Polling (локальная разработка)...");
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
