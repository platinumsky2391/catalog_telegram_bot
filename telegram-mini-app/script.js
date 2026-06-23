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
      console.error("Analytics Error", e);
    }
  },

  debug(eventName, context) { this.dispatch(this.formatLog("DEBUG", eventName, context)); },
  info(eventName, context) { this.dispatch(this.formatLog("INFO", eventName, context)); },
  warn(eventName, context) { this.dispatch(this.formatLog("WARN", eventName, context)); },
  error(eventName, error, context) { 
    this.dispatch(this.formatLog("ERROR", eventName, { error: error?.message || error, ...context }));
  },

  trackClick(elementId, metadata) { this.info("UI_CLICK", { elementId, ...metadata }); },
  trackNavigation(from, to, metadata) { this.info("NAVIGATE", { from, to, ...metadata }); },
  trackConversion(actionName, value, metadata) { this.info("CONVERSION", { actionName, value, ...metadata }); }
};

// База данных сеансов
const sessions = [
  {
    id: "past-lives",
    title: "Путешествие в прошлые жизни",
    badge: "ИССЛЕДОВАНИЕ",
    price: 8584,
    duration: "1.5 - 5ч",
    shortDesc: "С помощью приятного глубокого транса Вы погружаетесь в пространство, где начинаете видеть и полностью перепроживать своё прошлое воплощение. Таким образом, приходят осознания по вашим запросам.",
    fullDesc: "Пространство для встречи со своей истинной сутью, где появляется возможность переосмыслить повторяющиеся сценарии и найти в опыте прошлого новые точки опоры для настоящего.<br><br>Сессия регрессии длится от 1,5 до 5 часов. Перед началом проводится беседа, которая включает обсуждение вашего запроса и инструкцию для успешного прохождения практики. Далее с помощью приятной образной медитации вы погружаетесь в пространство, где начинаете видеть своё прошлое воплощение. Это дает возможность не только получить нужную информацию, но и заново прожить саму ситуацию, взглянуть на нее со стороны. Таким образом, к вам приходит глубинное осознание и ясный ответ на ваш запрос.",
    benefitsTitle: "Частые запросы на просмотр прошлых воплощений:",
    benefits: [
      "Желание узнать, кем вы были в прошлых воплощениях, в каких эпохах жили и как этот опыт сформировал ваши текущие взгляды",
      "Эффект дежавю, чувство «я уже был здесь» или глубокая связь с историческим периодом, к которому вы не имеете отношения в этой жизни",
      "Стойкое внутреннее ощущение, что Земля — не единственный ваш дом, и желание вспомнить свои другие (в том числе нефизические) воплощения",
      "Желание на собственном опыте ощутить продолжение существования души вне физического тела и навсегда снять этот глубинный корневой страх",
      "Странное чувство, что вы давно знаете человека (даже если видите его впервые), или тянущиеся из прошлого неочевидные связи с конкретными людьми",
      "Намерение соприкоснуться с жизнями, где вы были максимально успешны, реализованы или счастливы, чтобы мысленно «перенести» этот опыт в сегодня",
      "Желание понять, почему в вашей жизни повторяются одни и те же сценарии, чтобы осознать невыученный урок и выйти из «колеса Сансары»",
      "Увидеть куда отправляется душа после завершения воплощения, встретиться с духовными наставниками или «родственными душами»",
      "Выход за масштаб одной жизни, чтобы посмотреть на картину целиком: какие уроки вы уже прошли и какой глобальный опыт накапливает ваша суть"
    ],
    themeColor: "from-indigo-600 to-purple-800",
    gradientFrom: "rgba(79, 70, 229, 0.2)",
    gradientTo: "rgba(147, 51, 234, 0.2)",
    symbol: "🌀",
    customFontSize: "14px",
    svgBackground: `<svg class="session-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="url(#bg-lives)" />
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
    shortDesc: "Работа с бессознательным позволяет выявить и устранить первопричину проблемы. Гипнотерапия является высокоэффективным инструментом для нейтрализации психологических травм, фобий, тревожных и навязчивых состояний, а также для трансформации деструктивных установок и снятия эмоциональных блоков.",
    fullDesc: "Профессиональная гипнотерапия — это метод работы с психологическими запросами. Благодаря взаимодействию с бессознательным и обходу критического фактора мышления, этот подход создает условия для выявления первопричины внутренних трудностей и их проработки на том уровне, где они изначально сформировались.\n\nСтандартная сессия гипнотерапии занимает 1–2 часа. На начальном этапе проводится диагностика для прояснения вашего запроса, текущего состояния и желаемых результатов. После этого с помощью специальных техник происходит погружение в состояние транса, где открывается доступ к поиску и проработке скрытых причин проблемы. Финальным этапом становится комфортное возвращение в обычное состояние и подведение итогов проведенной работы.",
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
      sectionTitle: "Как работает гипнотерапия",
      steps: [
        "<b>Поиск первичного ядра</b>. Любая тревога или внутренний конфликт — это всегда следствие. В трансовом состоянии мы находим заложенный в прошлом источник проблемы, который сложно заметить или проанализировать в обычном, повседневном состоянии.",
        "<b>Снятие эмоционального напряжения</b>. Используя методы терапии, мы прорабатываем первоначальную ситуацию и снимаем эмоциональное напряжение. Вы будете помнить о том, что произошло, но это воспоминание больше не сможет ранить. Мы убираем сам корень проблемы, благодаря чему прошлый опыт перестает фонить в настоящем и вызывать приступы страха или паники.",
        "<b>Смена убеждений</b>. На место тревоги и старых страхов приходят спокойствие, уверенность и чувство внутренней опоры. Мы помогаем психике закрепить новые, здоровые привычки реагирования на окружающую реальность и выстроить позитивное восприятие жизни."
      ]
    },
    indications: {
      title: "Кому показана гипнотерапия?",
      description: "Гипнотерапия доказала свою высокую эффективность в решении широкого спектра психологических проблем, от которых трудно избавиться обычными разговорами.",
      items: [
        "Панические атаки, фоновая повышенная тревожность",
        "Фобии: страх полетов, закрытых пространств, животных, высоты",
        "Проработка застарелых детских психотравм и обид на родителей",
        "Посттравматическое стрессовое расстройство и тяжелые воспоминания",
        "Неуверенность в себе, синдром самозванца, страх проявленности",
        "Расстройства пищевого поведения (РПП), компульсивное переедание",
        "Депрессивные состояния, апатия, потеря вкуса к жизни",
        "Психосоматические заболевания, аллергии",
        "Зависимости: курение, сладкое, созависимые отношения"
      ]
    }
  },
  {
    id: "higher-self",
    title: "Встреча с Высшим Я",
    price: 20854,
    duration: "2 часа",
    shortDesc: "Метод для тех, кто ищет ответы на самые важные жизненные вопросы. Через гипнотическое погружение мы установим связь с вашей внутренней мудростью, чтобы вы смогли найти верные для себя решения. Вы сможете напрямую исследовать свои скрытые ресурсы, таланты и слепые зоны. В результате сессии вы обретете ясное, многомерное видение своей жизни и мощный приток энергии для движения вперед.",
    fullDesc: "Высшее «Я» — это глубинное ядро нашей психики, хранящее ответы на ключевые вопросы о нашем пути и окружающем нас мире. Через трансовое погружение мы выстраиваем прямой контакт с этим центром внутреннего знания, чтобы получить доступ к скрытой информации и мощным инсайтам, недоступным повседневному уму.\n\nВы заранее присылаете список из 10 вопросов своему Высшему «Я». Вопросы могут быть абсолютно любыми, вплоть до поиска причин сложных заболеваний.",
    extraBlocks: [
      {
        title: "Как выстраивается диалог с Высшим «Я»",
        type: "steps",
        steps: [
          '<b>Остановка внутреннего диалога</b>. Глубокое физическое и ментальное расслабление. Мы "выключаем" голос логики, критики и повседневной суеты, чтобы наладить контакт со своей истинной сутью.',
          "<b>Расширение границ восприятия</b>. С помощью специальных техник мы расширяем ваше сознание, выводя его за пределы телесного восприятия в пространство чистого знания и тотального спокойствия.",
          "<b>Прямой диалог</b>. Вы начинаете получать информацию: в виде образов, слов, озарений или четкого знания. Я выступаю проводником, задавая подготовленные вами вопросы вашему Высшему Я.",
        ]
      },
      {
        icon: 'info',
        title: "Предусмотрено два формата работы:",
        text: "<b>1. Прямой сеанс</b><br>Вы лично погружаетесь в состояние гипнотического транса. Я сопровождаю вас в этом процессе и помогаю выстроить прямой контакт с вашим Высшим «Я». В этом случае вы самостоятельно воспринимаете информацию и озвучиваете приходящие ответы.<br><br><b>2. Сеанс с участием слипера (проводника)</b><br>Слипер — это специально подготовленный ассистент, обладающий способностью быстро и очень глубоко входить в транс. Некоторым клиентам бывает сложно самостоятельно достичь этого состояния. В таких случаях работу на себя берет слипер. На время сеанса он выступает в роли «ретранслятора».<br><br>Как это работает: Я погружаю слипера в глубокий транс и помогаю ему настроиться на вас. Ваше Высшее «Я» передает информацию напрямую через речевой аппарат слипера, давая чёткие и исчерпывающие ответы на ваши вопросы. Ваше личное присутствие при этом не требуется."
      },
      {
        icon: 'help',
        title: "Как подготовиться к сеансу через слипера",
        text: "Чтобы слипер мог максимально точно настроиться на вас, понадобятся следующие данные:",
        list: [
          "Фотография. Обычное фото в полный рост, где хорошо видно лицо. Без фильтров, ретуши и солнцезащитных очков.",
          "Полные ФИО.",
          "Дата рождения."
        ]
      }
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
    indications: {
      title: "Когда необходим контакт с Высшим «Я»?",
      items: [
        "Вопросы о предназначении: «Кто я? Зачем я здесь? Какова моя миссия?»",
        "Муки выбора: когда логика не помогает принять судьбоносное решение (брак, переезд, бизнес)",
        "Внутренний кризис: потеря ориентиров и непонимание, куда двигаться дальше",
        "Понять через какую сферу деятельности или знания вас ждет максимальный масштаб реализации",
        "Необходимость получить конкретный совет от своего Высшего «Я» по сложной текущей ситуации",
        "Желание постичь законы мироздания и получить прямые ответы об устройстве Вселенной и реальности",
        "Поиск прорывных идей и инсайтов для творческих, научных или бизнес-проектов",
        "Раскрытие интуиции и укрепление доверия к самому себе",
        "Запрос на просмотр наиболее вероятного сценария будущего и его альтернатив"
      ]
    }
  },
  {
    id: "energy-cleansing",
    title: "Энергетическая чистка",
    price: 20854,
    duration: "1.5 часа",
    shortDesc: "Диагностика и восстановление вашего энергетического пространства. В процессе работы мы выявляем и убираем скрытые негативные влияния (интерференции), забирающие ваш ресурс. Вы узнаете истинные причины их появления и получите четкие рекомендации, как сохранить свою энергетическую целостность и избежать подобных проблем в дальнейшем.",
    fullDesc: "В состоянии транса мы переводим работу мозга на тета-частоты. Это позволяет напрямую взаимодействовать с вашей энергоинформационной структурой: мы выявляем и убираем автономные паразитарные программы, отжившие связи и снимаем фоновое напряжение. Такая работа перезагружает нервную систему и восстанавливает естественную динамику жизненных процессов.\n\nПроводится полная чистка энергетических полей от всевозможных интерференций: влияния нижних миров, чужеродных энергий, магических воздействий, ударов по биополю, подключки, сущностей и негативные программы.\n\nМы выясняем причины возникновения этих нарушений. Во время сеанса вы получаете четкие рекомендации о том, как сохранить свою целостность и не допускать подобных нарушений в будущем.",
    indications: {
      icon: "zap",
      title: "Симптомы энергетических проблем",
      description: "Если в вашей жизни начали систематически происходить следующие проявления — это повод провести энергодиагностику.",
      items: [
        "Хроническая усталость, даже после долгого сна. «Просыпаюсь и уже устал»",
        "Резкие, немотивированные вспышки агрессии, гнева, слез или паники",
        "Ощущение чужого присутствия, навязчивые мысли, которые вам не свойственны",
        "Череда неудач, блокировка денежного потока, когда все дела рушатся на пустом месте",
        "Внезапная тяга к вредным привычкакам или зависимостям (алкоголь, переедание)",
        "Необъяснимые блуждающие боли в теле, когда медицинские показатели в норме",
        "Токсичное окружение, «энергетические вампиры», вытягивающие все соки",
        "Тяжелые повторяющиеся кошмары, сонный паралич, ночные панические атаки",
        "Ощущение, что вы живете «чужую жизнь» и не контролируете свои эмоции"
      ]
    },
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
      sectionTitle: "Как происходит энергетическая чистка",
      steps: [
        "<b>Диагностика биополя.</b> В гипнотическом состоянии мы обращаемся к вашему подсознанию, чтобы увидеть объективную картину вашей энергоинформационной структуры. Мы находим энергетические пробои, деструктивные привязки и скрытые программы, которые истощают ваши ресурсы.",
        "<b>Восстановление энергетической автономности.</b> Мы находим и убираем любые скрытые причины, по которым происходит отток вашей жизненной энергии. Это позволяет полностью освободиться от чужеродного влияния и выстроить надежную внутреннюю защиту.",
        "<b>Восстановление энергетического баланса.</b> Устранив все уязвимости биополя, мы восполняем дефицит сил чистым ресурсом. Этот процесс гармонизирует энергоструктуру, что на физическом уровне ощущается как прилив сил, снятие напряжения и возвращение ясности ума.",
      ]
    },
    extraBlocks: [
      {
        icon: "info",
        title: "Предусмотрено два формата работы:",
        text: "<b>1. Прямой сеанс</b>\nВы лично погружаетесь в состояние гипнотического транса. Я сопровождаю вас в этом процессе и помогаю выявить и убрать скрытые негативные влияния. В этом случае вы самостоятельно делаете всю работу под моим руководством.\n\n<b>2. Сеанс с участием слипера (проводника)</b>\nСлипер — это специально подготовленный ассистент, обладающий способностью быстро и очень глубоко входить в транс. Некоторым клиентам бывает сложно самостоятельно достичь этого состояния. В таких случаях работу на себя берет слипер. Во время сеанса он сам выполняет всю работу с вашим энергетическим полем.\n\nКак это работает: Я погружаю слипера в глубокий транс и помогаю ему настроиться на вас. Мы проводим полную диагностику и чистку вашего биополя через слипера. Ваше личное присутствие при этом не требуется, работа проходит так же эффективно.",
      },
      {
        icon: "help",
        title: "Как подготовиться к сеансу через слипера",
        text: "Чтобы слипер мог максимально точно настроиться на вас, понадобятся следующие данные:",
        list: [
          "Фотография. Обычное фото в полный рост, где хорошо видно лицо. Без фильтров, ретуши и солнцезащитных очков.",
          "Полные ФИО.",
          "Дата рождения.",
        ],
      },
    ]
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
    const catalogBtnBlock = document.getElementById("catalog-action-bar");
    if (inlineBtnBlock) inlineBtnBlock.style.display = "none";
    if (catalogBtnBlock) catalogBtnBlock.style.display = "none";
    if (headerBtn) headerBtn.style.display = "none";

    Logger.info("TMA_INITIALIZED", {
      user: tg.initDataUnsafe?.user,
      startParam: tg.initDataUnsafe?.start_param,
      chatType: tg.initDataUnsafe?.chat_type,
      theme: tg.colorScheme
    });

    tg.MainButton.setText("Записаться на сеанс");
    tg.MainButton.show();
    tg.MainButton.onClick(bookSession);
  } else {
    Logger.info("SIMULATOR_INITIALIZED");
  }

  renderCatalog();
  renderWorkSteps();
  renderFaq();
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

function renderWorkSteps() {
  const grid = document.getElementById("work-steps-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const workSteps = [
    {
      title: "Оставление заявки",
      text: "Оставьте заявку на сайте и укажите предпочтительный способ связи. Я свяжусь с вами для короткого знакомства и обсуждения вашей ситуации. Также вы можете связаться со мной напрямую — все контакты указаны в форме обратной связи."
    },
    {
      title: "Предварительная беседа",
      text: "Предварительная беседа, на которой мы разбираем ваш запрос, проверяем отсутствие противопоказаний и подбираем метод работы."
    },
    {
      title: "Подготовка к сеансу",
      text: "Перед сеансом я дам вам краткую инструкцию по подготовке. Она поможет организовать комфортное пространство, исключить отвлекающие факторы и настроиться на работу."
    },
    {
      title: "Проведение сеанса",
      text: "Сеанс проходит онлайн. Вы остаетесь в привычной домашней обстановке, где вас ничто не тревожит, — это идеальные условия для безопасного погружения и эффективной работы с глубинными слоями психики."
    },
    {
      title: "Поддержка",
      text: "После сеанса мы обсуждаем результаты, и я высылаю вам полную аудиозапись нашей работы. Я даю рекомендации по дальнейшим шагам и обязательно остаюсь на связи, чтобы поддержать вас в процессе интеграции нового опыта."
    },
    {
      title: "Продолжение работы",
      text: "Если ваш запрос был комплексным и требует системной работы, мы планируем дальнейший план сеансов для полного освобождения от эмоциональных травм."
    }
  ];

  workSteps.forEach((step, idx) => {
    const card = document.createElement("div");
    card.style.display = "flex";
    card.style.flexDirection = "column";
    card.style.gap = "8px";
    card.style.padding = "16px";
    card.style.backgroundColor = "var(--tg-theme-bg-color, rgba(255, 255, 255, 0.05))";
    card.style.borderRadius = "20px";
    card.style.border = "1px solid rgba(128, 128, 128, 0.1)";
    card.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.05)";

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.justifyContent = "space-between";

    const titleSpan = document.createElement("span");
    titleSpan.style.fontSize = "14px";
    titleSpan.style.fontWeight = "bold";
    titleSpan.style.color = "var(--tg-theme-text-color, #ffffff)";
    titleSpan.innerText = step.title;

    const numSpan = document.createElement("span");
    numSpan.style.fontSize = "24px";
    numSpan.style.fontWeight = "900";
    numSpan.style.color = "var(--tg-theme-hint-color, #aab2bd)";
    numSpan.style.opacity = "0.2";
    numSpan.innerText = String(idx + 1).padStart(2, "0");

    header.appendChild(titleSpan);
    header.appendChild(numSpan);

    const descP = document.createElement("p");
    descP.style.fontSize = "13px";
    descP.style.color = "var(--tg-theme-hint-color, #aab2bd)";
    descP.style.lineHeight = "1.5";
    descP.style.margin = "0";
    descP.innerText = step.text;

    card.appendChild(header);
    card.appendChild(descP);

    grid.appendChild(card);
  });
}

function renderFaq() {
  const faqList = document.getElementById("faq-list");
  if (!faqList) return;
  faqList.innerHTML = "";

  const faqs = [
    {
      q: "Требуется ли специальная подготовка к сеансу?",
      a: "Особых действий не требуется. Достаточно найти уединенное место, где вас не потревожат, и убедиться в хорошем качестве интернет-соединения."
    },
    {
      q: "Условия оплаты сеансов",
      a: "Я работаю по полной предоплате. Она вносится за сутки до назначенного времени, чтобы закрепить место за вами."
    },
    {
      q: "Возможен ли перенос или отмена сеанса?",
      a: "Вы можете перенести сеанс без финансовых потерь, предупредив меня хотя бы за сутки. Если отмена происходит менее чем за 24 часа, удерживается 50% оплаты."
    },
    {
      q: "Какова продолжительность одного сеанса?",
      a: "Предварительная беседа длится около 30 минут, регрессии в прошлые жизни и общение с Высшим Я занимают по 2–3 часа. Сеанс гипнотерапии длится до 2 часов, а глубокая энергетическая работа может занять от полутора до четырех часов."
    },
    {
      q: "Насколько конфиденциальны наши встречи?",
      a: "Я строго соблюдаю профессиональную этику. Все подробности сеанса остаются строго между нами."
    },
    {
      q: "Совместимы ли сеансы с медикаментозным лечением?",
      a: "Психологическая работа и гипнотерапия являются эффективным дополнением к основному лечению. Обращаю ваше внимание, что терапия не заменяет и не отменяет курс препаратов, назначенный вашим лечащим врачом. Самостоятельный отказ от медикаментов или изменение их дозировки недопустимы."
    },
    {
      q: "А вдруг я не поддаюсь гипнозу?",
      a: "Подавляющее большинство людей способны входить в трансовые состояния. Чтобы развеять сомнения, мы проверим вашу восприимчивость уже на первой предварительной встрече."
    }
  ];

  let expandedIndex = 0;

  const renderItems = () => {
    faqList.innerHTML = "";
    faqs.forEach((faq, index) => {
      const isExpanded = expandedIndex === index;
      
      const itemDiv = document.createElement("div");
      itemDiv.style.backgroundColor = "var(--tg-theme-bg-color, rgba(255, 255, 255, 0.05))";
      itemDiv.style.borderRadius = "20px";
      itemDiv.style.border = "1px solid rgba(128, 128, 128, 0.1)";
      itemDiv.style.overflow = "hidden";

      const btn = document.createElement("button");
      btn.style.width = "100%";
      btn.style.textAlign = "left";
      btn.style.padding = "20px";
      btn.style.display = "flex";
      btn.style.alignItems = "flex-start";
      btn.style.justifyContent = "space-between";
      btn.style.gap = "16px";
      btn.style.background = "none";
      btn.style.border = "none";
      btn.style.cursor = "pointer";
      btn.style.outline = "none";

      const qSpan = document.createElement("span");
      qSpan.style.fontSize = "14px";
      qSpan.style.fontWeight = "bold";
      qSpan.style.color = "var(--tg-theme-text-color, #ffffff)";
      qSpan.style.paddingRight = "16px";
      qSpan.innerText = faq.q;

      const iconDiv = document.createElement("div");
      iconDiv.style.width = "24px";
      iconDiv.style.height = "24px";
      iconDiv.style.flexShrink = "0";
      iconDiv.style.borderRadius = "50%";
      iconDiv.style.display = "flex";
      iconDiv.style.alignItems = "center";
      iconDiv.style.justifyContent = "center";
      iconDiv.style.border = "1px solid";
      
      if (isExpanded) {
        iconDiv.style.backgroundColor = "rgba(16, 185, 129, 0.1)";
        iconDiv.style.borderColor = "rgba(16, 185, 129, 0.2)";
        iconDiv.style.color = "var(--tg-theme-link-color, #10b981)";
        iconDiv.innerHTML = `<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" /></svg>`;
      } else {
        iconDiv.style.backgroundColor = "rgba(128, 128, 128, 0.05)";
        iconDiv.style.borderColor = "rgba(128, 128, 128, 0.1)";
        iconDiv.style.color = "var(--tg-theme-hint-color, #aab2bd)";
        iconDiv.innerHTML = `<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>`;
      }

      btn.appendChild(qSpan);
      btn.appendChild(iconDiv);
      
      btn.addEventListener("click", () => {
        expandedIndex = isExpanded ? null : index;
        renderItems();
      });

      itemDiv.appendChild(btn);

      if (isExpanded) {
        const aDiv = document.createElement("div");
        aDiv.style.padding = "0 20px 20px 20px";
        aDiv.style.fontSize = "13px";
        aDiv.style.color = "var(--tg-theme-hint-color, #aab2bd)";
        aDiv.style.lineHeight = "1.6";
        aDiv.innerText = faq.a;
        itemDiv.appendChild(aDiv);
      }

      faqList.appendChild(itemDiv);
    });
  };

  renderItems();
}

// Открытие страницы детального описания сеанса
function showDetail(session) {
  curSession = session;

  // Визуальное переключение экранов
  document.getElementById("shop-header").classList.add("hidden");
  document.getElementById("catalog-grid").classList.add("hidden");
  const workStepsSection = document.getElementById("work-steps-section");
  if (workStepsSection) workStepsSection.classList.add("hidden");
  const contraindicationsSection = document.getElementById("contraindications-section");
  if (contraindicationsSection) contraindicationsSection.classList.add("hidden");
  const faqSection = document.getElementById("faq-section");
  if (faqSection) faqSection.classList.add("hidden");
  const catalogActionBar = document.getElementById("catalog-action-bar");
  if (catalogActionBar) catalogActionBar.classList.add("hidden");
  const catalogBottomSpacer = document.getElementById("catalog-bottom-spacer");
  if (catalogBottomSpacer) catalogBottomSpacer.classList.add("hidden");
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
  
  const extraBlocksContainer = document.getElementById("extra-blocks-container");
  if (session.extraBlocks && session.extraBlocks.length > 0) {
    extraBlocksContainer.innerHTML = session.extraBlocks.map(block => {
      if (block.type === 'steps' && block.steps) {
        return `
        <div class="info-card step-card" style="margin-top: 16px;">
          <h3 class="section-title-normal" style="margin-bottom: 14px; font-weight: 700; display: flex; align-items: flex-start; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-link-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 2px; flex-shrink: 0;"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
            ${block.title}
          </h3>
          <div class="steps-timeline">
            ${block.steps.map((step, idx) => {
              let lineHTML = '';
              if (block.steps.length > 1) {
                if (idx === 0) {
                  lineHTML = '<div class="step-line-first"></div>';
                } else if (idx === block.steps.length - 1) {
                  lineHTML = '<div class="step-line-last"></div>';
                } else {
                  lineHTML = '<div class="step-line-middle"></div>';
                }
              }
              return `
              <div class="timeline-step">
                <div class="step-left">
                  ${lineHTML}
                  <div class="step-num">${idx + 1}</div>
                </div>
                <p class="step-text">${step}</p>
              </div>`;
            }).join('')}
          </div>
        </div>
        `;
      }

      let svgIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-link-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 2px; flex-shrink: 0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
      if (block.icon === 'help') {
        svgIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-link-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 2px; flex-shrink: 0;"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      } else if (block.icon === 'check') {
        svgIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-link-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 2px; flex-shrink: 0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
      }
      return `
      <div class="info-card" style="margin-top: 16px;">
        ${block.title ? `
        <h3 class="section-title-normal" style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;">
          ${svgIcon}
          ${block.title}
        </h3>` : ''}
        ${block.text ? `<p style="font-size: 12px; line-height: 1.65; color: var(--tg-theme-text-color); white-space: pre-wrap; margin-bottom: ${block.list ? '8px' : '0'}; opacity: 0.9;">${block.text}</p>` : ''}
        ${block.list && block.list.length > 0 ? `
          <ul style="padding-left: 16px; margin: 0; font-size: 12px; line-height: 1.65; color: var(--tg-theme-text-color); opacity: 0.9;">
            ${block.list.map(li => `<li style="margin-bottom: 6px; padding-left: 4px;">${li}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `;
    }).join('');
  } else {
    extraBlocksContainer.innerHTML = '';
  }
  
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
  const benefitsCard = document.getElementById("benefits-card");
  if (session.benefits && session.benefits.length > 0) {
    if (benefitsCard) benefitsCard.classList.remove("hidden");
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
      const div = document.createElement("div");
      div.style.display = "flex";
      div.style.alignItems = "flex-start";
      div.style.gap = "12px";
      div.style.padding = "16px";
      div.style.backgroundColor = "var(--tg-theme-bg-color, rgba(255, 255, 255, 0.05))";
      div.style.borderRadius = "20px";
      div.style.border = "1px solid rgba(128, 128, 128, 0.1)";
      div.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.05)";
      
      div.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-link-color, #10b981)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <span style="font-size: 13px; line-height: 1.4; opacity: 0.9; color: var(--tg-theme-text-color, #ffffff);">${benefit}</span>
      `;
      benefitsList.appendChild(div);
    });
  } else {
    if (benefitsCard) benefitsCard.classList.add("hidden");
  }

  // Набивка структуры таймлайна (этапы)
  const stepCard = document.querySelector(".step-card");
  if (session.longInfo && session.longInfo.steps && session.longInfo.steps.length > 0) {
    if (stepCard) stepCard.classList.remove("hidden");
    const stepsSectionTitle = document.getElementById("steps-section-title");
    stepsSectionTitle.innerText = session.longInfo.sectionTitle || "";
    if (!session.longInfo.sectionTitle) {
      stepsSectionTitle.style.display = "none";
    } else {
      stepsSectionTitle.style.display = "block";
    }
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
    
    const stepsListTitle = document.getElementById("steps-list-title");
    if (session.longInfo.stepsTitle) {
      stepsListTitle.innerText = session.longInfo.stepsTitle;
      stepsListTitle.style.display = "block";
    } else {
      stepsListTitle.style.display = "none";
    }

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
  } else {
    if (stepCard) stepCard.classList.add("hidden");
  }

  // Установка предупреждения (скрыто по просьбе пользователя)
  const warnBox = document.getElementById("warning-box");
  if (warnBox) {
    warnBox.classList.add("hidden");
  }

  // Populate indications
  const indicationsCard = document.getElementById("indications-card");
  if (session.indications) {
    indicationsCard.classList.remove("hidden");
    document.getElementById("indications-title").innerText = session.indications.title;
    const indicationsDesc = document.getElementById("indications-desc");
    if (session.indications.description) {
      indicationsDesc.innerText = session.indications.description;
      indicationsDesc.style.display = "block";
    } else {
      indicationsDesc.style.display = "none";
    }
    const indicationsGrid = document.getElementById("indications-grid");
    indicationsGrid.innerHTML = "";
    session.indications.items.forEach((item) => {
      const div = document.createElement("div");
      div.style.display = "flex";
      div.style.alignItems = "flex-start";
      div.style.gap = "12px";
      div.style.padding = "16px";
      div.style.backgroundColor = "var(--tg-theme-bg-color, rgba(255, 255, 255, 0.05))";
      div.style.borderRadius = "20px";
      div.style.border = "1px solid rgba(128, 128, 128, 0.1)";
      div.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.05)";
      
      const iconSvg = session.indications.icon === "zap" 
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-link-color, #10b981)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-link-color, #10b981)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;

      div.innerHTML = `
        ${iconSvg}
        <span style="font-size: 13px; line-height: 1.4; opacity: 0.9; color: var(--tg-theme-text-color, #ffffff);">${item}</span>
      `;
      indicationsGrid.appendChild(div);
    });
  } else {
    if (indicationsCard) indicationsCard.classList.add("hidden");
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
  const workStepsSection = document.getElementById("work-steps-section");
  if (workStepsSection) workStepsSection.classList.remove("hidden");
  const contraindicationsSection = document.getElementById("contraindications-section");
  if (contraindicationsSection) contraindicationsSection.classList.remove("hidden");
  const faqSection = document.getElementById("faq-section");
  if (faqSection) faqSection.classList.remove("hidden");
  const catalogActionBar = document.getElementById("catalog-action-bar");
  if (catalogActionBar) catalogActionBar.classList.remove("hidden");
  const catalogBottomSpacer = document.getElementById("catalog-bottom-spacer");
  if (catalogBottomSpacer) catalogBottomSpacer.classList.remove("hidden");

  if (tg?.HapticFeedback && typeof tg.isVersionAtLeast === 'function' && tg.isVersionAtLeast('6.1')) {
    tg.HapticFeedback.impactOccurred("light");
  }

  // Выключение нативных кнопок
  if (tg) {
    tg.BackButton.hide();
    tg.BackButton.offClick(hideDetail);
    
    tg.MainButton.setText("Записаться на сеанс");
    tg.MainButton.show();
    tg.MainButton.offClick(bookSession);
    tg.MainButton.onClick(bookSession);
  }
}

// Алгоритм бронирования сеанса
function bookSession() {
  const sessionId = curSession ? curSession.id : "catalog";
  const sessionPrice = curSession ? curSession.price : 0;
  const sessionTitle = curSession ? curSession.title : "catalog";

  Logger.trackClick(curSession ? `booking_btn_${sessionId}` : "catalog_booking_btn", {
    sessionId: sessionId,
    sessionPrice: sessionPrice
  });

  if (tg?.HapticFeedback && typeof tg.isVersionAtLeast === 'function' && tg.isVersionAtLeast('6.1')) {
    tg.HapticFeedback.notificationOccurred("success");
  }

  Logger.trackConversion("TMA_BOOKING_LINK_OPEN", sessionPrice, {
    sessionId: sessionId,
    sessionTitle: sessionTitle
  });
  if (tg && typeof tg.openTelegramLink === 'function') {
    tg.openTelegramLink("https://t.me/meta_manoir");
  } else {
    window.open("https://t.me/meta_manoir", "_blank");
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
