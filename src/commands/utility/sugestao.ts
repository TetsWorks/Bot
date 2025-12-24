import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type TextChannel,
} from "discord.js"
import { EmbedFactory } from "../../utils/embeds"
import { db } from "../../utils/database"
import { logger } from "../../utils/logger"
import { Emojis, Limits } from "../../config/constants"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sugestao")
    .setDescription("Sistema de sugestões")
    .setDescriptionLocalizations({ "en-US": "Suggestion system" })
    .addSubcommand((sub) =>
      sub
        .setName("enviar")
        .setNameLocalizations({ "en-US": "submit" })
        .setDescription("Envia uma sugestão")
        .setDescriptionLocalizations({ "en-US": "Submits a suggestion" })
        .addStringOption((option) =>
          option
            .setName("conteudo")
            .setNameLocalizations({ "en-US": "content" })
            .setDescription("Sua sugestão")
            .setDescriptionLocalizations({ "en-US": "Your suggestion" })
            .setMaxLength(Limits.MaxSuggestionLength)
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("setup")
        .setDescription("Configura o canal de sugestões")
        .setDescriptionLocalizations({ "en-US": "Sets up the suggestions channel" })
        .addChannelOption((option) =>
          option
            .setName("canal")
            .setNameLocalizations({ "en-US": "channel" })
            .setDescription("Canal para sugestões")
            .setDescriptionLocalizations({ "en-US": "Channel for suggestions" })
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("aprovar")
        .setNameLocalizations({ "en-US": "approve" })
        .setDescription("Aprova uma sugestão")
        .setDescriptionLocalizations({ "en-US": "Approves a suggestion" })
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("ID da sugestão")
            .setDescriptionLocalizations({ "en-US": "Suggestion ID" })
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("negar")
        .setNameLocalizations({ "en-US": "deny" })
        .setDescription("Nega uma sugestão")
        .setDescriptionLocalizations({ "en-US": "Denies a suggestion" })
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("ID da sugestão")
            .setDescriptionLocalizations({ "en-US": "Suggestion ID" })
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("motivo")
            .setNameLocalizations({ "en-US": "reason" })
            .setDescription("Motivo da negação")
            .setDescriptionLocalizations({ "en-US": "Reason for denial" })
            .setRequired(false)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand()

    switch (subcommand) {
      case "enviar": {
        const content = interaction.options.getString("conteudo", true)
        const guildData = db.guilds.get(interaction.guild!.id)

        if (!guildData?.suggestionsChannel) {
          return interaction.reply({
            embeds: [EmbedFactory.error(interaction.client, "Erro", "O sistema de sugestões não foi configurado. Peça a um administrador para usar `/sugestao setup`.")],
            ephemeral: true,
          })
        }

        const channel = interaction.guild?.channels.cache.get(guildData.suggestionsChannel) as TextChannel | undefined
        if (!channel) {
          return interaction.reply({
            embeds: [EmbedFactory.error(interaction.client, "Erro", "Canal de sugestões não encontrado.")],
            ephemeral: true,
          })
        }

        const suggestionId = `sug-${Date.now().toString(36)}`

        const embed = EmbedFactory.suggestion(interaction.client, interaction.user, content, suggestionId)

        const upButton = new ButtonBuilder()
          .setCustomId(`suggestion_vote:${suggestionId}:up`)
          .setLabel("0")
          .setStyle(ButtonStyle.Success)
          .setEmoji(Emojis.ThumbsUp)

        const downButton = new ButtonBuilder()
          .setCustomId(`suggestion_vote:${suggestionId}:down`)
          .setLabel("0")
          .setStyle(ButtonStyle.Danger)
          .setEmoji(Emojis.ThumbsDown)

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(upButton, downButton)

        const message = await channel.send({ embeds: [embed], components: [row] })

        db.suggestions.create({
          id: suggestionId,
          messageId: message.id,
          userId: interaction.user.id,
          content,
          status: "pending",
          votes: { up: [], down: [] },
        })

        logger.command("sugestao enviar", interaction.user.tag, interaction.guild?.name)

        await interaction.reply({
          embeds: [EmbedFactory.success(interaction.client, "Sugestão Enviada", `Sua sugestão foi enviada em ${channel}!\n\nID: \`${suggestionId}\``)],
          ephemeral: true,
        })
        break
      }

      case "setup": {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({
            embeds: [EmbedFactory.error(interaction.client, "Erro", "Você precisa ser administrador para configurar o sistema de sugestões.")],
            ephemeral: true,
          })
        }

        const channel = interaction.options.getChannel("canal", true)

        db.guilds.set(interaction.guild!.id, {
          suggestionsChannel: channel.id,
        })

        await interaction.reply({
          embeds: [EmbedFactory.success(interaction.client, "Configuração Salva", `Canal de sugestões configurado para ${channel}!`)],
          ephemeral: true,
        })

        logger.command("sugestao setup", interaction.user.tag, interaction.guild?.name)
        break
      }

      case "aprovar":
      case "negar": {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
          return interaction.reply({
            embeds: [EmbedFactory.error(interaction.client, "Erro", "Você não tem permissão para gerenciar sugestões.")],
            ephemeral: true,
          })
        }

        const suggestionId = interaction.options.getString("id", true)
        const suggestion = db.suggestions.get(suggestionId)

        if (!suggestion) {
          return interaction.reply({
            embeds: [EmbedFactory.error(interaction.client, "Erro", "Sugestão não encontrada.")],
            ephemeral: true,
          })
        }

        const status = subcommand === "aprovar" ? "approved" : "denied"
        const reason = subcommand === "negar" ? interaction.options.getString("motivo") : null

        db.suggestions.updateStatus(suggestionId, status)

        const statusText = status === "approved" ? "✅ Aprovada" : "❌ Negada"
        let responseText = `Sugestão \`${suggestionId}\` foi ${status === "approved" ? "aprovada" : "negada"}.`
        if (reason) {
          responseText += `\n\n**Motivo:** ${reason}`
        }

        await interaction.reply({
          embeds: [EmbedFactory.success(interaction.client, statusText, responseText)],
        })
        break
      }
    }
  },
}
