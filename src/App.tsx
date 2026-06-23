import React, { useState, useEffect } from "react";
import { sessions, Session } from "./data";
import { workSteps } from "./workSteps";
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
  Share2,
  HelpCircle,
  CheckCircle,
  Zap,
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

const BadgeGlass = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const baseClasses =
    "bg-black/40 backdrop-blur-md rounded-full font-mono font-medium tracking-wide text-white uppercase flex items-center shrink-0 shadow-[0_4px_10px_rgba(0,0,0,0.1)] font-sans border border-white/10 px-3.5 py-1.5 text-xs gap-1.5";

  return (
    <span
      className={`${baseClasses} ${className}`}
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {children}
    </span>
  );
};

export default function App() {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isTelegram, setIsTelegram] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Initialize Telegram WebApp configuration
  useEffect(() => {
    AnalyticalLogger.info("APP_STARTUP", {
      url: window.location.href,
      userAgent: navigator.userAgent,
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
        theme: tgTheme,
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
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
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
    if (
      tg?.HapticFeedback &&
      typeof tg.isVersionAtLeast === "function" &&
      tg.isVersionAtLeast("6.1")
    ) {
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
      tg.MainButton.setText(
        `Забронировать сеанс (${selectedSession.price.toLocaleString("ru-RU")} ₽)`,
      );
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
      sessionPrice: session.price,
    });
    AnalyticalLogger.trackNavigation("catalog_list", "session_details", {
      targetSessionId: session.id,
      targetSessionTitle: session.title,
    });

    setSelectedSession(session);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Native Telegram Haptic impact
    if (
      tg?.HapticFeedback &&
      typeof tg.isVersionAtLeast === "function" &&
      tg.isVersionAtLeast("6.1")
    ) {
      tg.HapticFeedback.impactOccurred("medium");
    }
  };

  const handleBack = () => {
    if (selectedSession) {
      AnalyticalLogger.trackClick("back_button", {
        lastViewedSessionId: selectedSession.id,
        lastViewedSessionTitle: selectedSession.title,
      });
      AnalyticalLogger.trackNavigation("session_details", "catalog_list", {
        fromSessionId: selectedSession.id,
      });
    }

    setSelectedSession(null);
    setBookingStatus(null);

    // Native Telegram Haptic impact
    if (
      tg?.HapticFeedback &&
      typeof tg.isVersionAtLeast === "function" &&
      tg.isVersionAtLeast("6.1")
    ) {
      tg.HapticFeedback.impactOccurred("light");
    }
  };

  const handleBooking = (session: Session) => {
    AnalyticalLogger.trackClick(`booking_btn_${session.id}`, {
      sessionId: session.id,
      sessionPrice: session.price,
    });

    if (
      tg?.HapticFeedback &&
      typeof tg.isVersionAtLeast === "function" &&
      tg.isVersionAtLeast("6.1")
    ) {
      tg.HapticFeedback.notificationOccurred("success");
    }

    AnalyticalLogger.trackConversion("TMA_BOOKING_LINK_OPEN", session.price, {
      sessionId: session.id,
      sessionTitle: session.title,
    });

    if (tg && typeof tg.openTelegramLink === "function") {
      tg.openTelegramLink("https://t.me/meta_manoir");
    } else {
      window.open("https://t.me/meta_manoir", "_blank");
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
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80";
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
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80";
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
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80";
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
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80";
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
        return (
          <Compass className={`${size} text-indigo-400`} id="icon-compass" />
        );
      case "hypnotherapy":
        return <Eye className={`${size} text-teal-400`} id="icon-eye" />;
      case "higher-self":
        return (
          <Sparkles className={`${size} text-amber-400`} id="icon-sparkles" />
        );
      case "energy-cleansing":
        return (
          <ShieldCheck
            className={`${size} text-emerald-400`}
            id="icon-shield"
          />
        );
      default:
        return <Sparkles className={`${size} text-indigo-400`} />;
    }
  };

  return (
    <div
      className={`min-h-screen pb-4 relative select-none bg-[var(--tg-theme-secondary-bg-color)] transition-colors duration-300 premium-session`}
    >
      {/* Background ambient lighting glows for high-end aesthetic */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 transition-colors duration-300">
        <div
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[50%] rounded-full glow-bg"
          style={{
            background: selectedSession
              ? `radial-gradient(circle, ${selectedSession.gradientFrom} 0%, rgba(255,255,255,0) 70%)`
              : "radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(255,255,255,0) 70%)",
          }}
        />
        <div
          className="absolute top-[40%] -right-[15%] w-[70%] h-[60%] rounded-full glow-bg"
          style={{
            background: selectedSession
              ? `radial-gradient(circle, ${selectedSession.gradientTo} 0%, rgba(255,255,255,0) 70%)`
              : "radial-gradient(circle, rgba(236,72,153,0.08) 0%, rgba(255,255,255,0) 70%)",
          }}
        />
      </div>

      {/* Main Container */}
      <div className="max-w-md mx-auto px-4 pt-5 pb-6" id="tma-container">
        {/* SHOP HEADER */}
        {!selectedSession && (
          <header
            className="bg-[var(--tg-theme-bg-color)] p-6 rounded-3xl border border-black/5 dark:border-white/5 flex flex-col justify-between items-center text-center mb-6 shadow-sm relative overflow-hidden"
            id="main-header"
          >
            <BadgeGlass className="mb-3">
              ✨ Каталог услуг
            </BadgeGlass>
            <h1
              className="text-3xl font-extrabold tracking-tight text-[var(--tg-theme-text-color)]"
              id="title-main"
            >
              Сеансы и цены
            </h1>
            <p
              className="text-[var(--tg-theme-hint-color)] mt-2 max-w-md mx-auto leading-[1.65]"
              id="desc-main"
              style={{ fontSize: "14px" }}
            >
              Выберите подходящий вам метод. Глубокая работа с подсознанием,
              которая поможет найти первопричины ваших запросов и вернуть
              внутреннюю гармонию.
            </p>

            <div className="flex flex-col gap-3 w-full relative z-10 mt-6">
              <a 
                href="https://t.me/otzyvgyp" 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-3 px-6 rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 bg-[var(--tg-theme-link-color)] text-white shadow-sm hover:opacity-90 transition-opacity active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4" />
                Отзывы клиентов
              </a>

              <div className="flex items-center justify-center gap-3">
                <a href="https://t.me/amemanoir" target="_blank" rel="noreferrer" className="w-[54px] h-[54px] rounded-[20px] bg-[var(--tg-theme-secondary-bg-color)] border border-[rgba(128,128,128,0.1)] flex items-center justify-center text-[var(--tg-theme-text-color)] shadow-sm hover:opacity-80 transition-opacity">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="currentColor"/><path fill="var(--tg-theme-bg-color, #ffffff)" d="m5.4 11.5 12.8-4.9c.6-.2 1.1.1.9.8l-2.2 10.3c-.2.7-.6.9-1.2.6l-3.3-2.4-1.6 1.5c-.2.2-.4.4-.8.4l.2-3.3 6.1-5.5c.3-.3-.1-.4-.4-.2l-7.5 4.7-3.2-1c-.7-.2-.7-.7.1-1z"/></svg>
                </a>
                <a href="https://vk.com/amemanoir" target="_blank" rel="noreferrer" className="w-[54px] h-[54px] rounded-[20px] bg-[var(--tg-theme-secondary-bg-color)] border border-[rgba(128,128,128,0.1)] flex items-center justify-center text-[var(--tg-theme-text-color)] shadow-sm hover:opacity-80 transition-opacity">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M15.44 14.86c.46.46.96 1 1.44 1.55.19.21.42.45.51.72.08.27-.01.52-.29.64-.17.08-.37.11-.56.11h-1.85c-.3 0-.58-.09-.81-.28-.23-.19-.39-.46-.53-.71-.23-.42-.46-.84-.71-1.25-.16-.25-.36-.48-.62-.62-.23-.12-.48-.14-.71-.02-.26.13-.39.38-.39.68v1.56c0 .3-.13.51-.4.6-.53.16-1.08.21-1.63.19-1.55-.07-2.89-.57-4.02-1.63-1.35-1.3-2.33-2.92-3-4.71-.14-.37.02-.65.4-.65h1.91c.28 0 .5.13.62.39.44 1.1 1 2.11 1.74 2.99.15.18.32.34.54.41.22.08.41 0 .49-.22.08-.23.1-.47.1-.7v-3.75c-.01-.33-.1-.5-.43-.6-.21-.06-.17-.17-.08-.27.1-.1.24-.12.37-.12h3.13c.27.02.41.18.44.44v2.98c0 .27.19.41.41.32.2-.08.36-.24.5-.41.34-.43.64-.88.89-1.35.15-.3.3-.59.44-.9.11-.26.33-.39.61-.38h1.93c.11 0 .24 0 .34.03.25.06.37.22.32.47-.07.3-.21.55-.36.81-.34.6-.72 1.16-1.14 1.72-.21.28-.42.56-.54.9-.12.31-.03.59.23.83z"/></svg>
                </a>
                <a href="https://youtube.com/@amemanoir" target="_blank" rel="noreferrer" className="w-[54px] h-[54px] rounded-[20px] bg-[var(--tg-theme-secondary-bg-color)] border border-[rgba(128,128,128,0.1)] flex items-center justify-center text-[var(--tg-theme-text-color)] shadow-sm hover:opacity-80 transition-opacity">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M21.582 6.186a2.632 2.632 0 0 0-1.854-1.854C18.094 3.86 12 3.86 12 3.86s-6.094 0-7.728.472A2.632 2.632 0 0 0 2.418 6.186C1.946 7.82 1.946 12 1.946 12s0 4.18.472 5.814a2.632 2.632 0 0 0 1.854 1.854C5.906 20.14 12 20.14 12 20.14s6.094 0 7.728-.472a2.632 2.632 0 0 0 1.854-1.854C22.054 16.18 22.054 12 22.054 12s0-4.18-.472-5.814zM9.946 15.482V8.518l6.304 3.482-6.304 3.482z"/></svg>
                </a>
                <a href="https://dzen.ru/amemanoir" target="_blank" rel="noreferrer" className="w-[54px] h-[54px] rounded-[20px] bg-[var(--tg-theme-secondary-bg-color)] border border-[rgba(128,128,128,0.1)] flex items-center justify-center text-[var(--tg-theme-text-color)] shadow-sm hover:opacity-80 transition-opacity font-bold tracking-tight" style={{ fontSize: '12px' }}>
                  Дзен
                </a>
              </div>
            </div>
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
                  <div
                    className="h-44 w-full relative overflow-hidden"
                    id={`placeholder-photo-${session.id}`}
                  >
                    {renderSessionSvg(session.id)}

                    {/* Dark/Gradient Vignette Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Category Label */}
                    <BadgeGlass className="absolute top-3 left-3">
                      {getSessionIcon(session.id, "w-3 h-3 shrink-0")}{" "}
                      {session.badge}
                    </BadgeGlass>

                    {/* Price Tag badge inside image */}
                    <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-md px-3.5 py-1 rounded-xl border border-white/15 text-white font-semibold text-sm shadow-md">
                      {session.price.toLocaleString("ru-RU")} ₽
                    </div>

                    {/* Floating Duration badge inside image */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs font-medium text-neutral-250 text-white/90">
                      <Clock className="w-3.5 h-3.5 text-white/80" />{" "}
                      {session.duration}
                    </div>
                  </div>

                  {/* Card Content Description info */}
                  <div className="p-4 relative">
                    <div className="flex items-center gap-2 mb-1">
                      <h2
                        className="text-xl font-bold font-display text-[var(--tg-theme-text-color)] group-hover:text-[var(--tg-theme-link-color)] transition-colors"
                        id={`title-${session.id}`}
                      >
                        {session.title}
                      </h2>
                    </div>

                    <p
                      className={`text-[var(--tg-theme-hint-color)] leading-[1.65] mt-2 ${session.customFontSize && session.customFontSize.startsWith("text-") ? session.customFontSize : !session.customFontSize ? "text-xs" : ""}`}
                      style={{
                        fontSize:
                          session.customFontSize &&
                          !session.customFontSize.startsWith("text-")
                            ? session.customFontSize
                            : undefined,
                      }}
                    >
                      {session.shortDesc}
                    </p>

                    <div className="mt-4 pt-3 border-t border-neutral-200/30 dark:border-neutral-800/30 flex justify-between items-baseline">
                      <span className="text-[10px] font-mono text-[var(--tg-theme-hint-color)] uppercase tracking-wider">
                        Нажмите для подробностей
                      </span>
                      <span className="text-[var(--tg-theme-link-color)] text-xs font-medium group-hover:translate-x-1 transition-transform">
                        Подробнее &rarr;
                      </span>
                    </div>
                  </div>
                </article>
              ))}

              <div className="card mt-8 p-5 rounded-3xl shadow-sm space-y-4">
                <h3 className="text-[20px] font-bold tracking-tight text-[var(--tg-theme-text-color)]">
                  Как проходит работа
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {workSteps.map((step, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-2 p-4 rounded-[20px] bg-[var(--tg-theme-bg-color)] border border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.03)] shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-bold text-[var(--tg-theme-text-color)]">{step.title}</span>
                        <span className="text-[24px] font-black text-[var(--tg-theme-hint-color)] opacity-20">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="text-[13px] text-[var(--tg-theme-hint-color)] leading-[1.5]">
                        {step.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.05)]">
                <div className="flex flex-col items-start text-left mb-8">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-500 border border-red-100 dark:bg-red-500/10 dark:border-red-500/20 mb-4">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    <span className="text-[11px] font-bold uppercase tracking-wider">ВАЖНАЯ ИНФОРМАЦИЯ</span>
                  </div>
                  <h2 className="text-[28px] sm:text-[32px] font-black tracking-tight text-[var(--tg-theme-text-color)] uppercase mb-3">
                    ПРОТИВОПОКАЗАНИЯ
                  </h2>
                  <p className="text-[14px] text-[var(--tg-theme-hint-color)] max-w-2xl leading-[1.6]">
                    Методы работы с подсознанием являются мощным инструментом, который имеет строгие ограничения. Ознакомьтесь со списком противопоказаний перед записью.
                  </p>
                </div>

                <div className="card p-6 rounded-3xl shadow-sm border border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/10">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                      </div>
                      <h3 className="text-[18px] font-bold text-[var(--tg-theme-text-color)]">Строгие противопоказания к сеансам:</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        {[
                          "Психиатрические диагнозы (шизофрения, биполярное расстройство, клиническая депрессия в тяжелой стадии).",
                          "Эпилепсия и судорожные синдромы.",
                          "Острые психотические состояния, бред, галлюцинации.",
                          "Органические поражения головного мозга, деменция.",
                          "Состояние алкогольного или наркотического опьянения, а также период острой абстиненции.",
                          "Тяжелые сердечно-сосудистые заболевания (недавно перенесенный инфаркт, инсульт).",
                          "Беременность.",
                          "Острые инфекционные заболевания с высокой температурой."
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-left">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-[2px]"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                            <span className="text-[13px] text-[var(--tg-theme-text-color)] leading-[1.5] opacity-90 text-left">{item}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-4 border-t border-red-100 dark:border-red-900/30">
                        <p className="text-[12px] italic text-[var(--tg-theme-hint-color)]">
                          * Утаивание данных состояний при записи на сеанс перекладывает всю ответственность за возможные последствия на клиента.
                        </p>
                      </div>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="card mt-8 p-5 sm:p-6 rounded-3xl shadow-sm space-y-4">
                <div className="text-left mb-6">
                  <h2 className="text-[20px] font-bold tracking-tight text-[var(--tg-theme-text-color)] mb-2">
                    Ответы на частые вопросы
                  </h2>
                  <p className="text-[14px] text-[var(--tg-theme-hint-color)]">
                    Каждая ситуация уникальна. Если вашего вопроса здесь нет, напишите мне для индивидуальной беседы.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      q: "Требуется ли специальная подготовка к сеансу?",
                      a: "Особых действий не требуется. Достаточно найти уединенное место, где вас не потревожат, и убедиться в хорошем качестве интернет-соединения.",
                    },
                    {
                      q: "Условия оплаты сеансов",
                      a: "Я работаю по полной предоплате. Она вносится за сутки до назначенного времени, чтобы закрепить место за вами.",
                    },
                    {
                      q: "Возможен ли перенос или отмена сеанса?",
                      a: "Вы можете перенести сеанс без финансовых потерь, предупредив меня хотя бы за сутки. Если отмена происходит менее чем за 24 часа, удерживается 50% оплаты.",
                    },
                    {
                      q: "Какова продолжительность одного сеанса?",
                      a: "Предварительная беседа длится около 30 минут, регрессии в прошлые жизни и общение с Высшим Я занимают по 2–3 часа. Сеанс гипнотерапии длится до 2 часов, а глубокая энергетическая работа может занять от полутора до четырех часов.",
                    },
                    {
                      q: "Насколько конфиденциальны наши встречи?",
                      a: "Я строго соблюдаю профессиональную этику. Все подробности сеанса остаются строго между нами.",
                    },
                    {
                      q: "Совместимы ли сеансы с медикаментозным лечением?",
                      a: "Психологическая работа и гипнотерапия являются эффективным дополнением к основному лечению. Обращаю ваше внимание, что терапия не заменяет и не отменяет курс препаратов, назначенный вашим лечащим врачом. Самостоятельный отказ от медикаментов или изменение их дозировки недопустимы.",
                    },
                    {
                      q: "А вдруг я не поддаюсь гипнозу?",
                      a: "Подавляющее большинство людей способны входить в трансовые состояния. Чтобы развеять сомнения, мы проверим вашу восприимчивость уже на первой предварительной встрече.",
                    },
                  ].map((faq, index) => (
                    <div
                      key={index}
                      className="rounded-[20px] bg-[var(--tg-theme-bg-color)] border border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.03)] overflow-hidden transition-all duration-300"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 focus:outline-none"
                      >
                        <span className="text-[14px] font-bold text-[var(--tg-theme-text-color)] pr-4">{faq.q}</span>
                        <div
                          className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center border transition-all duration-300 ${
                            expandedFaq === index
                              ? "bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.2)] text-[var(--tg-theme-link-color,#10b981)]"
                              : "bg-[rgba(128,128,128,0.05)] border-[rgba(128,128,128,0.1)] text-[var(--tg-theme-hint-color)]"
                          }`}
                        >
                          <svg
                            className={`w-3.5 h-3.5 transition-transform duration-300 ${expandedFaq === index ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          expandedFaq === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="p-4 sm:p-5 pt-0 text-[13px] text-[var(--tg-theme-hint-color)] leading-[1.6]">
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop / browser Simulation booking Button for catalog */}
              {!isTelegram && (
                <>
                  <div className="h-[104px]"></div>
                  <div
                    className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to top, var(--tg-theme-bg-color, #ffffff) 65%, transparent)",
                    }}
                  >
                    <div className="max-w-md mx-auto px-4 pb-6 pt-10 pointer-events-auto">
                      <button
                        onClick={() => handleBooking(null)}
                        className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] btn-premium text-white`}
                      >
                        Записаться на сеанс
                      </button>
                      <p className="text-[10px] text-center text-[var(--tg-theme-hint-color)] mt-3">
                        В Telegram Mini App для записи используется нативная панель
                      </p>
                    </div>
                  </div>
                </>
              )}
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
              {/* Back navigation */}
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-[var(--tg-theme-link-color)] hover:opacity-80 transition-opacity disabled:opacity-50 text-[14px] font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Вернуться</span>
              </button>

              {/* Cover visual Banner with rich SVG artwork */}
              <div className="relative h-56 rounded-3xl overflow-hidden border border-neutral-200/40 dark:border-neutral-800/40 shadow-md">
                {renderSessionSvg(selectedSession.id)}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Floating symbol, quick info and online status */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <BadgeGlass>
                    {getSessionIcon(selectedSession.id, "w-3.5 h-3.5 shrink-0")}{" "}
                    {selectedSession.badge}
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
                <div
                  id="booking-alert-box"
                  className="p-4 rounded-xl bg-[var(--tg-theme-link-color)] opacity-90 border text-xs"
                  style={{
                    borderColor: "var(--tg-theme-link-color)",
                    backgroundColor:
                      "color-mix(in srgb, var(--tg-theme-link-color) 10%, transparent)",
                  }}
                >
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-[var(--tg-theme-link-color)] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-[var(--tg-theme-text-color)]">
                        Запрос на бронирование отправлен!
                      </h4>
                      <p className="text-[var(--tg-theme-hint-color)] mt-1">
                        Для согласования времени свяжитесь с психотерапевтом в
                        Telegram:
                      </p>
                      <a
                        href="https://t.me/your_telegram_username"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--tg-theme-link-color)] font-bold mt-2 hover:underline"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />{" "}
                        @your_telegram_username
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Block and description card */}
              <div className="card p-5 rounded-3xl shadow-sm space-y-4">
                <div className="pb-3 border-b border-neutral-200/50 dark:border-neutral-800/15">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] uppercase font-mono tracking-wider text-[var(--tg-theme-hint-color)] block leading-none">
                      Стоимость
                    </span>
                    <span className="text-[11px] uppercase font-mono tracking-wider text-[var(--tg-theme-hint-color)] block leading-none text-right">
                      Длительность
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-[26px] font-bold leading-none price-tag">
                      {selectedSession.price.toLocaleString("ru-RU")} ₽
                    </p>
                    <p className="text-[15px] font-medium text-[var(--tg-theme-text-color)] flex items-center gap-1.5 justify-end leading-none translate-y-[-1px]">
                      <Clock className="w-4 h-4 text-[var(--tg-theme-link-color)]" />{" "}
                      {selectedSession.duration}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] uppercase font-mono tracking-wider text-[var(--tg-theme-hint-color)] block">
                    О сеансе
                  </span>
                  <p className="text-[14px] text-[var(--tg-theme-text-color)] leading-[1.65] whitespace-pre-wrap">
                    {selectedSession.fullDesc}
                  </p>
                </div>
              </div>

              {selectedSession.longInfo && selectedSession.longInfo.steps && selectedSession.longInfo.steps.length > 0 && (
                <div className="card p-5 rounded-3xl shadow-sm space-y-3">
                  {selectedSession.longInfo.sectionTitle && (
                    <h3 className="text-[16px] font-bold text-[var(--tg-theme-text-color)] flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-[var(--tg-theme-link-color)] shrink-0 mt-[4.5px]" />
                      <span>{selectedSession.longInfo.sectionTitle}</span>
                    </h3>
                  )}
                  {selectedSession.longInfo.sectionText && (
                    <p className="text-[14px] text-[var(--tg-theme-hint-color)] leading-[1.65]">
                      {selectedSession.longInfo.sectionText}
                    </p>
                  )}

                  {selectedSession.longInfo.stepsTitle && (
                    <h4 className="text-[14px] font-semibold text-[var(--tg-theme-text-color)] pt-1">
                      {selectedSession.longInfo.stepsTitle}
                    </h4>
                  )}

                  <div className="flex flex-col">
                    {selectedSession.longInfo.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4.5 pl-0.5 relative py-2.5"
                      >
                        <div className="relative w-5 shrink-0 self-stretch">
                          {/* Continuous, overlapping seamless vertical line segments */}
                          {selectedSession.longInfo.steps.length > 1 &&
                            (idx === 0 ? (
                              <div className="absolute top-1/2 bottom-[-10px] w-[2px] left-1/2 -translate-x-1/2 bg-[var(--tg-theme-link-color)] opacity-25" />
                            ) : idx ===
                              selectedSession.longInfo.steps.length - 1 ? (
                              <div className="absolute top-[-10px] bottom-1/2 w-[2px] left-1/2 -translate-x-1/2 bg-[var(--tg-theme-link-color)] opacity-25" />
                            ) : (
                              <div className="absolute top-[-10px] bottom-[-10px] w-[2px] left-1/2 -translate-x-1/2 bg-[var(--tg-theme-link-color)] opacity-25" />
                            ))}

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
              )}


              {/* DETAILED WORKFLOW IN SESSION (Steps) */}
              {/* EXTRA BLOCKS AS SEPARATE CARDS */}
              {selectedSession.extraBlocks &&
                selectedSession.extraBlocks.length > 0 && (
                  <>
                    {selectedSession.extraBlocks.map((block, idx) =>
                      block.type === "steps" && block.steps ? (
                        <div
                          key={idx}
                          className="card p-5 rounded-3xl shadow-sm space-y-3"
                        >
                          <h3 className="text-[16px] font-bold text-[var(--tg-theme-text-color)] flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-[var(--tg-theme-link-color)] shrink-0 mt-[4.5px]" />
                            <span>{block.title}</span>
                          </h3>
                          <div className="flex flex-col mt-2">
                            {block.steps.map((step, i) => (
                              <div
                                key={i}
                                className="flex gap-4.5 pl-0.5 relative py-2.5"
                              >
                                <div className="relative w-5 shrink-0 self-stretch">
                                  {block.steps &&
                                    block.steps.length > 1 &&
                                    (i === 0 ? (
                                      <div className="absolute top-1/2 bottom-[-10px] w-[2px] left-1/2 -translate-x-1/2 bg-[var(--tg-theme-link-color)] opacity-25" />
                                    ) : i === block.steps.length - 1 ? (
                                      <div className="absolute top-[-10px] bottom-1/2 w-[2px] left-1/2 -translate-x-1/2 bg-[var(--tg-theme-link-color)] opacity-25" />
                                    ) : (
                                      <div className="absolute top-[-10px] bottom-[-10px] w-[2px] left-1/2 -translate-x-1/2 bg-[var(--tg-theme-link-color)] opacity-25" />
                                    ))}
                                  <div className="w-5 h-5 rounded-full bg-[var(--tg-theme-secondary-bg-color)] border text-[11px] font-bold flex items-center justify-center shrink-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 border-[var(--tg-theme-link-color)] text-[var(--tg-theme-link-color)]">
                                    {i + 1}
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
                      ) : (
                        <div
                          key={idx}
                          className="card p-5 rounded-3xl shadow-sm space-y-3"
                        >
                          {block.title && (
                            <h3 className="text-[16px] font-bold text-[var(--tg-theme-text-color)] flex items-start gap-2">
                              {block.icon === "help" ? (
                                <HelpCircle className="w-4 h-4 text-[var(--tg-theme-link-color)] shrink-0 mt-[4.5px]" />
                              ) : block.icon === "check" ? (
                                <CheckCircle className="w-4 h-4 text-[var(--tg-theme-link-color)] shrink-0 mt-[4.5px]" />
                              ) : (
                                <Info className="w-4 h-4 text-[var(--tg-theme-link-color)] shrink-0 mt-[4.5px]" />
                              )}
                              <span>{block.title}</span>
                            </h3>
                          )}
                          {block.text && (
                            <p
                              className="text-[14px] text-[var(--tg-theme-hint-color)] leading-[1.65] whitespace-pre-wrap"
                              dangerouslySetInnerHTML={{ __html: block.text }}
                            />
                          )}
                          {block.list && block.list.length > 0 && (
                            <ul className="list-disc pl-5 mt-2 space-y-1 text-[14px] text-[var(--tg-theme-hint-color)] leading-[1.65]">
                              {block.list.map((li, i) => (
                                <li key={i}>{li}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ),
                    )}
                  </>
                )}
              {/* WHAT CLIENT GETS (Benefits) */}
              {selectedSession.benefits &&
                selectedSession.benefits.length > 0 && (
                  <div className="card p-5 rounded-3xl shadow-sm space-y-3">
                    <h3 className="text-[16px] font-bold tracking-tight text-[var(--tg-theme-text-color)] flex items-start gap-2">
                      <Compass className="w-4 h-4 text-[var(--tg-theme-link-color)] shrink-0 mt-[4.5px]" />
                      <span>{selectedSession.benefitsTitle}</span>
                    </h3>
                    {selectedSession.benefitsDesc && (
                      <p className="text-[13px] text-[var(--tg-theme-hint-color)] leading-[1.65] mb-2">
                        {selectedSession.benefitsDesc}
                      </p>
                    )}
                    <div className="flex flex-col gap-3">
                      {selectedSession.benefits.map((benefit, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-4 rounded-[20px] bg-[var(--tg-theme-bg-color)] border border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.03)] shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[var(--tg-theme-link-color)] shrink-0 mt-[2px]" />
                          <span className="text-[13px] text-[var(--tg-theme-text-color)] leading-[1.4] opacity-90">
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* INDICATIONS BLOCK */}
              {selectedSession.indications && (
                <div className="card p-5 rounded-3xl shadow-sm space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-[18px] font-bold tracking-tight text-[var(--tg-theme-text-color)]">
                      {selectedSession.indications.title}
                    </h3>
                    {selectedSession.indications.description && (
                      <p className="text-[13.5px] text-[var(--tg-theme-hint-color)] leading-[1.65]">
                        {selectedSession.indications.description}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedSession.indications.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 rounded-[20px] bg-[var(--tg-theme-bg-color)] border border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.03)] shadow-sm"
                      >
                        {selectedSession.indications.icon === "zap" ? (
                          <Zap className="w-4 h-4 text-[var(--tg-theme-link-color)] shrink-0 mt-[2px]" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-[var(--tg-theme-link-color)] shrink-0 mt-[2px]" />
                        )}
                        <span className="text-[13px] text-[var(--tg-theme-text-color)] leading-[1.4] opacity-90">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EXAMPLES OF REQUESTS ON SCREENSHOT */}
              {selectedSession.exampleRequests && (
                <div className="card p-5 rounded-3xl shadow-sm space-y-4">
                  <h3 className="text-[16px] font-bold tracking-tight text-[var(--tg-theme-text-color)] leading-snug flex items-start gap-2">
                    <MessageCircle className="w-4 h-4 text-[var(--tg-theme-link-color)] shrink-0 mt-[4.5px]" />
                    <span>{selectedSession.exampleRequests.title}</span>
                  </h3>
                  <ul
                    className="space-y-2.5 text-[13.5px] text-[var(--tg-theme-text-color)]"
                    id="example-requests-list"
                  >
                    {selectedSession.exampleRequests.columns
                      .flat()
                      .map((req, reqIdx) => (
                        <li
                          key={reqIdx}
                          className="flex items-start gap-2.5 leading-[1.65]"
                        >
                          <span className="text-[var(--tg-theme-link-color)] text-[18px] leading-none mt-[3.5px] shrink-0 select-none">
                            •
                          </span>
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
                  {/* Invisible spacer to allow scrolling past the fixed button so it looks like a standard space-y-5 gap */}
                  <div className="h-[104px]"></div>
                  <div
                    className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to top, var(--tg-theme-bg-color, #ffffff) 65%, transparent)",
                    }}
                  >
                    <div className="max-w-md mx-auto px-4 pb-6 pt-10 pointer-events-auto">
                      <button
                        id="btn-book-browser"
                        onClick={() => handleBooking(selectedSession)}
                        className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] btn-premium text-white`}
                      >
                        <MessageCircle className="w-4 h-4" /> Забронировать за{" "}
                        {selectedSession.price.toLocaleString("ru-RU")} ₽
                      </button>
                      <p className="text-[10px] text-center text-[var(--tg-theme-hint-color)] mt-3">
                        В Telegram Mini App для покупки используется нативная
                        панель
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
      {!isTelegram && (
        <div
          className="fixed bottom-4 left-4 right-4 max-w-xs mx-auto bg-neutral-900/90 text-white rounded-2xl p-3 shadow-2xl backdrop-blur-md border border-neutral-700/50 flex flex-col gap-2 z-50 text-xs"
          id="demo-controls"
        >
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
            Этот тулбар виден только в браузере для демонстрации адаптивности
            цвета и тем. Скрыт внутри Telegram.
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
                  if (
                    tg?.HapticFeedback &&
                    typeof tg.isVersionAtLeast === "function" &&
                    tg.isVersionAtLeast("6.1")
                  ) {
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
      )}
    </div>
  );
}
