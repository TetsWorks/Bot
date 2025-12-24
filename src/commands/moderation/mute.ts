import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js"
import { EmbedFactory } from "../../utils/embeds"
import { logger } from "../../utils/logger"

const timeUnits: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
}

function parseDuration(duration: string): number | null {
  const match = duration.match(/^(\d+)(s|m|h|d)$/)
  if (!match) return null

  const value = parseInt(match[1])
  const unit = match[2]

  return value * timeUnits[unit]
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} dia(s)`
  if (hours > 0) return `${hours} hora(s)`
  if (minutes > 0) return `${minutes} minuto(s)`
  return `${seconds} segundo(s)`
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Silencia um usuário temporariamente (timeout)")
    .setDescriptionLocalizations({ "en-US": "Temporarily mutes a user (timeout)" })
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setNameLocalizations({ "en-US": "user" })
        .setDescription("O usuário a ser silenciado")
        .setDescriptionLocalizations({ "en-US": "The user to mute" })
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("duracao")
        .setNameLocalizations({ "en-US": "duration" })
        .setDescription("Duração do silenciamento (ex: 10m, 1h, 1d)")
        .setDescriptionLocalizations({ "en-US": "Duration of the mute (e.g., 10m, 1h, 1d)" })
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("motivo")
        .setNameLocalizations({ "en-US": "reason" })
        .setDescription("Motivo do silenciamento")
        .setDescriptionLocalizations({ "en-US": "Reason for the mute" })
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("usuario", true)
    const durationStr = interaction.options.getString("duracao", true)
    const reason = interaction.options.getString("motivo") || "Não especificado"
    const member = interaction.guild?.members.cache.get(user.id)

    if (!member) {
      return interaction.reply({
        embeds: [EmbedFactory.error(interaction.client, "Erro", "Usuário não encontrado no servidor.")],
        ephemeral: true,
      })
    }

    const duration = parseDuration(durationStr)
    if (!duration) {
      return interaction.reply({
        embeds: [EmbedFactory.error(interaction.client, "Erro", "Formato de duração inválido. Use: 10s, 5m, 1h, 1d")],
        ephemeral: true,
      })
    }

    const maxDuration = 28 * 24 * 60 * 60 * 1000
    if (duration > maxDuration) {
      return interaction.reply({
        embeds: [EmbedFactory.error(interaction.client, "Erro", "A duração máxima é de 28 dias.")],
        ephemeral: true,
      })
    }

    if (user.id === interaction.user.id) {
      return interaction.reply({
        embeds: [EmbedFactory.error(interaction.client, "Erro", "Você não pode silenciar a si mesmo.")],
        ephemeral: true,
      })
    }

    if (!member.moderatable) {
      return interaction.reply({
        embeds: [EmbedFactory.error(interaction.client, "Erro", "Não posso silenciar este usuário. Verifique a hierarquia de cargos.")],
        ephemeral: true,
      })
    }

    try {
      await member.timeout(duration, `${reason} | Silenciado por ${interaction.user.tag}`)

      const embed = EmbedFactory.moderation(
        interaction.client,
        "mute",
        user,
        interaction.user,
        reason,
        formatDuration(duration)
      )

      logger.command("mute", interaction.user.tag, interaction.guild?.name)

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      logger.error("Erro ao silenciar usuário", error as Error, "Mute")
      await interaction.reply({
        embeds: [EmbedFactory.error(interaction.client, "Erro", "Não foi possível silenciar o usuário.")],
        ephemeral: true,
      })
    }
  },
}
