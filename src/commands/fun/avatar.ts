import { SlashCommandBuilder, type ChatInputCommandInteraction, EmbedBuilder } from "discord.js"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Shows a user's avatar")
    .setDescriptionLocalizations({
      "pt-BR": "Mostra o avatar de um usuário",
    })
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setNameLocalizations({ "en-US": "user" })
        .setDescription("O usuário")
        .setDescriptionLocalizations({ "en-US": "The user" })
        .setRequired(false),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("usuario") || interaction.user

    const embed = new EmbedBuilder()
      .setColor(0x00d9ff)
      .setTitle(`Avatar de ${user.tag}`)
      .setImage(user.displayAvatarURL({ size: 512 }))
      .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  },
}
