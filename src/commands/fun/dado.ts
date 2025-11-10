import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js"
import { getTranslation } from "../../utils/i18n"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dado")
    .setDescription("Rola um dado")
    .setDescriptionLocalizations({
      "en-US": "Roll a dice",
    })
    .addIntegerOption((option) =>
      option
        .setName("lados")
        .setNameLocalizations({ "en-US": "sides" })
        .setDescription("Número de lados (padrão: 6)")
        .setDescriptionLocalizations({ "en-US": "Number of sides (default: 6)" })
        .setMinValue(2)
        .setMaxValue(100)
        .setRequired(false),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const locale = interaction.locale.startsWith("pt") ? "pt" : "en"
    const lados = interaction.options.getInteger("lados") || 6
    const resultado = Math.floor(Math.random() * lados) + 1

    await interaction.reply(
      getTranslation(locale, "dice.result", {
        sides: lados.toString(),
        result: resultado.toString(),
      }),
    )
  },
}
