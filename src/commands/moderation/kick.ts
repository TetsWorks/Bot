import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js"
import { EmbedFactory } from "../../utils/embeds"
import { logger } from "../../utils/logger"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulsa um usuário do servidor")
    .setDescriptionLocalizations({ "en-US": "Kicks a user from the server" })
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setNameLocalizations({ "en-US": "user" })
        .setDescription("O usuário a ser expulso")
        .setDescriptionLocalizations({ "en-US": "The user to kick" })
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("motivo")
        .setNameLocalizations({ "en-US": "reason" })
        .setDescription("Motivo da expulsão")
        .setDescriptionLocalizations({ "en-US": "Reason for the kick" })
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("usuario", true)
    const reason = interaction.options.getString("motivo") || "Não especificado"
    const member = interaction.guild?.members.cache.get(user.id)

    if (!member) {
      return interaction.reply({
        embeds: [EmbedFactory.error(interaction.client, "Erro", "Usuário não encontrado no servidor.")],
        ephemeral: true,
      })
    }

    if (user.id === interaction.user.id) {
      return interaction.reply({
        embeds: [EmbedFactory.error(interaction.client, "Erro", "Você não pode expulsar a si mesmo.")],
        ephemeral: true,
      })
    }

    if (user.id === interaction.client.user?.id) {
      return interaction.reply({
        embeds: [EmbedFactory.error(interaction.client, "Erro", "Eu não posso me expulsar.")],
        ephemeral: true,
      })
    }

    if (!member.kickable) {
      return interaction.reply({
        embeds: [EmbedFactory.error(interaction.client, "Erro", "Não posso expulsar este usuário. Verifique a hierarquia de cargos.")],
        ephemeral: true,
      })
    }

    const executorMember = interaction.guild?.members.cache.get(interaction.user.id)
    if (executorMember && member.roles.highest.position >= executorMember.roles.highest.position) {
      return interaction.reply({
        embeds: [EmbedFactory.error(interaction.client, "Erro", "Você não pode expulsar alguém com cargo igual ou superior ao seu.")],
        ephemeral: true,
      })
    }

    try {
      await member.kick(`${reason} | Expulso por ${interaction.user.tag}`)

      const embed = EmbedFactory.moderation(
        interaction.client,
        "kick",
        user,
        interaction.user,
        reason
      )

      logger.command("kick", interaction.user.tag, interaction.guild?.name)

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      logger.error("Erro ao expulsar usuário", error as Error, "Kick")
      await interaction.reply({
        embeds: [EmbedFactory.error(interaction.client, "Erro", "Não foi possível expulsar o usuário.")],
        ephemeral: true,
      })
    }
  },
}
