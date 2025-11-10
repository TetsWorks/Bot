import { SlashCommandBuilder, type ChatInputCommandInteraction, EmbedBuilder } from "discord.js"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ajuda")
    .setDescription("Lista todos os comandos disponíveis")
    .setDescriptionLocalizations({
      "en-US": "Lists all available commands",
    }),
  async execute(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setColor(0x8b00ff)
      .setTitle("📚 Comandos do TetsWorks Bot")
      .setDescription("Aqui estão todos os comandos disponíveis:")
      .addFields(
        {
          name: "📊 Informações",
          value:
            "`/ping` - Latência do bot\n`/sobre` - Sobre o TetsWorks\n`/server` - Info do servidor\n`/user` - Info de usuário\n`/ajuda` - Esta mensagem",
        },
        {
          name: "🎮 Jogos",
          value: "`/download` - Baixar nossos jogos",
        },
        {
          name: "🎲 Diversão",
          value: "`/avatar` - Avatar de usuário\n`/8ball` - Bola mágica\n`/dado` - Rolar dado\n`/moeda` - Jogar moeda",
        },
        {
          name: "👑 Admin",
          value:
            "`/limpar` - Limpar mensagens\n`/anuncio` - Fazer anúncio\n`/setup-download` - Criar msg download\n`/setup-anuncio` - Criar anúncio personalizado\n`/setup-regras` - Criar msg de regras",
        },
      )
      .setFooter({ text: "TetsWorks Game Studio", iconURL: interaction.client.user?.displayAvatarURL() })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  },
}
