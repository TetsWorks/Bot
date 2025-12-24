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
    .setName("config-bemvindo")
    .setDescription("Configura as mensagens de boas-vindas")
    .setDescriptionLocalizations({ "en-US": "Configures welcome messages" })
    .addSubcommand((sub) =>
      sub
        .setName("canal")
        .setNameLocalizations({ "en-US": "channel" })
        .setDescription("Define o canal de boas-vindas")
        .setDescriptionLocalizations({ "en-US": "Sets the welcome channel" })
        .addChannelOption((option) =>
          option
            .setName("canal")
            .setNameLocalizations({ "en-US": "channel" })
            .setDescription("Canal para boas-vindas")
            .setDescriptionLocalizations({ "en-US": "Welcome channel" })
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("mensagem")
        .setNameLocalizations({ "en-US": "message" })
        .setDescription("Define a mensagem de boas-vindas personalizada")
        .setDescriptionLocalizations({ "en-US": "Sets the custom welcome message" })
        .addStringOption((option) =>
          option
            .setName("texto")
            .setNameLocalizations({ "en-US": "text" })
            .setDescription("Mensagem (use {user}, {username}, {server}, {memberCount})")
            .setDescriptionLocalizations({ "en-US": "Message (use {user}, {username}, {server}, {memberCount})" })
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("desativar")
        .setNameLocalizations({ "en-US": "disable" })
        .setDescription("Desativa as mensagens de boas-vindas")
        .setDescriptionLocalizations({ "en-US": "Disables welcome messages" })
    )
    .addSubcommand((sub) =>
      sub
        .setName("testar")
        .setNameLocalizations({ "en-US": "test" })
        .setDescription("Testa a mensagem de boas-vindas")
        .setDescriptionLocalizations({ "en-US": "Tests the welcome message" })
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand()

    switch (subcommand) {
      case "canal": {
        const channel = interaction.options.getChannel("canal", true)

        db.guilds.set(interaction.guild!.id, { welcomeChannel: channel.id })

        await interaction.reply({
          embeds: [EmbedFactory.success(interaction.client, "Canal Configurado", `O canal de boas-vindas foi definido para ${channel}.`)],
          ephemeral: true,
        })

        logger.command("config-bemvindo canal", interaction.user.tag, interaction.guild?.name)
        break
      }

      case "mensagem": {
        const message = interaction.options.getString("texto", true)

        db.guilds.set(interaction.guild!.id, { welcomeMessage: message })

        await interaction.reply({
          embeds: [EmbedFactory.success(
            interaction.client,
            "Mensagem Configurada",
            `A mensagem de boas-vindas foi definida:\n\n\`\`\`${message}\`\`\`\n\n**Variáveis disponíveis:**\n• \`{user}\` - Menção do usuário\n• \`{username}\` - Nome do usuário\n• \`{server}\` - Nome do servidor\n• \`{memberCount}\` - Número de membros`
          )],
          ephemeral: true,
        })

        logger.command("config-bemvindo mensagem", interaction.user.tag, interaction.guild?.name)
        break
      }

      case "desativar": {
        db.guilds.set(interaction.guild!.id, {
          welcomeChannel: undefined,
          welcomeMessage: undefined,
        })

        await interaction.reply({
          embeds: [EmbedFactory.success(interaction.client, "Boas-vindas Desativadas", "As mensagens de boas-vindas foram desativadas.")],
          ephemeral: true,
        })

        logger.command("config-bemvindo desativar", interaction.user.tag, interaction.guild?.name)
        break
      }

      case "testar": {
        const guildData = db.guilds.get(interaction.guild!.id)

        if (!guildData?.welcomeChannel) {
          return interaction.reply({
            embeds: [EmbedFactory.error(interaction.client, "Erro", "O canal de boas-vindas não está configurado. Use `/config-bemvindo canal` primeiro.")],
            ephemeral: true,
          })
        }

        const member = interaction.guild?.members.cache.get(interaction.user.id)
        if (!member) return

        const embed = EmbedFactory.welcome(
          interaction.client,
          interaction.user,
          interaction.guild!.name,
          interaction.guild!.memberCount
        )

        if (guildData.welcomeMessage) {
          const customMessage = guildData.welcomeMessage
            .replace("{user}", `${interaction.user}`)
            .replace("{username}", interaction.user.username)
            .replace("{server}", interaction.guild!.name)
            .replace("{memberCount}", interaction.guild!.memberCount.toString())

          embed.setDescription(customMessage)
        }

        await interaction.reply({
          content: "👋 Prévia da mensagem de boas-vindas:",
          embeds: [embed],
          ephemeral: true,
        })
        break
      }
    }
  },
}
