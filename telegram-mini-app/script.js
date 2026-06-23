// ==========================================================================
// Telegram Mini App (TMA) - Vanilla JavaScript Controller
// Скрипт управляет каталогом, рендерингом, навигацией и интеграцией с API Telegram
// ==========================================================================

// Определение объектов Telegram WebApp API
const tg = window.Telegram?.WebApp;

// Аналитический логгер для сбора веб-метрик и конверсий (Amplitude / Telegram Analytics)
const Logger = {
  sessionId: "tma_sess_" + Math.random().toString(36).substring(2, 15),
  
  formatLog(level, eventName, context = {}) {
    return {
      level,
      timestamp: new Date().toISOString(),
      eventName,
      context: {
        platform: tg ? "Telegram_TMA" : "Web_Simulator",
        tgUser: tg?.initDataUnsafe?.user?.id || "anonymous",
        tgTheme: tg?.colorScheme || "unknown",
        ...context
      },
      sessionId: this.sessionId
    };
  },

  dispatch(payload) {
    const colors = {
      DEBUG: "color: #708499",
      INFO: "color: #2481cc; font-weight: bold",
      WARN: "color: #f59e0b; font-weight: bold",
      ERROR: "color: #ef4444; font-weight: bold"
    };

    console.log(
      `%c[${payload.level}] [${payload.timestamp}] [${payload.eventName}]`,
      colors[payload.level],
      payload.context
    );

    try {
      if (typeof window.amplitude !== "undefined") {
        window.amplitude.track(payload.eventName, payload.context);
      }
    } catch (e) {
      console.warn("Ошибка внешней аналитики:", e);
    }
  },

  debug(eventName, context) { this.dispatch(this.formatLog("DEBUG", eventName, context)); },
  info(eventName, context) { this.dispatch(this.formatLog("INFO", eventName, context)); },
  warn(eventName, context) { this.dispatch(this.formatLog("WARN", eventName, context)); },
  error(eventName, error, context) { 
    this.dispatch(this.formatLog("ERROR", eventName, { 
      errorMessage: error?.message || String(error), 
      errorStack: error?.stack, 
      ...context 
    })); 
  },

  trackClick(elementId, metadata) { this.info("UI_CLICK", { elementId, ...metadata }); },
  trackNavigation(from, to, metadata) { this.info("NAVIGATE", { from, to, ...metadata }); },
  trackConversion(actionName, value, metadata) { this.info("CONVERSION", { actionName, value, ...metadata }); }
};

// База данных сеансов
const DATABASE = [
  {
    id: "past-lives",
    title: "Путешествие в прошлые жизни",
    price: 8584,
    duration: "1.5 - 5ч",
    shortDesc: "С помощью приятного глубокого транса Вы погружаетесь в пространство, где начинаете видеть и полностью перепроживать своё прошлое воплощение. Таким образом, приходят осознания по вашим запросам.",
    fullDesc: "Пространство для встречи со своей истинной сутью, где появляется возможность переосмыслить повторяющиеся сценарии и найти в опыте прошлого новые точки опоры для настоящего.<br><br>Сессия регрессии длится от 1,5 до 5 часов. Перед началом проводится беседа, которая включает обсуждение вашего запроса и инструкцию для успешного прохождения практики. Далее с помощью приятной образной медитации вы погружаетесь в пространство, где начинаете видеть своё прошлое воплощение. Это дает возможность не только получить нужную информацию, но и заново прожить саму ситуацию, взглянуть на нее со стороны. Таким образом, к вам приходит глубинное осознание и ясный ответ на ваш запрос.",
    benefits: [
      "Желание узнать, кем вы были в прошлых воплощениях, в каких эпохах жили и как этот опыт сформировал ваши текущие взгляды",
      "Эффект дежавю, чувство «я уже был здесь» или глубокая связь с историческим периодом, к которому вы не имеете отношения в этой жизни",
      "Стойкое внутреннее ощущение, что Земля — не единственный ваш дом, и желание вспомнить свои другие (в том числе нефизические) воплощения",
      "Желание на собственном опыте ощутить продолжение существования души вне физического тела и навсегда снять этот глубинный корневой страх",
      "Странное чувство, что вы давно знаете человека (даже если видите его впервые), или тянущиеся из прошлого неочевидные связи с конкретными людьми",
      "Намерение соприкоснуться с жизнями, где вы были максимально успешны, реализованы или счастливы, чтобы мысленно «перенести» этот опыт в сегодня",
      "Желание понять, почему в вашей жизни повторяются одни и те же сценарии, чтобы осознать �      steps: [
        "<b>Обход критического фактора</b>. Наш сознательный ум действует как стражник, фильтруя информацию. В состоянии транса этот стражник \"дремлет\", позволяя нам получить прямой доступ к глубинной памяти, где хранятся записи обо всех воплощениях.",
        "<b>Телесный отклик и эмоции</b>. Вы не просто \"видите картинки\", вы перепроживаете опыт телом. Именно высвобождение заблокированных эмоций в момент первичной травмы (даже если она была 300 лет назад) дает терапевтический исцеляющий эффект сейчас.",
        "<b>Полный контроль</b>. Эриксоновский и регрессивный гипноз абсолютно безопасен. Вы находитесь в диалоге, всё осознаете, можете в любой момент открыть глаза или прервать сеанс. Это похоже на глубокую расслабряющую медитацию."
      ]200" fill="url(#bg-lives)" />
      <circle cx="100" cy="100" r="85" stroke="#818cf8" stroke-width="1" stroke-dasharray="4 4" />
      <circle cx="100" cy="100" r="65" stroke="#a78bfa" stroke-width="0.5" stroke-dasharray="10 5" />
      <path d="M75 60h50v5L108 95l17 30v5H75v-5l17-30-17-30v-5zm3 5l16 28.5L78 125h44l-16-31.5L122 65H78z" fill="#f472b6" fill-opacity="0.6"/>
      <defs>
        <linearGradient id="bg-lives" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop stop-color="#1e1b4b" /><stop offset="0.5" stop-color="#311042" /><stop offset="1" stop-color="#090514" />
        </linearGradient>
      </defs>
    </svg>`,
    longInfo: {
      sectionTitle: "Как гипноз открывает доступ к глубинной памяти",
      sectionText: "",
      stepsTitle: "Основные аспекты метода:",
      steps: [
        "Обход критического фактора. Наш сознательный ум действует как стражник, фильтруя информацию. В состоянии транса этот стражник \"дремлет\", позволяя нам получить прямой доступ к глубинной памяти, где хранятся записи обо всех воплощениях.",
        "Телесный отклик и эмоции. Вы не просто \"видите картинки\", вы перепроживаете опыт телом. Именно высвобождение заблокированных эмоций в момент первичной травмы (даже если она была 300 лет назад) дает терапевтический исцеляющий эффект сейчас.",
        "Полный контроль. Эриксоновский и регрессивный гипноз абсолютно безопасен. Вы находитесь в диалоге, всё осознаете, можете в любой момент открыть глаза или прервать сеанс. Это похоже на глубокую расслабляющую медитацию."
      ],
      warningText: "Противопоказания: психические заболевания, эпилепсия, сильное алкогольное или наркотическое опьянение."
    },
    exampleRequests: {
      title: "Примеры самых распространённых запросов для прохождения сеанса:",
      columns: [
        [
          "Первое воплощение на Земле",
          "Жизнь в теле противоположного пола",
          "Жизнь в теле животного / птицы / динозавра / рыбы / насекомого",
          "Жизнь в теле растения",
          "Жизнь в теле представителей предыдущих исчезнувших цивилизаций (атланты, лемурийцы, гиперборейцы, майя)",
          "Жизнь, где зародилось ... (например, какое-то чувство)",
          "Жизнь, которая влияет на меня максимально",
          "Жизнь, которую мне сейчас важнее всего узнать / посмотреть",
          "Жизнь, где я встречался с ... (например, с каким-то человеком или знанием)",
          "Предыдущее воплощение"
        ],
        [
          "Жизнь, где был проявлен / обретён / потерян навык ... (например, навык продажи услуг)",
          "Жизнь в определённом месте / географии / времени (например, в Японии или «в Средние века»)",
          "Жизнь, где мои предки были ... (родовая память)",
          "Жизнь, где у меня была максимальная денежная / финансовая успешность / реализованность",
          "Жизнь с максимальной / минимальной реализацией своего предназначения / сценария на воплощение",
          "Жизнь с максимальной скоростью социального роста («из грязи в князи»)",
          "Моя самая счастливая / трагическая / бессмысленная жизнь",
          "Жизнь, через которую проще всего попасть в пространство «жизнь между жизнями»",
          "Жизнь, где был баланс / гармония в отношениях"
        ],
        [
          "Жизнь с ролью жертвы / спасателя / преследователя (агрессора / тирана)",
          "Жизнь с наличием: подавления чужой воли / взятием ответственности за чужую жизнь / перекладыванием ответственности за свою жизнь",
          "Жизнь с проявлением неискренности",
          "Жизнь без проявления доверия / благодарности / уважения / любви",
          "Жизнь с посвящением в эзотерические знания (ведьма / ворожея / гадалка / астролог / знахарка / ведунья / священнослужитель / монах / проповедник)",
          "Жизнь с участием в военных действиях или их последствиях",
          "Жизнь в условиях подавления воли (раб / наложница / каторжанин)",
          "Жизнь человека с нетрадиционной сексуальной ориентацией",
          "Жизнь, в которой имелась власть управлять множеством чужих жизней"
        ]
      ]
    }
  },
  {
    id: "hypnotherapy",
    title: "Гипнотерапия",
    price: 15854,
    duration: "1.5–2 часа",
    shortDesc: "Комфортный диалог с вашим внутренним миром. В ходе сеанса мы выявляем истинные, скрытые причины ваших психологических и психосоматических проблем, до которых невозможно добраться с помощью обычной логики. Нейтрализуя эмоциональный заряд старых травм, подавленных страхов и ограничивающих убеждений, мы убираем сам «корень» проблемы. В результате вы перестаете реагировать по старым сценариям и возвращаете себе контроль над своими решениями и эмоциями.",
    fullDesc: "Профессиональная гипнотерапия — это самый быстрый путь к решению глубоких психологических проблем. Работая напрямую с подсознанием, мы обходим критический фактор ума и устраняем корень проблемы там, где он зародился.",
    benefits: [
      "Быстрое избавление от тревожности, панических атак и страхов",
      "Проработка детских душевных травм и гложущего чувства вины",
      "Замена ограничивающих убеждений на созидательные установки",
      "Эффективная терапия психосоматических симптомов тела",
      "Обретение внутренней гармонии и уверенности в себе"
    ],
    symbol: "👁️",
    svgBackground: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="url(#bg-hypno)" />
      <circle cx="100" cy="100" r="80" stroke="#06b6d4" stroke-width="1" stroke-opacity="0.2" />
      <circle cx="100" cy="100" r="60" stroke="#0d9488" stroke-width="1.5" stroke-opacity="0.3" />
      <path d="M40 100c14-25 106-25 120 0-14 25-106 25-120 0z" stroke="#2dd4bf" stroke-width="2" />
      <circle cx="100" cy="100" r="8" fill="#06b6d4" />
      <defs>
        <linearGradient id="bg-hypno" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop stop-color="#042f2e" /><stop offset="0.6" stop-color="#083344" /><stop offset="1" stop-color="#021526" />
        </linearGradient>
      </defs>
    </svg>`,
    longInfo: {
      sectionTitle: "Эффективность метода",
      sectionText: "Работая напрямую с чувствами и телесными соматическими реакциями, мы трансформируем их в позитивный сценарий жизни за рекордно короткое время.",
      stepsTitle: "План работы:",
      steps: [
        "Диагностический разбор деструктивного состояния в теле",
        "Индукция и погружение в сфокусированное трансовое состояние",
        "Поиск первопричины проблемы по возрастной шкале",
        "Проработка и замена старой травмирующей реакции ума",
        "Финальная калибровка и выстраивание позитивного будущего"
      ],
      warningText: "Услуги строго конфиденциальны и соответствуют этическому кодексу психотерапевта."
    }
  },
  {
    id: "higher-self",
    title: "Встреча с Высшим Я",
    price: 20854,
    duration: "2 часа",
    shortDesc: "Метод для тех, кто ищет ответы на самые важные жизненные вопросы. Через трансовое погружение мы настраиваемся на частоту вашей Высшей сути — той глубинной части подсознания, которая обладает абсолютным знанием о вас. Когда логика заходит в тупик, этот формат помогает вспомнить первоначальные задачи вашей личности. Вы сможете напрямую запросить информацию о своих скрытых ресурсах, талантах и слепых зонах. В результате сессии вы обретаете ясное, многомерное видение своей жизни и мощный приток энергии для движения вперед.",
    fullDesc: "У каждого из нас есть мудрейшая, вечная часть — наше Высшее Я. Этот сеанс предназначен для установления прочного канала связи с этой частью, получения прямых ответов на ваши фундаментальные жизненные вопросы, понимания задач текущего воплощения и исцеления светом.",
    benefits: [
      "Получение точных ответов о предназначении, работе и самореализации",
      "Понимание уроков в сложных отношениях и путей их гармонизации",
      "Принятие прямой поддержки и руководства от Духовных Наставников",
      "Глубокое наполнение исцеляющей световой энергией",
      "Обретение безусловного спокойствия и веры в себя"
    ],
    symbol: "✨",
    svgBackground: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="url(#bg-self)" />
      <polygon points="100,50 115,85 150,100 115,115 100,150 85,115 50,100 85,85" fill="#f59e0b" fill-opacity="0.15" stroke="#fbbf24" stroke-width="1.5" />
      <circle cx="100" cy="100" r="12" fill="#fbbf24" />
      <defs>
        <linearGradient id="bg-self" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop stop-color="#1e1b4b" /><stop offset="0.5" stop-color="#451a03" /><stop offset="1" stop-color="#1a042e" />
        </linearGradient>
      </defs>
    </svg>`,
    longInfo: {
      sectionTitle: "Что вас ожидает?",
      sectionText: "Это глубокий духовный опыт сонастройки с вечной памятью вашей души, трансформирующий восприятие реальности.",
      stepsTitle: "Программа сеанса:",
      steps: [
        "Совместное формулирование списка ваших вопросов",
        "Мягкая медитация-сонастройка, очищение ума",
        "Глубокое расслабление и поднятие частоты вибраций",
        "Установление вербального диалога со своим Высшим Я",
        "Омовение световым потоком, исцеление телесных систем"
      ]
    }
  },
  {
    id: "energy-cleansing",
    title: "Энергетическая чистка",
    price: 20854,
    duration: "1.5 часа",
    shortDesc: "В состоянии транса мы переводим работу мозга на тета-частоты. Это позволяет напрямую взаимодействовать с вашей энергоинформационной структурой. Мы выявляем и убираем автономные паразитарные программы, отжившие связи и снимаем фоновое напряжение. Это перезагружает нервную систему и восстанавливает естественную динамику жизненных процессов.",
    fullDesc: "Энергетическая чистка очищает ваши тонкие тела от стороннего деструктивного вмешательства, накопленного чужого негатива, привязок и восстанавливает естественный ток энергии в чакрах.",
    benefits: [
      "Быстрое восстановление запаса сил, снятие хронической усталости",
      "Очищение ментала от навязчивого мысленного потока",
      "Гармонизация и вращение энергетических центров (чакр)",
      "Нейтрализация чужеродных каналов оттока энергии",
      "Установка надежного защитного поля биоинформационной оболочки"
    ],
    symbol: "💎",
    svgBackground: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="url(#bg-clean)" />
      <path d="M100 55 L135 100 L100 145 L65 100 Z" fill="#047857" fill-opacity="0.2" stroke="#34d399" stroke-width="1.5" />
      <circle cx="100" cy="100" r="55" stroke="#059669" stroke-width="1" />
      <defs>
        <linearGradient id="bg-clean" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop stop-color="#022c22" /><stop offset="0.6" stop-color="#064e3b" /><stop offset="1" stop-color="#011b13" />
        </linearGradient>
      </defs>
    </svg>`,
    longInfo: {
      sectionTitle: "Кому особенно необходима практика?",
      sectionText: "Если вы чувствуете постоянный упадок сил, ментальный хаос, апатию, потерю удачи или долго находились в угнетающей психологической атмосфере.",
      stepsTitle: "Методология чистки:",
      steps: [
        "Сканирование биополя, выявление деформаций и утечек",
        "Бережное выведение чужеродных спектров частот и привязок",
        "Активация и синхронизация всех чакральных центров",
        "Наполнение энергетических резервуаров здоровой чистой силой",
        "Выстраивание качественной защиты биополя"
      ]
    }
  }
];

let curSession = null;

// Инициализация при монтировании страницы
window.addEventListener("DOMContentLoaded", () => {
  Logger.info("APP_STARTUP", {
    url: window.location.href,
    userAgent: navigator.userAgent
  });

  // Инициализация Telegram WebApp
  if (tg) {
    tg.ready();
    tg.expand();
    
    // Скрытие резервных кнопок, так как Telegram использует нативный MainButton
    const headerBtn = document.getElementById("back-btn-fallback");
    const inlineBtnBlock = document.getElementById("booking-action-bar");
    if (inlineBtnBlock) inlineBtnBlock.style.display = "none";
    if (headerBtn) headerBtn.style.display = "none";

    Logger.info("TMA_INITIALIZED", {
      user: tg.initDataUnsafe?.user,
      startParam: tg.initDataUnsafe?.start_param,
      chatType: tg.initDataUnsafe?.chat_type,
      theme: tg.colorScheme
    });
  } else {
    Logger.info("SIMULATOR_INITIALIZED");
  }

  renderCatalog();
  setupEventListeners();
});

// Сборка сетки каталога на главной
function renderCatalog() {
  const grid = document.getElementById("catalog-grid");
  if (!grid) return;

  grid.innerHTML = "";

  DATABASE.forEach((session) => {
    const card = document.createElement("article");
    card.className = "session-card";
    card.id = `card-${session.id}`;
    
    // Сборка разметки карточки
    card.innerHTML = `
      <div class="card-photo-placeholder">
        ${session.svgBackground}
        <div class="dark-overlay"></div>
        <span class="badge-glass" style="position: absolute; top: 12px; left: 12px;">${session.symbol} Практика</span>
        <div class="price-tag">${session.price.toLocaleString("ru-RU")} ₽</div>
        <div class="duration-tag">
          <svg class="svg-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          ${session.duration}
        </div>
      </div>
      <div class="card-content">
        <div class="card-header-row">
          <span class="card-title">${session.title}</span>
        </div>
        <p class="card-short-desc">${session.shortDesc}</p>
        <div class="card-footer-row">
          <span class="card-hint-text">Нажмите для подробностей</span>
          <span class="card-action-link">Подробнее &rarr;</span>
        </div>
      </div>
    `;

    // Слушатель клика для открытия карточки
    card.addEventListener("click", () => {
      Logger.trackClick(`session_card_${session.id}`, {
        sessionId: session.id,
        sessionTitle: session.title,
        sessionPrice: session.price
      });
      Logger.trackNavigation("catalog_list", "session_details", {
        targetSessionId: session.id,
        targetSessionTitle: session.title
      });
      showDetail(session);
    });
    grid.appendChild(card);
  });
}

// Открытие страницы детального описания сеанса
function showDetail(session) {
  curSession = session;

  // Визуальное переключение экранов
  document.getElementById("shop-header").classList.add("hidden");
  document.getElementById("catalog-grid").classList.add("hidden");
  const detailPage = document.getElementById("detail-page");
  detailPage.classList.remove("hidden");
  
  if (session.id === "past-lives") {
    detailPage.classList.add("premium-past-lives");
    document.body.classList.add("premium-past-lives");
  } else {
    detailPage.classList.remove("premium-past-lives");
    document.body.classList.remove("premium-past-lives");
  }
  
  // Прокрутка наверх
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Настройка текстовых блоков
  const detailPrice = document.getElementById("detail-price");
  detailPrice.innerText = `${session.price.toLocaleString("ru-RU")} ₽`;
  if (session.id === "past-lives") {
    detailPrice.style.color = "#818cf8"; // text-indigo-400
  } else {
    detailPrice.style.color = "var(--tg-theme-link-color)";
  }
  
  const detailDuration = document.getElementById("detail-duration");
  if (session.id === "past-lives") {
    detailDuration.innerHTML = `<span style="display: flex; align-items: center; justify-content: center; gap: 4px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${session.duration}</span>`;
  } else {
    detailDuration.innerHTML = `<span style="display: flex; align-items: center; justify-content: center; gap: 4px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-link-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${session.duration}</span>`;
  }
  
  document.getElementById("detail-description").innerText = session.fullDesc;
  
  // Наполнение баннера-заглушки
  const banner = document.getElementById("detail-banner");
  banner.innerHTML = `
    ${session.svgBackground}
    <div class="dark-overlay"></div>
    <div class="detail-banner-content">
      <span class="badge-glass" style="margin-bottom: 12px;">${session.symbol} Личная практика онлайн</span>
      <h2 class="detail-banner-title">${session.title}</h2>
    </div>
  `;

  // Наполнение списка результатов/преимуществ
  const benefitsTitleText = document.getElementById("benefits-title-text");
  const benefitsDesc = document.getElementById("benefits-desc");
  const benefitsIcon = document.getElementById("benefits-icon");

  if (session.id === "past-lives") {
    benefitsTitleText.innerText = "С какими ощущениями приходят:";
    if (benefitsIcon) {
      benefitsIcon.outerHTML = `<svg id="benefits-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`;
    }
    benefitsDesc.innerText = "Жизнь часто дает нам подсказки. Если вы замечаете в своей жизни следующие сценарии, корень проблемы может лежать за пределами текущего воплощения.";
    benefitsDesc.style.display = "block";
  } else {
    benefitsTitleText.innerText = "Результаты сеанса:";
    const currentIcon = document.getElementById("benefits-icon");
    if (currentIcon) {
      currentIcon.outerHTML = `<svg id="benefits-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    }
    benefitsDesc.innerText = "";
    benefitsDesc.style.display = "none";
  }

  const benefitsList = document.getElementById("benefits-list");
  benefitsList.innerHTML = "";
  session.benefits.forEach((benefit) => {
    const li = document.createElement("li");
    const bulletColor = session.id === "past-lives" ? "color: #818cf8;" : "";
    li.innerHTML = `<span class="bullet-star" style="${bulletColor}">✦</span> <span>${benefit}</span>`;
    benefitsList.appendChild(li);
  });

  // Набивка структуры таймлайна (этапы)
  const stepsSectionTitle = document.getElementById("steps-section-title");
  stepsSectionTitle.innerText = session.longInfo.sectionTitle;
  const stepsSectionText = document.getElementById("steps-section-text");
  if (session.longInfo.sectionText) {
    stepsSectionText.innerText = session.longInfo.sectionText;
    stepsSectionText.style.display = "block";
    stepsSectionTitle.style.marginBottom = "4px";
  } else {
    stepsSectionText.innerText = "";
    stepsSectionText.style.display = "none";
    stepsSectionTitle.style.marginBottom = "14px";
  }
  document.getElementById("steps-list-title").innerText = session.longInfo.stepsTitle;

  const timeline = document.getElementById("steps-timeline");
  timeline.innerHTML = "";
  if (session.id === "past-lives") {
    timeline.classList.add("premium-timeline");
  } else {
    timeline.classList.remove("premium-timeline");
  }

  session.longInfo.steps.forEach((step, idx) => {
    const sDiv = document.createElement("div");
    sDiv.className = "timeline-step";
    
    let lineHTML = '';
    if (session.longInfo.steps.length > 1) {
      if (idx === 0) {
        lineHTML = `<div class="step-line-first"></div>`;
      } else if (idx === session.longInfo.steps.length - 1) {
        lineHTML = `<div class="step-line-last"></div>`;
      } else {
        lineHTML = `<div class="step-line-middle"></div>`;
      }
    }
    
    const dotBorder = session.id === "past-lives" ? "border: 1px solid #818cf8; color: #818cf8;" : "";
    sDiv.innerHTML = `
      <div class="step-left">
        ${lineHTML}
        <div class="step-num" style="${dotBorder}">${idx + 1}</div>
      </div>
      <p class="step-text">${step}</p>
    `;
    timeline.appendChild(sDiv);
  });

  // Установка предупреждения (скрыто по просьбе пользователя)
  const warnBox = document.getElementById("warning-box");
  if (warnBox) {
    warnBox.classList.add("hidden");
  }

  // Отрисовка примеров запросов в виде списка по пунктам
  const exampleRequestsCard = document.getElementById("example-requests-card");
  if (session.exampleRequests) {
    exampleRequestsCard.classList.remove("hidden");
    document.getElementById("example-requests-card-title").innerText = session.exampleRequests.title;
    
    const listEl = document.getElementById("example-requests-list");
    listEl.innerHTML = "";
    
    // Сплющиваем колонки в один плоский список запросов
    const allRequests = session.exampleRequests.columns.flat();
    allRequests.forEach((req) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span style="color: #818cf8; font-size: 18px; flex-shrink: 0; user-select: none; margin-top: 3.5px; line-height: 1; display: inline-flex;">•</span>
        <span style="opacity: 0.9;">${req}</span>
      `;
      listEl.appendChild(li);
    });
  } else {
    exampleRequestsCard.classList.add("hidden");
  }

  const orderBtn = document.getElementById("order-button");
  if (session.id === "past-lives") {
    orderBtn.classList.add("btn-premium");
  } else {
    orderBtn.classList.remove("btn-premium");
  }

  // Вибрация (Haptic) в Telegram при взаимодействии
  if (tg?.HapticFeedback && typeof tg.isVersionAtLeast === 'function' && tg.isVersionAtLeast('6.1')) {
    tg.HapticFeedback.impactOccurred("medium");
  }

  // Настройка нативных кнопок Telegram
  if (tg) {
    // Включение кнопки НАЗАД
    tg.BackButton.show();
    tg.BackButton.onClick(hideDetail);

    // Включение Главной Кнопки Бронирования нативного дизайна Telegram
    if (session.id === "past-lives") {
      tg.MainButton.setParams({
        color: "#4f46e5",
        text_color: "#ffffff"
      });
    } else {
      tg.MainButton.setParams({
        color: tg.themeParams.button_color || "#2481cc",
        text_color: tg.themeParams.button_text_color || "#ffffff"
      });
    }
    tg.MainButton.setText(`Забронировать (${session.price.toLocaleString("ru-RU")} ₽)`);
    tg.MainButton.show();
    tg.MainButton.onClick(bookSession);
  }
}

// Скрытие страницы деталей и возврат в каталог
function hideDetail() {
  if (curSession) {
    Logger.trackClick("back_button", {
      lastViewedSessionId: curSession.id,
      lastViewedSessionTitle: curSession.title
    });
    Logger.trackNavigation("session_details", "catalog_list", {
      fromSessionId: curSession.id
    });
  }

  curSession = null;

  document.getElementById("detail-page").classList.add("hidden");
  document.getElementById("shop-header").classList.remove("hidden");
  document.getElementById("catalog-grid").classList.remove("hidden");

  if (tg?.HapticFeedback && typeof tg.isVersionAtLeast === 'function' && tg.isVersionAtLeast('6.1')) {
    tg.HapticFeedback.impactOccurred("light");
  }

  // Выключение нативных кнопок
  if (tg) {
    tg.BackButton.hide();
    tg.BackButton.offClick(hideDetail);
    
    tg.MainButton.hide();
    tg.MainButton.offClick(bookSession);
  }
}

// Алгоритм бронирования сеанса
function bookSession() {
  if (!curSession) return;

  Logger.trackClick(`booking_btn_${curSession.id}`, {
    sessionId: curSession.id,
    sessionPrice: curSession.price
  });

  if (tg?.HapticFeedback && typeof tg.isVersionAtLeast === 'function' && tg.isVersionAtLeast('6.1')) {
    tg.HapticFeedback.notificationOccurred("success");
  }

  if (tg) {
    Logger.info("BOOKING_POPUP_SHOWN", {
      sessionId: curSession.id,
      sessionPrice: curSession.price
    });

    tg.showPopup({
      title: "Подтверждение бронирования",
      message: `Желаете забронировать сеанс «${curSession.title}»? Вы будете перенаправлены к мастеру для согласования свободного времени.`,
      buttons: [
        { id: "confirm", type: "default", text: "Связаться в Telegram" },
        { id: "cancel", type: "cancel", text: "Назад" }
      ]
    }, (btnId) => {
      Logger.info("BOOKING_POPUP_ACTION", {
        actionId: btnId,
        sessionId: curSession.id
      });

      if (btnId === "confirm") {
        Logger.trackConversion("TMA_BOOKING_LINK_OPEN", curSession.price, {
          sessionId: curSession.id,
          sessionTitle: curSession.title
        });
        tg.openTelegramLink("https://t.me/your_telegram_username");
      } else {
        Logger.info("BOOKING_CANCELLED", {
          sessionId: curSession.id
        });
      }
    });
  } else {
    // Браузерный алерт-фоллбек
    Logger.trackConversion("WEB_SIMULATOR_BOOKING_COMMITTED", curSession.price, {
      sessionId: curSession.id,
      sessionTitle: curSession.title
    });
    alert(`Вы забронировали сеанс «${curSession.title}» за ${curSession.price.toLocaleString("ru-RU")} ₽!\n\nДля согласования даты свяжитесь в Telegram: @your_telegram_username`);
  }
}

// Навешивание события на кнопки
function setupEventListeners() {
  // Кнопка назад для десктопа/браузера
  const backBtn = document.getElementById("back-btn-fallback");
  if (backBtn) {
    backBtn.addEventListener("click", hideDetail);
  }

  // Кнопка бронирования в инлайн панели для браузеров
  const orderBtn = document.getElementById("order-button");
  if (orderBtn) {
    orderBtn.addEventListener("click", bookSession);
  }
}
