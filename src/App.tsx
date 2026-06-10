import React, { useState, useEffect } from "react";
import { 
  sessions, 
  Session 
} from "./data";
import { 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Compass, 
  Eye, 
  ShieldCheck, 
  MessageCircle, 
  ArrowLeft, 
  Moon, 
  Sun, 
  Info, 
  DollarSign,
  Heart,
  Calendar,
  Share2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AnalyticalLogger from "./logger";

// Get Telegram WebApp object
const tg = (window as any).Telegram?.WebApp;

export default function App() {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isTelegram, setIsTelegram] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);

  // Initialize Telegram WebApp configuration
  useEffect(() => {
    AnalyticalLogger.info("APP_STARTUP", {
      url: window.location.href,
      userAgent: navigator.userAgent
    });

    if (tg) {
      setIsTelegram(true);
      tg.ready();
      tg.expand();
      
      // Sync initial theme
      const tgTheme = tg.colorScheme || "light";
      setThemeMode(tgTheme);
      updateRootTheme(tgTheme);

      AnalyticalLogger.info("TMA_INITIALIZED", {
        user: tg.initDataUnsafe?.user,
        startParam: tg.initDataUnsafe?.start_param,
        chatType: tg.initDataUnsafe?.chat_type,
        theme: tgTheme
      });

      // Handle Telegram Theme changes on-the-fly
      const handleThemeChange = () => {
        const currentTheme = tg.colorScheme || "light";
        setThemeMode(currentTheme);
        updateRootTheme(currentTheme);
        AnalyticalLogger.info("THEME_CHANGED", { theme: currentTheme });
      };
      
      tg.onEvent("themeChanged", handleThemeChange);
      return () => {
        tg.offEvent("themeChanged", handleThemeChange);
      };
    } else {
      // Out of Telegram simulation defaults
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = systemPrefersDark ? "dark" : "light";
      setThemeMode(initialTheme);
      updateRootTheme(initialTheme);
      AnalyticalLogger.info("SIMULATOR_INITIALIZED", { theme: initialTheme });
    }
  }, []);

  // Update root element configuration class
  const updateRootTheme = (theme: "light" | "dark") => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("theme-dark");
    } else {
      root.classList.remove("theme-dark");
    }
  };

  // Toggle theme simulator manually (for non-Telegram developers)
  const toggleTheme = () => {
    const nextTheme = themeMode === "light" ? "dark" : "light";
    setThemeMode(nextTheme);
    updateRootTheme(nextTheme);
    
    // Attempt haptic click
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred("light");
    }
  };

  // Setup/Tear down Telegram BackButton & MainButton when navigating
  useEffect(() => {
    if (!tg) return;

    if (selectedSession) {
      // Configure Native Telegram Back Button
      tg.BackButton.show();
      const onBackClick = () => {
        handleBack();
      };
      tg.BackButton.onClick(onBackClick);

      // Configure Native Telegram Main Button
      tg.MainButton.setText(`Забронировать сеанс (${selectedSession.price.toLocaleString("ru-RU")} ₽)`);
      tg.MainButton.show();
      
      const onMainClick = () => {
        handleBooking(selectedSession);
      };
      tg.MainButton.onClick(onMainClick);

      return () => {
        tg.BackButton.hide();
        tg.BackButton.offClick(onBackClick);
        tg.MainButton.hide();
        tg.MainButton.offClick(onMainClick);
      };
    } else {
      tg.BackButton.hide();
      tg.MainButton.hide();
    }
  }, [selectedSession]);

  const handleSessionClick = (session: Session) => {
    AnalyticalLogger.trackClick(`session_card_${session.id}`, {
      sessionId: session.id,
      sessionTitle: session.title,
      sessionPrice: session.price
    });
    AnalyticalLogger.trackNavigation("catalog_list", "session_details", {
      targetSessionId: session.id,
      targetSessionTitle: session.title
    });

    setSelectedSession(session);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Native Telegram Haptic impact
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred("medium");
    }
  };

  const handleBack = () => {
    if (selectedSession) {
      AnalyticalLogger.trackClick("back_button", {
        lastViewedSessionId: selectedSession.id,
        lastViewedSessionTitle: selectedSession.title
      });
      AnalyticalLogger.trackNavigation("session_details", "catalog_list", {
        fromSessionId: selectedSession.id
      });
    }

    setSelectedSession(null);
    setBookingStatus(null);
    
    // Native Telegram Haptic impact
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred("light");
    }
  };

  const handleBooking = (session: Session) => {
    AnalyticalLogger.trackClick(`booking_btn_${session.id}`, {
      sessionId: session.id,
      sessionPrice: session.price
    });

    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred("success");
    }

    if (tg) {
      // Build interactive popup in Telegram
      AnalyticalLogger.info("BOOKING_POPUP_SHOWN", {
        sessionId: session.id,
        sessionPrice: session.price
      });

      tg.showPopup({
        title: "Подтверждение бронирования",
        message: `Вы выбрали сеанс «${session.title}». Нажмите продолжить, чтобы связаться с мастером в личных сообщениях для выбора даты.`,
        buttons: [
          { id: "ok", type: "default", text: "Связаться в Telegram" },
          { id: "cancel", type: "cancel", text: "Отмена" }
        ]
      }, (buttonId: string) => {
        AnalyticalLogger.info("BOOKING_POPUP_ACTION", {
          actionId: buttonId,
          sessionId: session.id
        });

        if (buttonId === "ok") {
          AnalyticalLogger.trackConversion("TMA_BOOKING_LINK_OPEN", session.price, {
            sessionId: session.id,
            sessionTitle: session.title
          });
          // Open direct chat
          tg.openTelegramLink("https://t.me/your_telegram_username");
        } else {
          AnalyticalLogger.info("BOOKING_CANCELLED", {
            sessionId: session.id
          });
        }
      });
    } else {
      // In-app alert fallback inside browser preview
      AnalyticalLogger.trackConversion("WEB_SIMULATOR_BOOKING_COMMITTED", session.price, {
        sessionId: session.id,
        sessionTitle: session.title
      });
      setBookingStatus(session.title);
    }
  };

  // Helper to render decorative thematic SVGs for each card
  const renderSessionSvg = (id: string) => {
    switch (id) {
      case "past-lives": // Blue/purple spiral portal, galaxy, hourglass
        return (
          <svg className="w-full h-full object-cover opacity-80" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="url(#bg-past-lives)" />
            <circle cx="100" cy="100" r="85" stroke="#818cf8" strokeWidth="1" strokeDasharray="4 4" className="animate-[spin_120s_linear_infinite]" />
            <circle cx="100" cy="100" r="65" stroke="#a78bfa" strokeWidth="0.5" strokeDasharray="10 5" className="animate-[spin_40s_linear_infinite_reverse]" />
            <path d="M100 15C53.6 15 15 53.6 15 100s38.6 85 85 85 85-38.6 85-85S146.4 15 100 15zm0 152c-37 0-67-30-67-67s30-67 67-67 67 30 67 67-30 67-67 67z" fill="#4f46e5" fillOpacity="0.15" />
            
            {/* Hourglass and stars */}
            <path d="M75 60h50v5L108 95l17 30v5H75v-5l17-30-17-30v-5zm3 5l16 28.5L78 125h44l-16-31.5L122 65H78z" fill="#f472b6" fillOpacity="0.6" className="animate-pulse" />
            <circle cx="100" cy="95" r="3" fill="#cbd5e1" />
            <path d="M100 65v30l-15 15m15-15l15 15" stroke="#f472b6" strokeWidth="1.5" />
            <path d="M90 120a10 5 0 0120 0H90z" fill="#a78bfa" />
            
            <defs>
              <linearGradient id="bg-past-lives" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1e1b4b" />
                <stop offset="0.5" stopColor="#311042" />
                <stop offset="1" stopColor="#090514" />
              </linearGradient>
            </defs>
          </svg>
        );
      case "hypnotherapy": // Spiral eye, soothing deep blue/teal concentric waves
        return (
          <svg className="w-full h-full object-cover opacity-85" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="url(#bg-hypnotherapy)" />
            {/* Soothing Concentric Hypnotic Waves */}
            <circle cx="100" cy="100" r="80" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.2" />
            <circle cx="100" cy="100" r="60" stroke="#0d9488" strokeWidth="1.5" strokeOpacity="0.3" className="animate-[pulse_4s_ease-in-out_infinite]" />
            <circle cx="100" cy="100" r="40" stroke="#2dd4bf" strokeWidth="2" strokeOpacity="0.5" />
            <circle cx="100" cy="100" r="20" stroke="#67e8f9" strokeWidth="1" strokeDasharray="2 2" className="animate-[spin_10s_linear_infinite]" />
            
            {/* Abstract Sleeping Mind Eye Icon */}
            <path d="M40 100c14-25 106-25 120 0-14 25-106 25-120 0z" stroke="#2dd4bf" strokeWidth="2" />
            <circle cx="100" cy="100" r="16" stroke="#2dd4bf" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="8" fill="#06b6d4" className="animate-pulse" />
            {/* Eyelashes represented symmetrically */}
            <path d="M60 84l-4-8M80 80l-2-9M100 78v-10M120 80l2-9M140 84l4-8" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round" />
            
            <defs>
              <linearGradient id="bg-hypnotherapy" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                <stop stopColor="#042f2e" />
                <stop offset="0.6" stopColor="#083344" />
                <stop offset="1" stopColor="#021526" />
              </linearGradient>
            </defs>
          </svg>
        );
      case "higher-self": // Divine geometric star, golden/violet crown portal
        return (
          <svg className="w-full h-full object-cover opacity-85" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="url(#bg-higher-self)" />
            {/* Golden Starburst Rays */}
            <g className="animate-[spin_80s_linear_infinite]">
              <line x1="100" y1="20" x2="100" y2="180" stroke="#f59e0b" strokeWidth="0.5" strokeOpacity="0.4" />
              <line x1="20" y1="100" x2="180" y2="100" stroke="#f59e0b" strokeWidth="0.5" strokeOpacity="0.4" />
              <line x1="43.4" y1="43.4" x2="156.6" y2="156.6" stroke="#f59e0b" strokeWidth="0.5" strokeOpacity="0.3" />
              <line x1="156.6" y1="43.4" x2="43.4" y2="156.6" stroke="#f59e0b" strokeWidth="0.5" strokeOpacity="0.3" />
            </g>

            {/* Sacred Lotus/Merkaba Shape */}
            <polygon points="100,50 115,85 150,100 115,115 100,150 85,115 50,100 85,85" fill="#f59e0b" fillOpacity="0.15" stroke="#fbbf24" strokeWidth="1.5" />
            <polygon points="100,70 110,90 130,100 110,110 100,130 90,110 70,100 90,90" fill="#a78bfa" fillOpacity="0.25" stroke="#c084fc" strokeWidth="1" />
            
            <circle cx="100" cy="100" r="12" fill="url(#golden-core)" className="animate-pulse" />
            <circle cx="100" cy="100" r="30" stroke="#fbbf24" strokeWidth="1" strokeDasharray="6 3" />
            
            <defs>
              <linearGradient id="bg-higher-self" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1e1b4b" />
                <stop offset="0.5" stopColor="#451a03" />
                <stop offset="1" stopColor="#1a042e" />
              </linearGradient>
              <radialGradient id="golden-core" cx="50%" cy="50%" r="50%">
                <stop stopColor="#fffbeb" />
                <stop offset="1" stopColor="#f59e0b" />
              </radialGradient>
            </defs>
          </svg>
        );
      case "energy-cleansing": // Emerald crystal energy flow, shield and spark
        return (
          <svg className="w-full h-full object-cover opacity-85" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="url(#bg-energy-cleansing)" />
            {/* Energy Fields */}
            <circle cx="100" cy="100" r="75" stroke="#10b981" strokeWidth="0.75" strokeDasharray="8 4" className="animate-[spin_30s_linear_infinite]" />
            <circle cx="100" cy="100" r="55" stroke="#059669" strokeWidth="1" />
            
            {/* Flowing Clean Aura spark/crystal */}
            <g transform="translate(100, 100) scale(1.1)">
              <path d="M0 -45 L35 0 L0 45 L-35 0 Z" fill="#047857" fillOpacity="0.2" stroke="#34d399" strokeWidth="1.5" />
              <path d="M0 -45 L15 0 L0 45 L-15 0 Z" fill="#10b981" fillOpacity="0.2" stroke="#6ee7b7" strokeWidth="1" />
              <line x1="-35" y1="0" x2="35" y2="0" stroke="#a7f3d0" strokeWidth="0.75" strokeOpacity="0.5" />
              <line x1="0" y1="-45" x2="0" y2="45" stroke="#a7f3d0" strokeWidth="0.75" strokeOpacity="0.5" />
            </g>
            
            {/* Small Sparkles */}
            <circle cx="50" cy="60" r="2" fill="#a7f3d0" className="animate-ping" />
            <circle cx="150" cy="70" r="1.5" fill="#a7f3d0" className="animate-pulse" />
            <circle cx="140" cy="140" r="2.5" fill="#a7f3d0" className="animate-pulse" />
            <circle cx="65" cy="135" r="1.5" fill="#a7f3d0" className="animate-ping" />

            <defs>
              <linearGradient id="bg-energy-cleansing" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                <stop stopColor="#022c22" />
                <stop offset="0.6" stopColor="#064e3b" />
                <stop offset="1" stopColor="#011b13" />
              </linearGradient>
            </defs>
          </svg>
        );
      default:
        return null;
    }
  };

  const getSessionIcon = (id: string, size = "w-6 h-6") => {
    switch (id) {
      case "past-lives":
        return <Compass className={`${size} text-indigo-400`} id="icon-compass" />;
      case "hypnotherapy":
        return <Eye className={`${size} text-teal-400`} id="icon-eye" />;
      case "higher-self":
        return <Sparkles className={`${size} text-amber-400`} id="icon-sparkles" />;
      case "energy-cleansing":
        return <ShieldCheck className={`${size} text-emerald-400`} id="icon-shield" />;
      default:
        return <Sparkles className={`${size} text-indigo-400`} />;
    }
  };

  return (
    <div className="min-h-screen pb-24 relative select-none bg-[var(--tg-theme-secondary-bg-color)] transition-colors duration-300">
      
      {/* Background ambient lighting glows for high-end aesthetic */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 transition-colors duration-300">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[50%] rounded-full glow-bg"
             style={{ 
               background: selectedSession 
                 ? `radial-gradient(circle, ${selectedSession.gradientFrom} 0%, rgba(255,255,255,0) 70%)`
                 : "radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(255,255,255,0) 70%)" 
             }} />
        <div className="absolute top-[40%] -right-[15%] w-[70%] h-[60%] rounded-full glow-bg"
             style={{ 
               background: selectedSession 
                 ? `radial-gradient(circle, ${selectedSession.gradientTo} 0%, rgba(255,255,255,0) 70%)` 
                 : "radial-gradient(circle, rgba(236,72,153,0.08) 0%, rgba(255,255,255,0) 70%)" 
             }} />
      </div>

      {/* Main Container */}
      <div className="max-w-md mx-auto px-4 pt-5 pb-10" id="tma-container">
        
        {/* SHOP HEADER */}
        {!selectedSession && (
          <header className="bg-[var(--tg-theme-bg-color)] p-6 rounded-3xl border border-black/5 dark:border-white/5 flex flex-col justify-between items-center text-center mb-6 shadow-sm relative overflow-hidden" id="main-header">
            <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-indigo-500/90 font-bold px-3 py-1 bg-[var(--tg-theme-secondary-bg-color)] rounded-full mb-3" id="badge-main">
              ✨ Каталог услуг
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--tg-theme-text-color)]" id="title-main">
              Сеансы и цены
            </h1>
            <p className="text-xs text-[var(--tg-theme-hint-color)] mt-2 max-w-xs mx-auto leading-relaxed" id="desc-main">
              Профессиональные практики регрессии, гипнотерапии и энергоинформационного исцеления
            </p>
          </header>
        )}

        {/* DETAILS PAGE OR CATALOG GRID */}
        <AnimatePresence mode="wait">
          {!selectedSession ? (
            
            /* CATALOG LIST VIEW */
            <motion.div
              key="list-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
              id="catalog-grid"
            >
              {sessions.map((session, idx) => (
                <article
                  id={`item-card-${session.id}`}
                  key={session.id}
                  onClick={() => handleSessionClick(session)}
                  className="card group relative rounded-3xl overflow-hidden shadow-sm active:scale-[0.98] transition-all duration-300"
                >
                  {/* Photo Space Placeholder with customized high-quality spiritual SVG */}
                  <div className="h-44 w-full relative overflow-hidden" id={`placeholder-photo-${session.id}`}>
                    {renderSessionSvg(session.id)}
                    
                    {/* Dark/Gradient Vignette Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Category Label */}
                    <span className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono font-medium tracking-wide text-neutral-200 border border-white/10 uppercase flex items-center gap-1.5">
                      {session.symbol} Духовная практика
                    </span>

                    {/* Price Tag badge inside image */}
                    <div className="absolute bottom-3 right-3 bg-indigo-600/90 backdrop-blur-md px-3.5 py-1 rounded-xl border border-white/20 text-white font-semibold text-sm price-tag">
                      {session.price.toLocaleString("ru-RU")} ₽
                    </div>

                    {/* Floating Duration badge inside image */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs font-medium text-neutral-250 text-white/90">
                      <Clock className="w-3.5 h-3.5 text-white/80" /> {session.duration}
                    </div>
                  </div>

                  {/* Card Content Description info */}
                  <div className="p-4 relative">
                    <div className="flex items-center gap-2 mb-1">
                      {getSessionIcon(session.id, "w-4 h-4")}
                      <h2 className="text-xl font-bold font-display text-[var(--tg-theme-text-color)] group-hover:text-[var(--tg-theme-link-color)] transition-colors" id={`title-${session.id}`}>
                        {session.title}
                      </h2>
                    </div>
                    
                    <p className="text-xs text-[var(--tg-theme-hint-color)] leading-relaxed mt-2 line-clamp-2">
                      {session.shortDesc}
                    </p>

                    <div className="mt-4 pt-3 border-t border-neutral-200/30 dark:border-neutral-800/30 flex justify-between items-center">
                      <span className="text-[10px] font-mono text-[var(--tg-theme-hint-color)] uppercase tracking-wider">
                        Нажмите для подробностей
                      </span>
                      <span className="text-[var(--tg-theme-link-color)] text-xs font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Подробнее &rarr;
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </motion.div>

          ) : (
            
            /* SESSION DETAILS VIEW */
            <motion.div
              key="detail-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
              id="detail-container"
            >
              {/* Back Link navigation (for desktop/browser simulation fallback) */}
              {!isTelegram && (
                <button
                  id="btn-back-browser"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--tg-theme-link-color)] hover:opacity-80 hover:scale-105 active:scale-95 transition-all p-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Назад в каталог
                </button>
              )}

              {/* Cover visual Banner with rich SVG artwork */}
              <div className="relative h-56 rounded-3xl overflow-hidden border border-neutral-200/40 dark:border-neutral-800/40 shadow-md">
                {renderSessionSvg(selectedSession.id)}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                {/* Floating symbol and quick info */}
                <span className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-mono font-medium tracking-wide text-white border border-white/10 uppercase">
                  {selectedSession.symbol} {selectedSession.title}
                </span>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    {getSessionIcon(selectedSession.id, "w-5 h-5")}
                    <h2 className="text-2xl font-extrabold font-display leading-tight">
                      {selectedSession.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/90">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {selectedSession.duration}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    <span className="font-semibold text-amber-300">
                      Личный сеанс онлайн
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking fallbacks check inside standard browsers */}
              {bookingStatus && (
                <div id="booking-alert-box" className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-[var(--tg-theme-text-color)]">Запрос на бронирование отправлен!</h4>
                      <p className="text-[var(--tg-theme-hint-color)] mt-1">
                        Для согласования времени свяжитесь с психотерапевтом в Telegram:
                      </p>
                      <a href="https://t.me/your_telegram_username" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-indigo-400 font-bold mt-2 hover:underline">
                        <MessageCircle className="w-3.5 h-3.5" /> @your_telegram_username
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Block and description card */}
              <div className="card p-5 rounded-3xl shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-200/50 dark:border-neutral-800/15">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--tg-theme-hint-color)]">Стоимость</span>
                    <p className="text-2xl font-bold price-tag">{selectedSession.price.toLocaleString("ru-RU")} ₽</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--tg-theme-hint-color)]">Длительность</span>
                    <p className="text-sm font-medium text-[var(--tg-theme-text-color)] mt-1 flex items-center gap-1 justify-end">
                      <Clock className="w-4 h-4 text-[var(--tg-theme-link-color)]" /> {selectedSession.duration}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--tg-theme-hint-color)] block">О сеансе</span>
                  <p className="text-xs text-[var(--tg-theme-text-color)] leading-relaxed">
                    {selectedSession.fullDesc}
                  </p>
                </div>
              </div>

              {/* WHAT CLIENT GETS (Benefits) */}
              <div className="card p-5 rounded-3xl shadow-sm space-y-3">
                <h3 className="text-sm font-bold tracking-tight text-[var(--tg-theme-text-color)] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Результаты сеанса:
                </h3>
                <ul className="space-y-2.5 text-xs text-[var(--tg-theme-text-color)]" id="benefits-list">
                  {selectedSession.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-500 text-sm mt-0.5 shrink-0">✦</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* DETAILED WORKFLOW IN SESSION (Steps) */}
              <div className="card p-5 rounded-3xl shadow-sm space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[var(--tg-theme-text-color)]">
                    {selectedSession.longInfo.sectionTitle}
                  </h3>
                  <p className="text-xs text-[var(--tg-theme-hint-color)] leading-relaxed">
                    {selectedSession.longInfo.sectionText}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold text-[var(--tg-theme-text-color)]">
                    {selectedSession.longInfo.stepsTitle}
                  </h4>
                  <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[rgba(36,129,204,0.2)]">
                    {selectedSession.longInfo.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-3 pl-1 items-start relative">
                        <div className="w-4 h-4 rounded-full bg-[var(--tg-theme-secondary-bg-color)] border border-[var(--tg-theme-link-color)] text-[10px] font-bold text-[var(--tg-theme-link-color)] flex items-center justify-center shrink-0 mt-0.5 z-10">
                          {idx + 1}
                        </div>
                        <p className="text-xs text-[var(--tg-theme-text-color)] leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedSession.longInfo.warningText && (
                  <div className="mt-2 p-3 rounded-xl bg-amber-500/5 text-[10px] text-amber-500/90 border border-amber-500/20 leading-normal flex gap-1.5 font-sans">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{selectedSession.longInfo.warningText}</span>
                  </div>
                )}
              </div>

               {/* Desktop / browser Simulation booking Button.
                  (Hidden if inside Telegram since Telegram's native MainButton takes this job) */}
              {!isTelegram && (
                <div className="pt-2">
                  <button
                    id="btn-book-browser"
                    onClick={() => handleBooking(selectedSession)}
                    className="w-full py-4 px-6 rounded-2xl font-bold text-sm shadow-md bg-[var(--tg-theme-button-color)] hover:opacity-90 active:scale-[0.98] text-[var(--tg-theme-button-text-color)] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" /> Забронировать за {selectedSession.price.toLocaleString("ru-RU")} ₽
                  </button>
                  <p className="text-[10px] text-center text-[var(--tg-theme-hint-color)] mt-2">
                    В Telegram Mini App для покупки будет использована нативная кнопка MainButton
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* TOP FLOATING ENVIRONMENT BAR (FOR DEVELOPER DEMONSTRATION & DESIGN REVIEW)
          This simulated panel is hidden when running inside real Telegram context */}
      <div className="fixed bottom-4 left-4 right-4 max-w-xs mx-auto bg-neutral-900/90 text-white rounded-2xl p-3 shadow-2xl backdrop-blur-md border border-neutral-700/50 flex flex-col gap-2 z-50 text-xs" id="demo-controls">
        <div className="flex justify-between items-center">
          <span className="font-bold flex items-center gap-1.5 text-indigo-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            TMA Симулятор
          </span>
          <span className="text-[10px] px-1.5 py-0.5 bg-neutral-800 rounded font-mono text-neutral-400">
            {isTelegram ? "Telegram Client" : "Разработка (Web)"}
          </span>
        </div>
        
        <p className="text-[10px] text-neutral-400 leading-relaxed">
          Этот тулбар виден только в браузере для демонстрации адаптивности цвета и тем. Скрыт внутри Telegram.
        </p>

        <div className="flex gap-2.5 mt-1 border-t border-neutral-800 pt-2">
          <button 
            id="toggle-simulator-theme"
            onClick={toggleTheme}
            className="flex-1 py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:scale-95 transition-all text-[11px] font-medium flex items-center justify-center gap-1.5"
          >
            {themeMode === "light" ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" /> Тёмная тема
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" /> Светлая тема
              </>
            )}
          </button>

          {!isTelegram && (
            <button 
              id="simulate-tg-status"
              onClick={() => {
                setIsTelegram(!isTelegram);
                if (tg?.HapticFeedback) {
                  tg.HapticFeedback.impactOccurred("medium");
                }
              }}
              className="py-1.5 px-2.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 text-[10px] font-mono"
            >
              Скрывать кнопки
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
