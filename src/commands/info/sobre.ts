import { SlashCommandBuilder, type ChatInputCommandInteraction, EmbedBuilder } from "discord.js"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Informações sobre o servidor")
    .setDescriptionLocalizations({
      "en-US": "Server information",
    }),
  async execute(interaction: ChatInputCommandInteraction) {
    const { guild } = interaction
    if (!guild) return

    const embed = new EmbedBuilder()
      .setColor(0x00d9ff)
      .setTitle(`📊 ${guild.name}`)
      // ✅ só adiciona o thumbnail se o servidor tiver ícone
      .addFields(
        { name: "👥 Membros", value: guild.memberCount.toString(), inline: true },
        { name: "📅 Criado em", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
        { name: "👑 Dono", value: `<@${guild.ownerId}>`, inline: true },
        { name: "💬 Canais", value: guild.channels.cache.size.toString(), inline: true },
        { name: "😀 Emojis", value: guild.emojis.cache.size.toString(), inline: true },
        { name: "🎭 Cargos", value: guild.roles.cache.size.toString(), inline: true },
      )
      .setFooter({ text: `ID: ${guild.id}` })
      .setTimestamp()

    const icon = guild.iconURL({ size: 1024 })
    if (icon) embed.setThumbnail(icon) // <-- aqui o ícone é aplicado se existir

    await interaction.reply({ embeds: [embed] })
  },
}
