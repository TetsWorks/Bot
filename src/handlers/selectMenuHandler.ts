import { type StringSelectMenuInteraction, EmbedBuilder } from "discord.js"
import { getTranslation } from "../utils/i18n"
import { games } from "../config/games"

export async function handleSelectMenu(interaction: StringSelectMenuInteraction) {
  const [action, gameId] = interaction.customId.split(":")
  const locale = interaction.locale.startsWith("pt") ? "pt" : "en"
  const t = (key: string) => getTranslation(locale, key)

  try {
    if (action === "select_version") {
      await handleVersionSelect(interaction, gameId, locale, t)
    } else {
      await interaction.reply({
        content: t("error.unknown_menu"),
        ephemeral: true,
      })
    }
  } catch (error) {
    console.error("Erro no selectMenuHandler:", error)
    await interaction.reply({
      content: t("error.generic"),
      ephemeral: true,
    })
  }
}

async function handleVersionSelect(
  interaction: StringSelectMenuInteraction,
  gameId: string,
  locale: string,
  t: (key: string) => string,
) {
  const game = games[gameId]
  const versionId = interaction.values[0]
  const version = game.versions.find((v) => v.id === versionId)

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
      },
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
