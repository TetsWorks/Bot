import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js"
import { EmbedFactory } from "../../utils/embeds"
import { db } from "../../utils/database"
import { logger } from "../../utils/logger"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("config-niveis")
    .setDescription("Configura o sistema de níveis")
    .setDescriptionLocalizations({ "en-US": "Configures the level system" })
    .addSubcommand((sub) =>
      sub
        .setName("ativar")
        .setNameLocalizations({ "en-US": "enable" })
        .setDescription("Ativa o sistema de níveis")
        .setDescriptionLocalizations({ "en-US": "Enables the level system" })
    )
    .addSubcommand((sub) =>
      sub
        .setName("desativar")
        .setNameLocalizations({ "en-US": "disable" })
        .setDescription("Desativa o sistema de níveis")
        .setDescriptionLocalizations({ "en-US": "Disables the level system" })
    )
    .addSubcommand((sub) =>
      sub
        .setName("canal")
        .setNameLocalizations({ "en-US": "channel" })
        .setDescription("Define o canal de anúncios de level up")
        .setDescriptionLocalizations({ "en-US": "Sets the level up announcement channel" })
        .addChannelOption((option) =>
          option
            .setName("canal")
            .setNameLocalizations({ "en-US": "channel" })
            .setDescription("Canal para anúncios (deixe vazio para usar o canal atual)")
            .setDescriptionLocalizations({ "en-US": "Channel for announcements (leave empty for current channel)" })
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand()

    switch (subcommand) {
      case "ativar": {
        db.guilds.set(interaction.guild!.id, { levelsEnabled: true })

        await interaction.reply({
          embeds: [EmbedFactory.success(interaction.client, "Sistema Ativado", "O sistema de níveis foi ativado!")],
          ephemeral: true,
        })

        logger.command("config-niveis ativar", interaction.user.tag, interaction.guild?.name)
        break
      }

      case "desativar": {
        db.guilds.set(interaction.guild!.id, { levelsEnabled: false })

        await interaction.reply({
          embeds: [EmbedFactory.success(interaction.client, "Sistema Desativado", "O sistema de níveis foi desativado.")],
          ephemeral: true,
        })

        logger.command("config-niveis desativar", interaction.user.tag, interaction.guild?.name)
        break
      }

      case "canal": {
        const channel = interaction.options.getChannel("canal")

        if (channel) {
          db.guilds.set(interaction.guild!.id, { levelUpChannel: channel.id })

          await interaction.reply({
            embeds: [EmbedFactory.success(interaction.client, "Canal Configurado", `Os anúncios de level up serão enviados em ${channel}.`)],
            ephemeral: true,
          })
        } else {
          db.guilds.set(interaction.guild!.id, { levelUpChannel: undefined })

          await interaction.reply({
            embeds: [EmbedFactory.success(interaction.client, "Canal Removido", "Os anúncios de level up serão enviados no mesmo canal da mensagem.")],
            ephemeral: true,
          })
        }

        logger.command("config-niveis canal", interaction.user.tag, interaction.guild?.name)
        break
      }
    }
  },
}
