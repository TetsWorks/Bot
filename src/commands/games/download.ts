import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js"
import { getTranslation } from "../../utils/i18n"
import { games } from "../../config/games"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("download")
    .setDescription("Baixe nossos jogos e aplicativos")
    .setDescriptionLocalizations({
      "en-US": "Download our games and apps",
      "pt-BR": "Baixe nossos jogos e aplicativos",
    }),

  async execute(interaction: ChatInputCommandInteraction) {
    const locale = interaction.locale.startsWith("pt") ? "pt" : "en"

    const gameProjects = Object.values(games).filter((g) => g.type === "game")
    const appProjects = Object.values(games).filter((g) => g.type === "app")

    const buildRows = (items: typeof gameProjects) => {
      const buttons = items.map((item) =>
        new ButtonBuilder()
          .setCustomId(`download_project:${item.id}`)
          .setLabel(item.name)
          .setStyle(ButtonStyle.Primary)
          .setEmoji(item.type === "game" ? "🎮" : "📱"),
      )

      const rows: ActionRowBuilder<ButtonBuilder>[] = []
      for (let i = 0; i < buttons.length; i += 5) {
        rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(buttons.slice(i, i + 5)))
      }
      return rows
    }

    const gameEmbed = new EmbedBuilder()
      .setColor(0x8b00ff)
      .setTitle("🎮 Jogos da TetsWorks")
      .setDescription("Escolha um jogo para baixar:")
      .setFooter({ text: "TetsWorks Game Studio" })
      .setTimestamp()

    const appEmbed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle("📱 Aplicativos da TetsWorks")
      .setDescription("Escolha um aplicativo para baixar:")
      .setFooter({ text: "TetsWorks Game Studio" })
      .setTimestamp()

    await interaction.reply({
      embeds: [gameEmbed, appEmbed],
      components: [...buildRows(gameProjects), ...buildRows(appProjects)],
      ephemeral: true,
    })
  },
}