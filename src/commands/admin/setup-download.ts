import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
} from "discord.js"
import { getTranslation } from "../../utils/i18n"
import { games } from "../../config/games"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-download")
    .setDescription("Cria uma mensagem de download permanente de jogo ou aplicativo")
    .setDescriptionLocalizations({
      "en-US": "Creates a permanent download message for a game or app",
      "pt-BR": "Cria mensagem de download permanente de jogo ou aplicativo",
    })
    .addStringOption((option) =>
      option
        .setName("tipo")
        .setDescription("Selecione se é um jogo ou aplicativo")
        .setDescriptionLocalizations({
          "en-US": "Select if it's a game or an app",
        })
        .setRequired(true)
        .addChoices(
          { name: "🎮 Jogo", value: "game" },
          { name: "📱 Aplicativo", value: "app" },
        ),
    )
    .addStringOption((option) =>
      option
        .setName("projeto")
        .setDescription("Selecione o projeto para criar a mensagem")
        .setDescriptionLocalizations({
          "en-US": "Select the project to create the message",
        })
        .setRequired(true)
        .addChoices(
          ...Object.values(games).map((project) => ({
            name: project.name,
            value: project.id,
          })),
        ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction: ChatInputCommandInteraction) {
    const locale = interaction.locale.startsWith("pt") ? "pt" : "en"
    const type = interaction.options.getString("tipo", true)
    const projectId = interaction.options.getString("projeto", true)
    const project = games[projectId]

    if (!project || project.type !== type) {
      await interaction.reply({
        content:
          locale === "pt"
            ? "❌ Projeto não encontrado ou tipo incorreto."
            : "❌ Project not found or wrong type.",
        ephemeral: true,
      })
      return
    }

    const embed = new EmbedBuilder()
      .setColor(project.color)
      .setTitle(`📦 ${project.name}`)
      .setDescription(project.description)
      .setThumbnail(project.thumbnail)
      .addFields(
        {
          name: "🧩 Tipo",
          value: project.type === "app" ? "Aplicativo" : "Jogo",
          inline: true,
        },
        {
          name: "📦 Versões disponíveis",
          value: `${project.versions.length} versão(ões)`,
          inline: true,
        },
        {
          name: "💾 Última atualização",
          value: project.versions[0].date,
          inline: true,
        },
      )
      .setFooter({ text: "TetsWorks Game Studio" })
      .setTimestamp()

    const button = new ButtonBuilder()
      .setCustomId(`download_project:${project.id}`)
      .setLabel("📥 Baixar")
      .setStyle(ButtonStyle.Success)

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button)

    const canal = interaction.channel
    if (canal && canal.isTextBased() && "send" in canal) {
      await (canal as TextChannel).send({
        embeds: [embed],
        components: [row],
      })
    }

    await interaction.reply({
      content:
        locale === "pt"
          ? "✅ Mensagem de download criada com sucesso!"
          : "✅ Download message created successfully!",
      ephemeral: true,
    })
  },
}