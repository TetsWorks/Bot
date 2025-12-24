import { Events, type GuildMember, type TextChannel } from "discord.js"
import { db } from "../utils/database"
import { EmbedFactory } from "../utils/embeds"
import { logger } from "../utils/logger"

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member: GuildMember) {
    logger.event("GuildMemberAdd", `${member.user.tag} entrou em ${member.guild.name}`)

    const guildData = db.guilds.get(member.guild.id)

    if (!guildData?.welcomeChannel) return

    const channel = member.guild.channels.cache.get(guildData.welcomeChannel) as TextChannel | undefined

    if (!channel) return

    try {
      const embed = EmbedFactory.welcome(
        member.client,
        member.user,
        member.guild.name,
        member.guild.memberCount
      )

      if (guildData.welcomeMessage) {
        const customMessage = guildData.welcomeMessage
          .replace("{user}", `${member}`)
          .replace("{username}", member.user.username)
          .replace("{server}", member.guild.name)
          .replace("{memberCount}", member.guild.memberCount.toString())

        embed.setDescription(customMessage)
      }

      await channel.send({ embeds: [embed] })
    } catch (error) {
      logger.error("Erro ao enviar mensagem de boas-vindas", error as Error, "GuildMemberAdd")
    }
  },
}
