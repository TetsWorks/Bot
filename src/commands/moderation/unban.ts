import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js"
import { EmbedFactory } from "../../utils/embeds"
import { logger } from "../../utils/logger"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Desbane um usuário do servidor")
    .setDescriptionLocalizations({ "en-US": "Unbans a user from the server" })
    .addStringOption((option) =>
      option
        .setName("usuario_id")
        .setNameLocalizations({ "en-US": "user_id" })
        .setDescription("O ID do usuário a ser desbanido")
        .setDescriptionLocalizations({ "en-US": "The ID of the user to unban" })
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.options.getString("usuario_id", true)

    try {
      const ban = await interaction.guild?.bans.fetch(userId)
      if (!ban) {
        return interaction.reply({
          embeds: [EmbedFactory.error(interaction.client, "Erro", "Este usuário não está banido.")],
          ephemeral: true,
        })
      }

      await interaction.guild?.members.unban(userId)

      const embed = EmbedFactory.moderation(
        interaction.client,
        "unban",
        ban.user,
        interaction.user,
        "Banimento removido"
      )

      logger.command("unban", interaction.user.tag, interaction.guild?.name)

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      logger.error("Erro ao desbanir usuário", error as Error, "Unban")
      await interaction.reply({
        embeds: [EmbedFactory.error(interaction.client, "Erro", "Não foi possível desbanir o usuário. Verifique se o ID está correto.")],
        ephemeral: true,
      })
    }
  },
}
