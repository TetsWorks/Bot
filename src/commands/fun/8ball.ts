import { SlashCommandBuilder, type ChatInputCommandInteraction, EmbedBuilder } from "discord.js"

const respostas = [
  "Sim",
  "Não",
  "Talvez",
  "Com certeza",
  "Definitivamente não",
  "Provavelmente",
  "Não conte com isso",
  "Minhas fontes dizem não",
  "As perspectivas não são boas",
  "Sinais apontam para sim",
  "Resposta incerta, tente novamente",
  "Pergunte novamente mais tarde",
  "Melhor não te dizer agora",
  "Não posso prever agora",
  "Concentre-se e pergunte novamente",
]

module.exports = {
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Ask the magic 8-ball a question")
    .setDescriptionLocalizations({
      "pt-BR": "Faça uma pergunta à bola mágica",
    })
    .addStringOption((option) =>
      option
        .setName("pergunta")
        .setNameLocalizations({ "en-US": "question" })
        .setDescription("Sua pergunta")
        .setDescriptionLocalizations({ "en-US": "Your question" })
        .setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const pergunta = interaction.options.getString("pergunta", true)
    const resposta = respostas[Math.floor(Math.random() * respostas.length)]

    const embed = new EmbedBuilder()
      .setColor(0x8b00ff)
      .setTitle("🎱 Bola Mágica")
      .addFields({ name: "❓ Pergunta", value: pergunta }, { name: "💭 Resposta", value: resposta })
      .setFooter({ text: `Perguntado por ${interaction.user.tag}` })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  },
}
