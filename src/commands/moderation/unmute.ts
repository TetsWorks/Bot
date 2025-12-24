import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js"
import { EmbedFactory } from "../../utils/embeds"
import { logger } from "../../utils/logger"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Remove o silenciamento de um usuário")
    .setDescriptionLocalizations({ "en-US": "Removes the mute from a user" })
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setNameLocalizations({ "en-US": "user" })
        .setDescription("O usuário a ser dessilenciado")
        .setDescriptionLocalizations({ "en-US": "The user to unmute" })
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("usuario", true)
    const member = interaction.guild?.members.cache.get(user.id)

    if (!member) {
      return interaction.reply({
        embeds: [EmbedFactory.error(interaction.client, "Erro", "Usuário não encontrado no servidor.")],
        ephemeral: true,
      })
    }

    if (!member.isCommunicationDisabled()) {
      return interaction.reply({
        embeds: [EmbedFactory.error(interaction.client, "Erro", "Este usuário não está silenciado.")],
        ephemeral: true,
      })
    }

    try {
      await member.timeout(null)

      const embed = EmbedFactory.moderation(
        interaction.client,
        "unmute",
        user,
        interaction.user,
        "Silenciamento removido"
      )

      logger.command("unmute", interaction.user.tag, interaction.guild?.name)

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      logger.error("Erro ao remover silenciamento", error as Error, "Unmute")
      await interaction.reply({
        embeds: [EmbedFactory.error(interaction.client, "Erro", "Não foi possível remover o silenciamento.")],
        ephemeral: true,
      })
    }
  },
}
