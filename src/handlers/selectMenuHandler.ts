import { type StringSelectMenuInteraction, EmbedBuilder } from "discord.js"
import { getTranslation } from "../utils/i18n"
import { games } from "../config/games"
import { Colors } from "../config/constants"
import { logger } from "../utils/logger"

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

export async function handleSelectMenu(interaction: StringSelectMenuInteraction) {
  const [action, ...params] = interaction.customId.split(":")
  const locale = interaction.locale.startsWith("pt") ? "pt" : "en"
  const t = (key: string) => getTranslation(locale, key)

  try {
    switch (action) {
      case "select_version":
        await handleVersionSelect(interaction, params[0], locale, t)
        break

      case "help_category":
        await handleHelpCategory(interaction)
        break

      default:
        await interaction.reply({
          content: t("error.unknown_menu"),
          ephemeral: true,
        })
    }
  } catch (error) {
    logger.error("Erro no selectMenuHandler", error as Error, "SelectMenu")
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: t("error.generic"),
        ephemeral: true,
      })
    }
  }
}

async function handleVersionSelect(
  interaction: StringSelectMenuInteraction,
  gameId: string,
  locale: string,
  t: (key: string) => string
) {
  const game = games[gameId]
  const versionId = interaction.values[0]
  const version = game?.versions.find((v) => v.id === versionId)

  if (!version) {
    await interaction.reply({
      content: t("error.version_not_found"),
      ephemeral: true,
    })
    return
  }

  const embed = new EmbedBuilder()
    .setColor(game.color)
    .setTitle(`${game.name} - ${version.name}`)
    .setDescription(version.description)
    .setThumbnail(game.thumbnail)
    .addFields(
      {
        name: t("download.platform"),
        value:
          version.platform === "android"
            ? "🤖 Android"
            : version.platform === "ios"
              ? "🍎 iOS"
              : version.platform === "windows"
                ? "🪟 Windows"
                : "🎮 Universal",
        inline: true,
      },
      {
        name: t("download.size"),
        value: version.size,
        inline: true,
      },
      {
        name: t("download.date"),
        value: version.date,
        inline: true,
      }
    )
    .setFooter({
      text: t("download.footer"),
      iconURL: interaction.client.user?.displayAvatarURL(),
    })
    .setTimestamp()

  if (version.changelog && version.changelog.length > 0) {
    embed.addFields({
      name: t("download.changelog"),
      value: version.changelog.map((change) => `• ${change}`).join("\n"),
    })
  }

  await interaction.reply({
    content: `## 📥 ${t("download.ready")}\n${version.downloadUrl}`,
    embeds: [embed],
    ephemeral: true,
  })
}

async function handleHelpCategory(interaction: StringSelectMenuInteraction) {
  const categoryKey = interaction.values[0] as keyof typeof categories
  const category = categories[categoryKey]

  if (!category) {
    await interaction.reply({
      content: "❌ Categoria não encontrada.",
      ephemeral: true,
    })
    return
  }

  const embed = new EmbedBuilder()
    .setColor(Colors.Primary)
    .setTitle(`${category.emoji} Comandos de ${category.name}`)
    .setDescription(
      category.commands.map((cmd) => `\`/${cmd.name}\` - ${cmd.description}`).join("\n")
    )
    .setFooter({ text: "TetsWorks Game Studio", iconURL: interaction.client.user?.displayAvatarURL() })
    .setTimestamp()

  await interaction.reply({ embeds: [embed], ephemeral: true })
}
