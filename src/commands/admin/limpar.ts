import { SlashCommandBuilder, type ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js"
import { getTranslation } from "../../utils/i18n"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("limpar")
    .setDescription("Limpa mensagens do canal")
    .setDescriptionLocalizations({
      "en-US": "Clears messages from the channel",
    })
    .addIntegerOption((option) =>
      option
        .setName("quantidade")
        .setNameLocalizations({ "en-US": "amount" })
        .setDescription("Quantidade de mensagens (1-100)")
        .setDescriptionLocalizations({ "en-US": "Amount of messages (1-100)" })
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction: ChatInputCommandInteraction) {
    const locale = interaction.locale.startsWith("pt") ? "pt" : "en"
    const quantidade = interaction.options.getInteger("quantidade", true)

    if (!interaction.channel || !("bulkDelete" in interaction.channel)) {
      await interaction.reply({
        content: getTranslation(locale, "error.generic"),
        ephemeral: true,
      })
      return
    }

    await interaction.channel.bulkDelete(quantidade, true)
    await interaction.reply({
      content: getTranslation(locale, "clear.success", { amount: quantidade.toString() }),
      ephemeral: true,
    })
  },
}
