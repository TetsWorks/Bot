import { Collection } from "discord.js"
import type { ChatInputCommandInteraction } from "discord.js"
import { Limits } from "../config/constants"

const cooldowns = new Collection<string, Collection<string, number>>()

export function checkCooldown(
  interaction: ChatInputCommandInteraction,
  commandName: string,
  cooldownSeconds?: number
): { onCooldown: boolean; remaining: number } {
  const cooldownAmount = (cooldownSeconds ?? Limits.DefaultCooldown) * 1000

  if (!cooldowns.has(commandName)) {
    cooldowns.set(commandName, new Collection())
  }

  const now = Date.now()
  const timestamps = cooldowns.get(commandName)!
  const userId = interaction.user.id

  if (timestamps.has(userId)) {
    const expirationTime = timestamps.get(userId)! + cooldownAmount

    if (now < expirationTime) {
      const remaining = Math.ceil((expirationTime - now) / 1000)
      return { onCooldown: true, remaining }
    }
  }

  timestamps.set(userId, now)
  setTimeout(() => timestamps.delete(userId), cooldownAmount)

  return { onCooldown: false, remaining: 0 }
}

export function formatCooldownMessage(remaining: number, locale: "pt" | "en"): string {
  if (locale === "pt") {
    return `⏳ Aguarde **${remaining}** segundo${remaining !== 1 ? "s" : ""} antes de usar este comando novamente.`
  }
  return `⏳ Please wait **${remaining}** second${remaining !== 1 ? "s" : ""} before using this command again.`
}
