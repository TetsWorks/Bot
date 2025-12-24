import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js"
import { Colors, Emojis } from "../../config/constants"

const categories = {
  info: {
    emoji: "📊",
    name: "Informações",
    commands: [
      { name: "ping", description: "Latência do bot" },
      { name: "sobre", description: "Sobre o TetsWorks" },
      { name: "server", description: "Informações do servidor" },
      { name: "user", description: "Informações de usuário" },
      { name: "ajuda", description: "Esta mensagem" },
    ],
  },
  games: {
    emoji: "🎮",
    name: "Jogos",
    commands: [
      { name: "download", description: "Baixar nossos jogos e apps" },
    ],
  },
  fun: {
    emoji: "🎲",
    name: "Diversão",
    commands: [
      { name: "avatar", description: "Avatar de usuário" },
      { name: "8ball", description: "Bola mágica" },
      { name: "dado", description: "Rolar dado" },
      { name: "moeda", description: "Jogar moeda" },
    ],
  },
  levels: {
    emoji: "📈",
    name: "Níveis",
    commands: [
      { name: "nivel", description: "Ver seu nível e XP" },
      { name: "rank", description: "Ranking do servidor" },
      { name: "config-niveis", description: "Configurar sistema de níveis" },
    ],
  },
  moderation: {
    emoji: "🛡️",
    name: "Moderação",
    commands: [
      { name: "ban", description: "Banir usuário" },
      { name: "unban", description: "Desbanir usuário" },
      { name: "kick", description: "Expulsar usuário" },
      { name: "mute", description: "Silenciar usuário" },
      { name: "unmute", description: "Remover silenciamento" },
      { name: "warn", description: "Gerenciar avisos" },
      { name: "limpar", description: "Limpar mensagens" },
    ],
  },
  utility: {
    emoji: "🔧",
    name: "Utilidades",
    commands: [
      { name: "ticket", description: "Sistema de tickets" },
      { name: "sugestao", description: "Sistema de sugestões" },
      { name: "sorteio", description: "Sistema de sorteios" },
      { name: "enquete", description: "Criar enquetes" },
      { name: "cargo-reacao", description: "Cargos por reação" },
    ],
  },
  admin: {
    emoji: "👑",
    name: "Administração",
    commands: [
      { name: "anuncio", description: "Fazer anúncio rápido" },
      { name: "setup-download", description: "Criar painel de download" },
      { name: "setup-anuncio", description: "Criar anúncio personalizado" },
      { name: "setup-regras", description: "Criar painel de regras" },
      { name: "config-bemvindo", description: "Configurar boas-vindas" },
    ],
  },
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ajuda")
    .setDescription("Lista todos os comandos disponíveis")
    .setDescriptionLocalizations({
      "en-US": "Lists all available commands",
    })
    .addStringOption((option) =>
      option
        .setName("categoria")
        .setNameLocalizations({ "en-US": "category" })
        .setDescription("Categoria específica de comandos")
        .setDescriptionLocalizations({ "en-US": "Specific command category" })
        .addChoices(
          { name: "📊 Informações", value: "info" },
          { name: "🎮 Jogos", value: "games" },
          { name: "🎲 Diversão", value: "fun" },
          { name: "📈 Níveis", value: "levels" },
          { name: "🛡️ Moderação", value: "moderation" },
          { name: "🔧 Utilidades", value: "utility" },
          { name: "👑 Administração", value: "admin" }
        )
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const selectedCategory = interaction.options.getString("categoria")

    if (selectedCategory) {
      const category = categories[selectedCategory as keyof typeof categories]
      const embed = new EmbedBuilder()
        .setColor(Colors.Primary)
        .setTitle(`${category.emoji} Comandos de ${category.name}`)
        .setDescription(
          category.commands.map((cmd) => `\`/${cmd.name}\` - ${cmd.description}`).join("\n")
        )
        .setFooter({ text: "TetsWorks Game Studio", iconURL: interaction.client.user?.displayAvatarURL() })
        .setTimestamp()

      return interaction.reply({ embeds: [embed] })
    }

    const embed = new EmbedBuilder()
      .setColor(Colors.Primary)
      .setTitle(`${Emojis.Info} Central de Ajuda - TetsWorks Bot`)
      .setDescription(
        "Bem-vindo à central de ajuda! Selecione uma categoria abaixo para ver os comandos disponíveis.\n\n" +
        Object.entries(categories)
          .map(([key, cat]) => `${cat.emoji} **${cat.name}** - ${cat.commands.length} comandos`)
          .join("\n")
      )
      .addFields({
        name: "📌 Dicas",
        value:
          "• Use `/ajuda <categoria>` para ver comandos específicos\n" +
          "• Comandos com 👑 requerem permissões especiais\n" +
          "• Precisa de ajuda? Abra um ticket com `/ticket criar`",
      })
      .setFooter({ text: "TetsWorks Game Studio", iconURL: interaction.client.user?.displayAvatarURL() })
      .setTimestamp()

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("help_category")
      .setPlaceholder("Selecione uma categoria")
      .addOptions(
        Object.entries(categories).map(([key, cat]) => ({
          label: cat.name,
          value: key,
          emoji: cat.emoji,
          description: `${cat.commands.length} comandos`,
        }))
      )

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

    await interaction.reply({ embeds: [embed], components: [row] })
  },
}
