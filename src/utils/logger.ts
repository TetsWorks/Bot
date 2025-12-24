type LogLevel = "info" | "warn" | "error" | "success" | "debug" | "command" | "event"

interface LogColors {
  reset: string
  bright: string
  dim: string
  red: string
  green: string
  yellow: string
  blue: string
  magenta: string
  cyan: string
  white: string
  gray: string
}

const colors: LogColors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
}

const levelConfig: Record<LogLevel, { icon: string; color: string; label: string }> = {
  info: { icon: "ℹ️ ", color: colors.blue, label: "INFO" },
  warn: { icon: "⚠️ ", color: colors.yellow, label: "WARN" },
  error: { icon: "❌", color: colors.red, label: "ERROR" },
  success: { icon: "✅", color: colors.green, label: "SUCCESS" },
  debug: { icon: "🔍", color: colors.gray, label: "DEBUG" },
  command: { icon: "⚡", color: colors.magenta, label: "CMD" },
  event: { icon: "📡", color: colors.cyan, label: "EVENT" },
}

function getTimestamp(): string {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, "0")
  const minutes = now.getMinutes().toString().padStart(2, "0")
  const seconds = now.getSeconds().toString().padStart(2, "0")
  return `${hours}:${minutes}:${seconds}`
}

function formatMessage(level: LogLevel, message: string, context?: string): string {
  const config = levelConfig[level]
  const timestamp = `${colors.gray}[${getTimestamp()}]${colors.reset}`
  const levelTag = `${config.color}${colors.bright}[${config.label}]${colors.reset}`
  const contextTag = context ? `${colors.dim}(${context})${colors.reset} ` : ""
  
  return `${timestamp} ${config.icon} ${levelTag} ${contextTag}${message}`
}

class Logger {
  private debugMode: boolean

  constructor() {
    this.debugMode = process.env.NODE_ENV === "development" || process.env.DEBUG === "true"
  }

  info(message: string, context?: string): void {
    console.log(formatMessage("info", message, context))
  }

  warn(message: string, context?: string): void {
    console.warn(formatMessage("warn", message, context))
  }

  error(message: string, error?: Error, context?: string): void {
    console.error(formatMessage("error", message, context))
    if (error?.stack && this.debugMode) {
      console.error(`${colors.red}${colors.dim}${error.stack}${colors.reset}`)
    }
  }

  success(message: string, context?: string): void {
    console.log(formatMessage("success", message, context))
  }

  debug(message: string, context?: string): void {
    if (this.debugMode) {
      console.log(formatMessage("debug", message, context))
    }
  }

  command(commandName: string, userId: string, guildName?: string): void {
    const guildInfo = guildName ? ` em ${guildName}` : ""
    console.log(formatMessage("command", `/${commandName} usado por ${userId}${guildInfo}`))
  }

  event(eventName: string, details?: string): void {
    const info = details ? `: ${details}` : ""
    console.log(formatMessage("event", `${eventName}${info}`))
  }

  divider(): void {
    console.log(`${colors.gray}${"─".repeat(50)}${colors.reset}`)
  }

  banner(): void {
    console.log("")
    console.log(`${colors.magenta}${colors.bright}╔════════════════════════════════════════╗${colors.reset}`)
    console.log(`${colors.magenta}${colors.bright}║       TetsWorks Discord Bot            ║${colors.reset}`)
    console.log(`${colors.magenta}${colors.bright}║           Game Studio                  ║${colors.reset}`)
    console.log(`${colors.magenta}${colors.bright}╚════════════════════════════════════════╝${colors.reset}`)
    console.log("")
  }
}

export const logger = new Logger()
