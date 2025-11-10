import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js"
import { getTranslation } from "../../utils/i18n"

module.exports = {
  data: new SlashCommandBuilder().setName("moeda").setDescription("Joga uma moeda").setDescriptionLocalizations({
    "en-US": "Flip a coin",
  }),
  async execute(interaction: ChatInputCommandInteraction) {
    const locale = interaction.locale.startsWith("pt") ? "pt" : "en"
    const resultado = Math.random() < 0.5 ? "coinflip.heads" : "coinflip.tails"

    await interaction.reply(
      getTranslation(locale, "coinflip.result", {
        result: getTranslation(locale, resultado),
      }),
    )
  },
}
