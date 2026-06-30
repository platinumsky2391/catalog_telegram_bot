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
import mysql from "mysql2/promise";

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

// Настройка подключения к базе данных MySQL
let pool: mysql.Pool | null = null;
if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME) {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Создаем таблицу пользователей, если она не существует
  pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT PRIMARY KEY,
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      username VARCHAR(255),
      language_code VARCHAR(10),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `).then(() => {
    console.log("[INFO] Таблица users успешно проверена/создана в базе данных.");
  }).catch((err: any) => {
    if (err.code === 'ECONNREFUSED') {
      console.warn(`[WARN] База данных недоступна (${err.address}:${err.port}). Сохранение в БД отключено.`);
      pool = null; // Отключаем БД для текущего запуска, чтобы не было ошибок при работе
    } else {
      console.error("[ERROR] Ошибка при создании таблицы users:", err.message || err);
    }
  });
} else {
  console.log("[WARN] Параметры базы данных (DB_HOST, DB_USER, DB_NAME) не заданы. Сохранение пользователей отключено.");
}

if (telegramToken && telegramToken !== "MY_TELEGRAM_BOT_TOKEN" && telegramToken.trim() !== "") {
  console.log("[INFO] Инициализация Telegram Бота...");
  try {
    bot = new Telegraf(telegramToken);

    // Command /start
    bot.start(async (ctx) => {
      const appUrl = process.env.APP_URL || "https://localhost:3000";
      const rawUserName = ctx.from?.first_name || "странник";
      const rawUsernameTg = ctx.from?.username ? `(@${ctx.from.username})` : "";
      
      // Отправка уведомления администратору в plain-text
      const adminChannelId = process.env.ADMIN_CHANNEL_ID || "-1003968267594";
      if (adminChannelId) {
        try {
          await bot!.telegram.sendMessage(
            adminChannelId, 
            `В бот зашел новый пользователь: ${rawUserName} ${rawUsernameTg}`.trim()
          );
          console.log(`[INFO] Уведомление о новом пользователе отправлено в канал: ${adminChannelId}`);
        } catch (err) {
          console.error(`[ERROR] Не удалось отправить уведомление в админ-канал ${adminChannelId}. Проверьте права бота:`, err);
        }
      }

      // Экранируем спецсимволы для MarkdownV2 (https://core.telegram.org/bots/api#markdownv2-style)
      const escapeMd = (str: string) => str.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
      const userName = escapeMd(rawUserName);

      // Сохранение пользователя в базу данных
      if (pool && ctx.from) {
        try {
          const { id, first_name, last_name, username, language_code } = ctx.from;
          await pool.query(`
            INSERT INTO users (id, first_name, last_name, username, language_code)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              first_name = VALUES(first_name),
              last_name = VALUES(last_name),
              username = VALUES(username),
              language_code = VALUES(language_code)
          `, [id, first_name || null, last_name || null, username || null, language_code || null]);
          console.log(`[INFO] Пользователь ${id} успешно сохранен/обновлен в базе данных.`);
        } catch (err) {
          console.error(`[ERROR] Не удалось сохранить пользователя ${ctx.from.id} в базу данных:`, err);
        }
      }

      return ctx.replyWithMarkdownV2(
        `Приветствую, ${userName}\\! ✨ Я бот\\-проводник в мир трансовых и регрессивных практик\\.\n\nНажмите «ПРАЙС», чтобы изучить все варианты сеансов: регрессивный гипноз, гипнотерапия, энергочистка и погружение для встречи с Высшим «Я» через удобное интерактивное мини\\-приложение\\! 👇`
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

    // Используем Long Polling всегда, чтобы избежать проблем с Nginx, 
    // который сейчас перехватывает запросы к /api/ и возвращает index.html.
    console.log("[INFO] Запуск Telegram Бота в режиме Long Polling...");
    // Удаляем вебхук перед запуском poll-метода, чтобы избежать ошибки 409 Conflict
    bot.telegram.deleteWebhook({ drop_pending_updates: true })
      .then(() => {
        console.log("[INFO] Вебхук успешно удален перед запуском Long Polling.");
        return bot!.launch();
      })
      .then(() => console.log("[INFO] Бот успешно запущен и слушает запросы!"))
      .catch(err => console.error("[ERROR] Ошибка запуска бота:", err));
  } catch (err) {
    console.error("[ERROR] Ошибка при инициализации Telegraf:", err);
  }
} else {
  console.warn(
    "[WARN] TELEGRAM_BOT_TOKEN не задан или содержит плейсхолдер. Специфический Телеграм Бот запущен в демо-режиме (без отправки сообщений, веб-интерфейс будет работать исправно). Пожалуйста, настройте токен в настройках Secrets!"
  );
}

// Тестовый роут для проверки базы данных
app.get("/api/test-db", async (req, res) => {
  const envStatus = {
    DB_HOST: !!process.env.DB_HOST,
    DB_USER: !!process.env.DB_USER,
    DB_PASSWORD: !!process.env.DB_PASSWORD,
    DB_NAME: !!process.env.DB_NAME,
  };

  if (!pool) {
    return res.status(500).json({ 
      status: "error", 
      message: "Пул соединений с БД не инициализирован. Проверьте переменные окружения.", 
      env: envStatus 
    });
  }

  try {
    const [rows] = await pool.query("SELECT 1 as val");
    res.json({ 
      status: "success", 
      message: "Успешное подключение к базе данных!", 
      env: envStatus, 
      testQuery: rows 
    });
  } catch (err: any) {
    res.status(500).json({ 
      status: "error", 
      message: "Ошибка подключения к базе данных: " + err.message, 
      env: envStatus 
    });
  }
});

// API Routes
app.post("/api/save_user", async (req, res) => {
  try {
    const { user } = req.body;
    if (!user || !user.id) {
      return res.status(400).json({ error: "No user data provided" });
    }

    if (pool) {
      const { id, first_name, last_name, username, language_code } = user;
      await pool.query(`
        INSERT INTO users (id, first_name, last_name, username, language_code)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          first_name = VALUES(first_name),
          last_name = VALUES(last_name),
          username = VALUES(username),
          language_code = VALUES(language_code),
          updated_at = CURRENT_TIMESTAMP
      `, [id, first_name || null, last_name || null, username || null, language_code || null]);
      console.log(`[INFO] Посетитель ${id} (WebApp) успешно сохранен в БД.`);
      res.json({ success: true });
    } else {
      res.status(500).json({ error: "Database not configured" });
    }
  } catch (err: any) {
    console.error(`[ERROR] Ошибка сохранения пользователя WebApp:`, err.message);
    res.status(500).json({ error: "Database error" });
  }
});

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
