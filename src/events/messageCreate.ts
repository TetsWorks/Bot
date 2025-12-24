import { Events, type Message } from "discord.js"
import { db } from "../utils/database"
import { EmbedFactory } from "../utils/embeds"
import { Limits } from "../config/constants"

const xpCooldowns = new Map<string, number>()

module.exports = {
  name: Events.MessageCreate,
  async execute(message: Message) {
    if (message.author.bot || !message.guild) return

    const guildData = db.guilds.getOrCreate(message.guild.id)
    if (!guildData.levelsEnabled) return

    const now = Date.now()
    const cooldownKey = `${message.guild.id}-${message.author.id}`
    const lastXP = xpCooldowns.get(cooldownKey) || 0

    if (now - lastXP < Limits.XPCooldown) return

    xpCooldowns.set(cooldownKey, now)

    const xpGain = Math.floor(Math.random() * (Limits.XPPerMessage.max - Limits.XPPerMessage.min + 1)) + Limits.XPPerMessage.min
    const result = db.users.addXP(message.author.id, xpGain)

    if (result.leveledUp) {
      const embed = EmbedFactory.levelUp(message.client, message.author, result.newLevel)

      if (guildData.levelUpChannel) {
        const channel = message.guild.channels.cache.get(guildData.levelUpChannel)
        if (channel?.isTextBased() && "send" in channel) {
          await channel.send({ embeds: [embed] })
        }
      } else {
        await message.channel.send({ embeds: [embed] })
      }
    }
  },
}
