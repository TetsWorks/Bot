import { SlashCommandBuilder, type ChatInputCommandInteraction, EmbedBuilder } from "discord.js"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Informações sobre um usuário")
    .setDescriptionLocalizations({
      "en-US": "User information",
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
    const member = interaction.guild?.members.cache.get(user.id)

    const embed = new EmbedBuilder()
      .setColor(0xff1744)
      .setTitle(`👤 ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "🆔 ID", value: user.id, inline: true },
        { name: "📅 Conta criada", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true },
        { name: "🤖 Bot", value: user.bot ? "Sim" : "Não", inline: true },
      )

    if (member) {
      embed.addFields(
        { name: "📥 Entrou no servidor", value: `<t:${Math.floor(member.joinedTimestamp! / 1000)}:D>`, inline: true },
        { name: "🎭 Cargos", value: member.roles.cache.size.toString(), inline: true },
      )
    }

    await interaction.reply({ embeds: [embed] })
  },
}
