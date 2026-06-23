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
// @ts-expect-error
import pastLivesImg from "../img/prosmotr-proshlyh-zhiznej.webp";
// @ts-expect-error
import hypnotherapyImg from "../img/izbavlenie-ot-strahov.webp";
// @ts-expect-error
import higherSelfImg from "../img/otvety-ot-vysshego-ya.webp";
// @ts-expect-error
import energyCleansingImg from "../img/snyatie-energeticheskih-blokov.webp";

// Get Telegram WebApp object
const tg = (window as any).Telegram?.WebApp;

const BadgeGlass = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const baseClasses = "bg-black/40 backdrop-blur-md rounded-full font-mono font-medium tracking-wide text-white uppercase flex items-center shrink-0 shadow-[0_4px_10px_rgba(0,0,0,0.1)] font-sans border border-white/10 px-3.5 py-1.5 text-xs gap-1.5";
  
  return (
    <span className={`${baseClasses} ${className}`} style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
      {children}
    </span>
  );
};

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

    const isActualTelegram = tg && tg.platform && tg.platform !== "unknown";
    
    if (isActualTelegram) {
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
    if (tg?.HapticFeedback && typeof tg.isVersionAtLeast === 'function' && tg.isVersionAtLeast('6.1')) {
      tg.HapticFeedback.impactOccurred("light");
    }
  };

  // Setup/Tear down Telegram BackButton & MainButton when navigating
  useEffect(() => {
    if (!isTelegram || !tg) return;

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
    if (tg?.HapticFeedback && typeof tg.isVersionAtLeast === 'function' && tg.isVersionAtLeast('6.1')) {
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
    if (tg?.HapticFeedback && typeof tg.isVersionAtLeast === 'function' && tg.isVersionAtLeast('6.1')) {
      tg.HapticFeedback.impactOccurred("light");
    }
  };

  const handleBooking = (session: Session) => {
    AnalyticalLogger.trackClick(`booking_btn_${session.id}`, {
      sessionId: session.id,
      sessionPrice: session.price
    });

    if (tg?.HapticFeedback && typeof tg.isVersionAtLeast === 'function' && tg.isVersionAtLeast('6.1')) {
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

          // Send confirmation event to our backend server (which will notify the user via the Telegram Bot)
          fetch("/api/book", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              sessionId: session.id,
              title: session.title,
              price: session.price,
              user: tg.initDataUnsafe?.user || null
            })
          }).catch(err => {
            AnalyticalLogger.error("API_BOOK_ERROR", err);
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

      // Send to local backend as well for demonstration logging
      fetch("/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId: session.id,
          title: session.title,
          price: session.price,
          user: { id: 123456789, first_name: "Иван (Симулятор)" }
        })
      }).catch(err => {
        console.error("Failed to post booking to simulator api:", err);
      });

      setBookingStatus(session.title);
    }
  };

  // Helper to render decorative thematic SVGs for each card
  const renderSessionSvg = (id: string) => {
    switch (id) {
      case "past-lives": // Loads the custom user webp image
        return (
          <img 
            src={pastLivesImg} 
            alt="Путешествие в прошлые жизни" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Fallback to high-quality spiritual illustration if image fails
              e.currentTarget.src = "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80";
            }}
          />
        );
      case "hypnotherapy": // Loads the custom user webp image for hypnotherapy
        return (
          <img 
            src={hypnotherapyImg} 
            alt="Гипнотерапия (Избавление от страхов)" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80";
            }}
          />
        );
      case "higher-self": // Loads the custom user webp image for Higher Self answers
        return (
          <img 
            src={higherSelfImg} 
            alt="Ответы от Высшего Я" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80";
            }}
          />
        );
      case "energy-cleansing": // Loads the custom user webp image for energetic cleansing
        return (
          <img 
            src={energyCleansingImg} 
            alt="Снятие энергетических блоков" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80";
            }}
          />
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
    <div className={`min-h-screen pb-24 relative select-none bg-[var(--tg-theme-secondary-bg-color)] transition-colors duration-300 ${selectedSession?.id === 'past-lives' ? 'premium-past-lives' : ''}`}>
      
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
      <div className="max-w-md mx-auto px-4 pt-5 pb-24" id="tma-container">
        
        {/* SHOP HEADER */}
        {!selectedSession && (
          <header className="bg-[var(--tg-theme-bg-color)] p-6 rounded-3xl border border-black/5 dark:border-white/5 flex flex-col justify-between items-center text-center mb-6 shadow-sm relative overflow-hidden" id="main-header">
            <BadgeGlass className="mb-3" id="badge-main">
              ✨ Каталог услуг
            </BadgeGlass>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--tg-theme-text-color)]" id="title-main">
              Сеансы и цены
            </h1>
            <p className="text-[var(--tg-theme-hint-color)] mt-2 max-w-md mx-auto leading-[1.65]" id="desc-main" style={{ fontSize: "14px" }}>
              Выберите подходящий вам метод. Глубокая работа с подсознанием, которая поможет найти первопричины ваших запросов и вернуть внутреннюю гармонию.
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
                    <BadgeGlass className="absolute top-3 left-3">
                      {getSessionIcon(session.id, "w-3 h-3 shrink-0")} {session.badge}
                    </BadgeGlass>

                    {/* Price Tag badge inside image */}
                    <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-md px-3.5 py-1 rounded-xl border border-white/15 text-white font-semibold text-sm shadow-md">
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
                      <h2 className="text-xl font-bold font-display text-[var(--tg-theme-text-color)] group-hover:text-[var(--tg-theme-link-color)] transition-colors" id={`title-${session.id}`}>
                        {session.title}
                      </h2>
                    </div>
                    
                    <p 
                      className={`text-[var(--tg-theme-hint-color)] leading-[1.65] mt-2 ${session.customFontSize && session.customFontSize.startsWith("text-") ? session.customFontSize : (!session.customFontSize ? "text-xs" : "")}`}
                      style={{ fontSize: session.customFontSize && !session.customFontSize.startsWith("text-") ? session.customFontSize : undefined }}
                    >
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
                  className="absolute top-8 left-8 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-black/50 transition-all cursor-pointer shadow-md"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}

              {/* Cover visual Banner with rich SVG artwork */}
              <div className="relative h-56 rounded-3xl overflow-hidden border border-neutral-200/40 dark:border-neutral-800/40 shadow-md">
                {renderSessionSvg(selectedSession.id)}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                {/* Floating symbol, quick info and online status */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <BadgeGlass>
                    {getSessionIcon(selectedSession.id, "w-3.5 h-3.5 shrink-0")} {selectedSession.badge}
                  </BadgeGlass>
                  
                  <span className="text-[12px] font-bold text-amber-400 flex items-center gap-1.5 drop-shadow-md pr-1">
                    <span className="w-[6px] h-[6px] -translate-y-[0.5px] rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
                    <span className="leading-none">Онлайн сеанс</span>
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h2 className="title-overlay text-2xl font-extrabold font-display leading-tight pb-0.5 w-full pr-1">
                    {selectedSession.title}
                  </h2>
                </div>
              </div>

              {/* Booking fallbacks check inside standard browsers */}
              {bookingStatus && (
                <div id="booking-alert-box" className="p-4 rounded-xl bg-[var(--tg-theme-link-color)] opacity-90 border text-xs" style={{ borderColor: "var(--tg-theme-link-color)", backgroundColor: "color-mix(in srgb, var(--tg-theme-link-color) 10%, transparent)" }}>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-[var(--tg-theme-link-color)] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-[var(--tg-theme-text-color)]">Запрос на бронирование отправлен!</h4>
                      <p className="text-[var(--tg-theme-hint-color)] mt-1">
                        Для согласования времени свяжитесь с психотерапевтом в Telegram:
                      </p>
                      <a href="https://t.me/your_telegram_username" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[var(--tg-theme-link-color)] font-bold mt-2 hover:underline">
                        <MessageCircle className="w-3.5 h-3.5" /> @your_telegram_username
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Block and description card */}
              <div className="card p-5 rounded-3xl shadow-sm space-y-4">
                <div className="pb-3 border-b border-neutral-200/50 dark:border-neutral-800/15">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] uppercase font-mono tracking-wider text-[var(--tg-theme-hint-color)] block leading-none">Стоимость</span>
                    <span className="text-[11px] uppercase font-mono tracking-wider text-[var(--tg-theme-hint-color)] block leading-none text-right">Длительность</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-[26px] font-bold leading-none price-tag">{selectedSession.price.toLocaleString("ru-RU")} ₽</p>
                    <p className="text-[15px] font-medium text-[var(--tg-theme-text-color)] flex items-center gap-1.5 justify-end leading-none translate-y-[-1px]">
                      <Clock className="w-4 h-4 text-[var(--tg-theme-link-color)]" /> {selectedSession.duration}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] uppercase font-mono tracking-wider text-[var(--tg-theme-hint-color)] block">О сеансе</span>
                  <p className="text-[14px] text-[var(--tg-theme-text-color)] leading-[1.65] whitespace-pre-wrap">
                    {selectedSession.fullDesc}
                  </p>
                </div>
              </div>

              {/* DETAILED WORKFLOW IN SESSION (Steps) */}
              <div className="card p-5 rounded-3xl shadow-sm space-y-4">
                <div className="space-y-1">
                  <h3 className={`text-[16px] font-bold text-[var(--tg-theme-text-color)] flex items-start gap-2 ${!selectedSession.longInfo.sectionText ? 'mb-3' : ''}`}>
                    <Sparkles className="w-4 h-4 text-[var(--tg-theme-link-color)] shrink-0 mt-[4.5px]" />
                    <span>{selectedSession.longInfo.sectionTitle}</span>
                  </h3>
                  {selectedSession.longInfo.sectionText && (
                    <p className="text-[14px] text-[var(--tg-theme-hint-color)] leading-[1.65]">
                      {selectedSession.longInfo.sectionText}
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="text-[14px] font-semibold text-[var(--tg-theme-text-color)]">
                    {selectedSession.longInfo.stepsTitle}
                  </h4>
                  <div className="flex flex-col pt-1">
                    {selectedSession.longInfo.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-4.5 pl-0.5 relative py-2.5">
                        <div className="relative w-5 shrink-0 self-stretch">
                          {/* Continuous, overlapping seamless vertical line segments */}
                          {selectedSession.longInfo.steps.length > 1 && (
                            idx === 0 ? (
                              <div className="absolute top-1/2 bottom-[-10px] w-[2px] left-1/2 -translate-x-1/2 bg-[var(--tg-theme-link-color)] opacity-25" />
                            ) : idx === selectedSession.longInfo.steps.length - 1 ? (
                              <div className="absolute top-[-10px] bottom-1/2 w-[2px] left-1/2 -translate-x-1/2 bg-[var(--tg-theme-link-color)] opacity-25" />
                            ) : (
                              <div className="absolute top-[-10px] bottom-[-10px] w-[2px] left-1/2 -translate-x-1/2 bg-[var(--tg-theme-link-color)] opacity-25" />
                            )
                          )}
                          
                          {/* Step Badge aligned exactly with the center of the text */}
                          <div className="w-5 h-5 rounded-full bg-[var(--tg-theme-secondary-bg-color)] border text-[11px] font-bold flex items-center justify-center shrink-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 border-[var(--tg-theme-link-color)] text-[var(--tg-theme-link-color)]">
                            {idx + 1}
                          </div>
                        </div>
                        <p 
                          className="text-[13.5px] text-[var(--tg-theme-text-color)] leading-[1.65] py-0.5 flex-1"
                          dangerouslySetInnerHTML={{ __html: step }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* WHAT CLIENT GETS (Benefits) */}
              <div className="card p-5 rounded-3xl shadow-sm space-y-3">
                <h3 className="text-[16px] font-bold tracking-tight text-[var(--tg-theme-text-color)] flex items-start gap-2">
                  {selectedSession.id === "past-lives" ? (
                    <>
                      <Compass className="w-4 h-4 text-[var(--tg-theme-link-color)] shrink-0 mt-[4.5px]" />
                      <span>Частые запросы на просмотр прошлых воплощений:</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[var(--tg-theme-link-color)] shrink-0 mt-[4.5px]" />
                      <span>Результаты сеанса:</span>
                    </>
                  )}
                </h3>
                {selectedSession.id === "past-lives" && (
                  <p className="text-[13px] text-[var(--tg-theme-hint-color)] leading-[1.65] mb-2">
                    Жизнь часто дает нам подсказки. Если вы замечаете в своей жизни следующие сценарии, корень проблемы может лежать за пределами текущего воплощения.
                  </p>
                )}
                <ul className="space-y-2.5 text-[14px] text-[var(--tg-theme-text-color)]" id="benefits-list">
                  {selectedSession.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 leading-[1.65]">
                      <span className="text-[var(--tg-theme-link-color)] text-[14px] mt-[3.5px] leading-none shrink-0">✦</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* EXAMPLES OF REQUESTS ON SCREENSHOT */}
              {selectedSession.exampleRequests && (
                <div className="card p-5 rounded-3xl shadow-sm space-y-4">
                  <h3 className="text-[16px] font-bold tracking-tight text-[var(--tg-theme-text-color)] leading-snug flex items-start gap-2">
                    <MessageCircle className="w-4 h-4 text-[var(--tg-theme-link-color)] shrink-0 mt-[4.5px]" />
                    <span>{selectedSession.exampleRequests.title}</span>
                  </h3>
                  <ul className="space-y-2.5 text-[13.5px] text-[var(--tg-theme-text-color)]" id="example-requests-list">
                    {selectedSession.exampleRequests.columns.flat().map((req, reqIdx) => (
                      <li key={reqIdx} className="flex items-start gap-2.5 leading-[1.65]">
                        <span className="text-[var(--tg-theme-link-color)] text-[18px] leading-none mt-[3.5px] shrink-0 select-none">•</span>
                        <span className="opacity-90">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

               {/* Desktop / browser Simulation booking Button.
                  (Hidden if inside Telegram since Telegram's native MainButton takes this job) */}
              {!isTelegram && (
                <>
                  {/* Invisible spacer to allow scrolling past the fixed button */}
                  <div className="h-32"></div>
                  <div 
                    className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
                    style={{ background: "linear-gradient(to top, var(--tg-theme-bg-color, #ffffff) 65%, transparent)" }}
                  >
                    <div className="max-w-md mx-auto px-4 pb-6 pt-10 pointer-events-auto">
                      <button
                        id="btn-book-browser"
                        onClick={() => handleBooking(selectedSession)}
                        className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] ${selectedSession.id === 'past-lives' ? 'btn-premium text-white' : 'bg-[var(--tg-theme-button-color)] hover:opacity-90 text-[var(--tg-theme-button-text-color)] shadow-md'}`}
                      >
                        <MessageCircle className="w-4 h-4" /> Забронировать за {selectedSession.price.toLocaleString("ru-RU")} ₽
                      </button>
                      <p className="text-[10px] text-center text-[var(--tg-theme-hint-color)] mt-3">
                        В Telegram Mini App для покупки используется нативная панель
                      </p>
                    </div>
                  </div>
                </>
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
        
        <p className="text-[10px] text-neutral-400 leading-[1.65]">
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
                if (tg?.HapticFeedback && typeof tg.isVersionAtLeast === 'function' && tg.isVersionAtLeast('6.1')) {
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
