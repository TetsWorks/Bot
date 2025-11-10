import { SlashCommandBuilder, type ChatInputCommandInteraction, EmbedBuilder } from "discord.js"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sobre")
    .setDescription("Informações sobre o TetsWorks")
    .setDescriptionLocalizations({
      "en-US": "Information about TetsWorks",
    }),
  async execute(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setColor(0x8b00ff)
      .setTitle("🎮 TetsWorks Game Studio")
      .setDescription("Estúdio independente de desenvolvimento de jogos e aplicativos mobile.")
      .setThumbnail("https://placeholder.svg?height=128&width=128&query=tetsworks+logo")
      .addFields(
        { name: "🌐 Website", value: "[tetsworks.vercel.app](https://tetsworks.vercel.app)", inline: true },
        { name: "💻 GitHub", value: "[github.com/TetsWorks](https://github.com/TetsWorks)", inline: true },
        { name: "🎯 Foco", value: "Jogos mobile de alta qualidade", inline: false },
        { name: "🚀 Projetos", value: "Runner Game, Hollow Knight Port, Silksong e muito mais!", inline: false },
      )
      .setFooter({ text: "TetsWorks © 2025", iconURL: interaction.client.user?.displayAvatarURL() })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  },
}
