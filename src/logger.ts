/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

interface LogPayload {
  level: LogLevel;
  timestamp: string;
  eventName: string;
  context: Record<string, any>;
  sessionID: string;
}

class AnalyticalLogger {
  private static sessionID: string = AnalyticalLogger.generateUUID();

  private static generateUUID(): string {
    return "tma_sess_" + Math.random().toString(36).substring(2, 15);
  }

  private static formatLog(level: LogLevel, eventName: string, context: Record<string, any> = {}): LogPayload {
    return {
      level,
      timestamp: new Date().toISOString(),
      eventName,
      context: {
        platform: (window as any).Telegram?.WebApp ? "Telegram_TMA" : "Web_Simulator",
        tgUser: (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || "anonymous",
        tgTheme: (window as any).Telegram?.WebApp?.colorScheme || "unknown",
        ...context
      },
      sessionID: this.sessionID
    };
  }

  private static dispatch(payload: LogPayload) {
    // Вывод в системную консоль для отладки
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

    // Имитация отправки во внешнюю систему аналитики (Amplitude / Google Analytics / Telegram Analytics)
    // В реальном продакшене здесь будет fetch() или вызов SDK (например, amplitude.track())
    try {
      // Имитация отправки событий
      if (typeof (window as any).amplitude !== "undefined") {
        (window as any).amplitude.track(payload.eventName, payload.context);
      }
    } catch (e) {
      console.warn("Ошибка отправки лога во внешнюю аналитику", e);
    }
  }

  public static debug(eventName: string, context?: Record<string, any>) {
    this.dispatch(this.formatLog("DEBUG", eventName, context));
  }

  public static info(eventName: string, context?: Record<string, any>) {
    this.dispatch(this.formatLog("INFO", eventName, context));
  }

  public static warn(eventName: string, context?: Record<string, any>) {
    this.dispatch(this.formatLog("WARN", eventName, context));
  }

  public static error(eventName: string, error: Error | any, context?: Record<string, any>) {
    this.dispatch(this.formatLog("ERROR", eventName, {
      errorMessage: error?.message || String(error),
      errorStack: error?.stack,
      ...context
    }));
  }

  // Бизнес-события воронки
  public static trackClick(elementId: string, metadata?: Record<string, any>) {
    this.info("UI_CLICK", { elementId, ...metadata });
  }

  public static trackNavigation(from: string, to: string, metadata?: Record<string, any>) {
    this.info("NAVIGATE", { from, to, ...metadata });
  }

  public static trackConversion(actionName: string, value?: number, metadata?: Record<string, any>) {
    this.info("CONVERSION", { actionName, value, ...metadata });
  }
}

export default AnalyticalLogger;
