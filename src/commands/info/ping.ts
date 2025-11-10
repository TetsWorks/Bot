import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js"
import { getTranslation } from "../../utils/i18n"

module.exports = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Shows bot latency").setDescriptionLocalizations({
    "pt-BR": "Mostra a latência do bot",
  }),
  async execute(interaction: ChatInputCommandInteraction) {
    const locale = interaction.locale.startsWith("pt") ? "pt" : "en"
    const latency = Date.now() - interaction.createdTimestamp

    await interaction.reply(getTranslation(locale, "ping.pong", { latency: latency.toString() }))
  },
}
