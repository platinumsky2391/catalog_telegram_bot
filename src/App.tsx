import React, { useState, useEffect, useRef } from "react";
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
  Globe,
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
import {
  TelegramIcon,
  VkIcon,
  YoutubeIcon,
  DzenIcon,
} from "./components/SocialIcons";

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
    "relative inline-flex items-center justify-center overflow-hidden rounded-full p-[1px] shadow-sm uppercase font-bold tracking-widest text-[10px]";

  return (
    <div className={`${baseClasses} ${className}`}>
      <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,rgba(128,128,128,0.05)_0%,rgba(128,128,128,0.4)_50%,rgba(128,128,128,0.05)_100%)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.4)_50%,rgba(255,255,255,0.05)_100%)]" />
      <span className="inline-flex h-full w-full cursor-default items-center justify-center rounded-full bg-[var(--tg-theme-bg-color)] px-4 py-1.5 backdrop-blur-3xl text-[var(--tg-theme-text-color)] gap-1.5">
        {children}
      </span>
    </div>
  );
};

export default function App() {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isTelegram, setIsTelegram] = useState(false);
  const [isMobileTelegram, setIsMobileTelegram] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const scrollPosRef = useRef<number>(0);

  const triggerHaptic = (
    style: "light" | "medium" | "heavy" | "rigid" | "soft" = "light",
  ) => {
    if (
      tg?.HapticFeedback &&
      typeof tg.isVersionAtLeast === "function" &&
      tg.isVersionAtLeast("6.1")
    ) {
      tg.HapticFeedback.impactOccurred(style);
    }
  };

  const toggleFaq = (index: number) => {
    triggerHaptic("light");
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleLinkClick = () => {
    triggerHaptic("light");
  };

  // Initialize Telegram WebApp configuration
  useEffect(() => {
    AnalyticalLogger.info("APP_STARTUP", {
      url: window.location.href,
      userAgent: navigator.userAgent,
    });

    const isActualTelegram = tg && tg.platform && tg.platform !== "unknown";

    if (isActualTelegram) {
      setIsTelegram(true);
      if (["android", "android_x86", "ios"].includes(tg.platform)) {
        setIsMobileTelegram(true);
      }
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
      if (isMobileTelegram) {
        tg.BackButton.show();
      }
      const onBackClick = () => {
        handleBack();
      };
      tg.BackButton.onClick(onBackClick);

      // Configure Native Telegram Main Button
      if (isMobileTelegram) {
        tg.MainButton.setText("Записаться на сеанс");
        tg.MainButton.show();
      }

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

      if (isMobileTelegram) {
        tg.MainButton.setText("Записаться на сеанс");
        tg.MainButton.setParams({
          color: tg.themeParams?.button_color || "#2481cc",
          text_color: tg.themeParams?.button_text_color || "#ffffff",
        });
        tg.MainButton.show();
      }

      const onMainCatalogClick = () => {
        handleBooking(null);
      };
      tg.MainButton.onClick(onMainCatalogClick);

      return () => {
        tg.MainButton.hide();
        tg.MainButton.offClick(onMainCatalogClick);
      };
    }
  }, [selectedSession, isTelegram, isMobileTelegram]);

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

    scrollPosRef.current = window.scrollY;
    setSelectedSession(session);
    window.scrollTo({ top: 0, behavior: "instant" });

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
    
    setTimeout(() => {
      window.scrollTo({ top: scrollPosRef.current, behavior: "instant" });
    }, 0);

    // Native Telegram Haptic impact
    if (
      tg?.HapticFeedback &&
      typeof tg.isVersionAtLeast === "function" &&
      tg.isVersionAtLeast("6.1")
    ) {
      tg.HapticFeedback.impactOccurred("light");
    }
  };

  const handleBooking = (session: Session | null) => {
    AnalyticalLogger.trackClick(
      session ? `booking_btn_${session.id}` : "catalog_booking_btn",
      {
        sessionId: session?.id,
        sessionPrice: session?.price,
      },
    );

    if (
      tg?.HapticFeedback &&
      typeof tg.isVersionAtLeast === "function" &&
      tg.isVersionAtLeast("6.1")
    ) {
      tg.HapticFeedback.notificationOccurred("success");
    }

    AnalyticalLogger.trackConversion(
      "TMA_BOOKING_LINK_OPEN",
      session?.price || 0,
      {
        sessionId: session?.id,
        sessionTitle: session?.title,
      },
    );

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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Main Container */}
        <div className="max-w-md mx-auto px-4 pt-5 pb-6" id="tma-container">
          {/* SHOP HEADER */}
          {!selectedSession && (
            <header
              className="bg-[var(--tg-theme-bg-color)] p-8 rounded-[32px] border border-black/5 dark:border-white/5 flex flex-col justify-between items-center text-center mb-6 shadow-xl relative overflow-hidden"
              id="main-header"
            >
              {/* Subtle premium background glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--tg-theme-link-color)]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[var(--tg-theme-link-color)]/20 rounded-full blur-3xl pointer-events-none" />

              <BadgeGlass className="mb-4 relative z-10">
                🌀 АНДРЕЙ ТРЕТЬЯКОВ
              </BadgeGlass>
              <h1
                className="text-[32px] leading-[1.1] font-extrabold tracking-tight text-[var(--tg-theme-text-color)] drop-shadow-sm mb-3 relative z-10"
                id="title-main"
              >
                Сеансы и цены
              </h1>
              <p
                className="text-[var(--tg-theme-hint-color)] text-[15px] max-w-[280px] mx-auto leading-relaxed text-balance relative z-10"
                id="desc-main"
              >
                Здесь вы можете ознакомиться с актуальной стоимостью сеансов и
                более подробно узнать о форматах работы.
              </p>

              <div className="flex flex-col gap-4 w-full relative z-10 mt-8">
                <div className="flex flex-row gap-3 mt-2">
                  <a
                    href="https://solien.ru/"
                    target="_blank"
                    rel="noreferrer"
                    onClick={handleLinkClick}
                    className="w-full py-4 px-6 rounded-[20px] font-bold text-[15px] flex items-center justify-center gap-2 bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-link-color)] text-[var(--tg-theme-link-color)] shadow-[0_4px_12px_-4px_var(--tg-theme-link-color)] hover:bg-[var(--tg-theme-link-color)] hover:text-white transition-all active:scale-[0.98]"
                  >
                    <Globe className="w-5 h-5" />
                    Сайт
                  </a>

                  <a
                    href="https://t.me/otzyvgyp"
                    target="_blank"
                    rel="noreferrer"
                    onClick={handleLinkClick}
                    className="w-full py-4 px-6 rounded-[20px] font-bold text-[15px] flex items-center justify-center gap-2 bg-[var(--tg-theme-link-color)] text-white shadow-[0_8px_16px_-6px_var(--tg-theme-link-color)] hover:shadow-[0_12px_20px_-8px_var(--tg-theme-link-color)] hover:opacity-95 transition-all active:scale-[0.98]"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Отзывы
                  </a>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <a
                    href="https://t.me/amemanoir"
                    target="_blank"
                    rel="noreferrer"
                    onClick={handleLinkClick}
                    className="w-[56px] h-[56px] rounded-[22px] bg-[var(--tg-theme-secondary-bg-color)] border border-[rgba(128,128,128,0.1)] flex items-center justify-center text-[var(--tg-theme-text-color)] shadow-sm hover:scale-105 hover:shadow-md transition-all"
                  >
                    <TelegramIcon className="w-[28px] h-[28px] text-[var(--tg-theme-text-color)]" />
                  </a>
                  <a
                    href="https://vk.com/amemanoir"
                    target="_blank"
                    rel="noreferrer"
                    onClick={handleLinkClick}
                    className="w-[56px] h-[56px] rounded-[22px] bg-[var(--tg-theme-secondary-bg-color)] border border-[rgba(128,128,128,0.1)] flex items-center justify-center text-[var(--tg-theme-text-color)] shadow-sm hover:scale-105 hover:shadow-md transition-all"
                  >
                    <VkIcon className="w-[28px] h-[28px] text-[var(--tg-theme-text-color)]" />
                  </a>
                  <a
                    href="https://youtube.com/@amemanoir"
                    target="_blank"
                    rel="noreferrer"
                    onClick={handleLinkClick}
                    className="w-[56px] h-[56px] rounded-[22px] bg-[var(--tg-theme-secondary-bg-color)] border border-[rgba(128,128,128,0.1)] flex items-center justify-center text-[var(--tg-theme-text-color)] shadow-sm hover:scale-105 hover:shadow-md transition-all"
                  >
                    <YoutubeIcon className="w-[28px] h-[28px] text-[var(--tg-theme-text-color)]" />
                  </a>
                  <a
                    href="https://dzen.ru/amemanoir"
                    target="_blank"
                    rel="noreferrer"
                    onClick={handleLinkClick}
                    className="w-[56px] h-[56px] rounded-[22px] bg-[var(--tg-theme-secondary-bg-color)] border border-[rgba(128,128,128,0.1)] flex items-center justify-center text-[var(--tg-theme-text-color)] shadow-sm hover:scale-105 hover:shadow-md transition-all"
                  >
                    <DzenIcon className="w-[26px] h-[26px] text-[var(--tg-theme-text-color)]" />
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
                  <div className="flex flex-col gap-3">
                    {workSteps.map((step, i) => (
                      <div
                        key={i}
                        className="flex flex-col gap-2 p-4 rounded-[20px] bg-[var(--tg-theme-bg-color)] border border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.03)] shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[14px] font-bold text-[var(--tg-theme-text-color)]">
                            {step.title}
                          </span>
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
                  <div className="flex flex-col items-center text-center mb-8">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-500 border border-red-100 dark:bg-red-500/10 dark:border-red-500/20 mb-4">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                      </svg>
                      <span className="text-[11px] font-bold uppercase tracking-wider">
                        ВАЖНАЯ ИНФОРМАЦИЯ
                      </span>
                    </div>
                    <h2 className="text-[28px] sm:text-[32px] font-black tracking-tight text-[var(--tg-theme-text-color)] uppercase mb-3">
                      ПРОТИВОПОКАЗАНИЯ
                    </h2>
                    <p className="text-[14px] text-[var(--tg-theme-hint-color)] max-w-2xl leading-[1.6]">
                      Методы работы с подсознанием являются мощным инструментом,
                      который имеет строгие ограничения. Ознакомьтесь со списком
                      противопоказаний перед записью.
                    </p>
                  </div>

                  <div className="card p-6 rounded-3xl shadow-sm border border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/10">
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                            <path d="M12 9v4" />
                            <path d="M12 17h.01" />
                          </svg>
                        </div>
                        <h3 className="text-[18px] font-bold text-[var(--tg-theme-text-color)]">
                          Строгие противопоказания к сеансам:
                        </h3>
                      </div>
                      <div className="flex flex-col gap-4">
                        {[
                          "Психиатрические диагнозы (шизофрения, биполярное расстройство, клиническая депрессия в тяжелой стадии).",
                          "Эпилепсия и судорожные синдромы.",
                          "Острые психотические состояния, бред, галлюцинации.",
                          "Органические поражения головного мозга, деменция.",
                          "Состояние алкогольного или наркотического опьянения, а также период острой абстиненции.",
                          "Тяжелые сердечно-сосудистые заболевания (недавно перенесенный инфаркт, инсульт).",
                          "Беременность.",
                          "Острые инфекционные заболевания с высокой температурой.",
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2.5 text-left"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#ef4444"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="shrink-0 mt-[2px]"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <path d="m15 9-6 6" />
                              <path d="m9 9 6 6" />
                            </svg>
                            <span className="text-[13px] text-[var(--tg-theme-text-color)] leading-[1.5] opacity-90 text-left">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-4 border-t border-red-100 dark:border-red-900/30">
                        <p className="text-[12px] italic text-[var(--tg-theme-hint-color)]">
                          * Утаивание данных состояний при записи на сеанс
                          перекладывает всю ответственность за возможные
                          последствия на клиента.
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
                      Каждая ситуация уникальна. Если вашего вопроса здесь нет,
                      напишите мне для индивидуальной беседы.
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
                          onClick={() => toggleFaq(index)}
                          className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 focus:outline-none"
                        >
                          <span className="text-[14px] font-bold text-[var(--tg-theme-text-color)] pr-4">
                            {faq.q}
                          </span>
                          <div
                            className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center border transition-all duration-300 ${
                              expandedFaq === index
                                ? "bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.2)] text-[var(--tg-theme-link-color,#10b981)]"
                                : "bg-[rgba(128,128,128,0.05)] border-[rgba(128,128,128,0.1)] text-[var(--tg-theme-hint-color)]"
                            }`}
                          >
                            <svg
                              className={`w-3.5 h-3.5 transition-transform duration-300 ${expandedFaq === index ? "rotate-180" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </button>
                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            expandedFaq === index
                              ? "max-h-[500px] opacity-100"
                              : "max-h-0 opacity-0"
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
                {!isMobileTelegram && (
                  <button
                    onClick={handleBack}
                    style={{ color: "var(--tg-theme-link-color, #3390ec)" }}
                    className="flex items-center gap-1.5 hover:opacity-80 transition-opacity disabled:opacity-50 text-[14px] font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Вернуться</span>
                  </button>
                )}

                {/* Cover visual Banner with rich SVG artwork */}
                <div className="relative h-56 rounded-3xl overflow-hidden border border-neutral-200/40 dark:border-neutral-800/40 shadow-md">
                  {renderSessionSvg(selectedSession.id)}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Floating symbol, quick info and online status */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <BadgeGlass>
                      {getSessionIcon(
                        selectedSession.id,
                        "w-3.5 h-3.5 shrink-0",
                      )}{" "}
                      {selectedSession.badge}
                    </BadgeGlass>

                    <span className="text-[12px] font-bold text-amber-400 flex items-center gap-1.5 drop-shadow-md pr-1">
                      <span className="w-[6px] h-[6px] -translate-y-[0.5px] rounded-full bg-emerald-400 shrink-0 shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
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

                {selectedSession.longInfo &&
                  selectedSession.longInfo.steps &&
                  selectedSession.longInfo.steps.length > 0 && (
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
                    <div className="flex flex-col gap-3">
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Desktop / browser Simulation booking Button.
          (Hidden if inside mobile Telegram since Telegram's native MainButton takes this job) */}
      {!isMobileTelegram && (
        <>
          {/* Invisible spacer to allow scrolling past the fixed button */}
          <div className="h-[96px]"></div>
          <div
            className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, var(--tg-theme-bg-color, #ffffff) 65%, transparent)",
            }}
          >
            <div className="max-w-md mx-auto px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-8 pointer-events-auto">
              <button
                id={
                  selectedSession
                    ? "btn-book-browser"
                    : "catalog-btn-book-browser"
                }
                onClick={() => handleBooking(selectedSession)}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] ${selectedSession?.id === "past-lives" ? "btn-premium" : "bg-[var(--tg-theme-button-color)] hover:opacity-90 shadow-md text-[var(--tg-theme-button-text-color)]"}`}
                style={
                  selectedSession?.id === "past-lives"
                    ? undefined
                    : {
                        backgroundColor:
                          "var(--tg-theme-button-color, #2481cc)",
                        color: "var(--tg-theme-button-text-color, #ffffff)",
                      }
                }
              >
                <MessageCircle className="w-4 h-4" /> Записаться на сеанс
              </button>
              <p className="text-[10px] text-center text-[var(--tg-theme-hint-color)] mt-3">
                В мобильном Telegram сеанс бронируется через нативную нижнюю
                панель
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
