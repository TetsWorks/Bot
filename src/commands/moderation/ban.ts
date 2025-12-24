import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js"
import { EmbedFactory } from "../../utils/embeds"
import { logger } from "../../utils/logger"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bane um usuário do servidor")
    .setDescriptionLocalizations({ "en-US": "Bans a user from the server" })
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setNameLocalizations({ "en-US": "user" })
        .setDescription("O usuário a ser banido")
        .setDescriptionLocalizations({ "en-US": "The user to ban" })
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("motivo")
        .setNameLocalizations({ "en-US": "reason" })
        .setDescription("Motivo do banimento")
        .setDescriptionLocalizations({ "en-US": "Reason for the ban" })
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("deletar_mensagens")
        .setNameLocalizations({ "en-US": "delete_messages" })
        .setDescription("Dias de mensagens para deletar (0-7)")
        .setDescriptionLocalizations({ "en-US": "Days of messages to delete (0-7)" })
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("usuario", true)
    const reason = interaction.options.getString("motivo") || "Não especificado"
    const deleteMessageDays = interaction.options.getInteger("deletar_mensagens") || 0
    const member = interaction.guild?.members.cache.get(user.id)

    if (user.id === interaction.user.id) {
      return interaction.reply({
        embeds: [EmbedFactory.error(interaction.client, "Erro", "Você não pode banir a si mesmo.")],
        ephemeral: true,
      })
    }

    if (user.id === interaction.client.user?.id) {
      return interaction.reply({
        embeds: [EmbedFactory.error(interaction.client, "Erro", "Eu não posso me banir.")],
        ephemeral: true,
      })
    }

    if (member) {
      if (!member.bannable) {
        return interaction.reply({
          embeds: [EmbedFactory.error(interaction.client, "Erro", "Não posso banir este usuário. Verifique a hierarquia de cargos.")],
          ephemeral: true,
        })
      }

      const executorMember = interaction.guild?.members.cache.get(interaction.user.id)
      if (executorMember && member.roles.highest.position >= executorMember.roles.highest.position) {
        return interaction.reply({
          embeds: [EmbedFactory.error(interaction.client, "Erro", "Você não pode banir alguém com cargo igual ou superior ao seu.")],
          ephemeral: true,
        })
      }
    }

    try {
      await interaction.guild?.members.ban(user, {
        reason: `${reason} | Banido por ${interaction.user.tag}`,
        deleteMessageSeconds: deleteMessageDays * 24 * 60 * 60,
      })

      const embed = EmbedFactory.moderation(
        interaction.client,
        "ban",
        user,
        interaction.user,
        reason
      )

      logger.command("ban", interaction.user.tag, interaction.guild?.name)

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      logger.error("Erro ao banir usuário", error as Error, "Ban")
      await interaction.reply({
        embeds: [EmbedFactory.error(interaction.client, "Erro", "Não foi possível banir o usuário.")],
        ephemeral: true,
      })
    }
  },
}
