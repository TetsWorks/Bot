import type { ButtonInteraction } from "discord.js"
import { getTranslation } from "../utils/i18n"
import { games } from "../config/games"

export async function handleButton(interaction: ButtonInteraction) {
  const [action, ...params] = interaction.customId.split(":")
  const locale = interaction.locale.startsWith("pt") ? "pt" : "en"
  const t = (key: string) => getTranslation(locale, key)

  try {
    switch (action) {
      case "download_game":
        await handleDownloadGame(interaction, params[0], locale, t)
        break

      case "accept_rules":
        await handleAcceptRules(interaction, params[0], locale, t)
        break

      case "verify_age":
        await handleVerifyAge(interaction, params[0], locale, t)
        break

      default:
        await interaction.reply({
          content: t("error.unknown_button"),
          ephemeral: true,
        })
    }
  } catch (error) {
    console.error("Erro no buttonHandler:", error)
    await interaction.reply({
      content: t("error.generic"),
      ephemeral: true,
    })
  }
}

async function handleDownloadGame(
  interaction: ButtonInteraction,
  gameId: string,
  locale: string,
  t: (key: string) => string,
) {
  const game = games[gameId]

  if (!game) {
    await interaction.reply({
      content: t("error.game_not_found"),
      ephemeral: true,
    })
    return
  }

  const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js")

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`select_version:${gameId}`)
    .setPlaceholder(t("download.select_version"))
    .addOptions(
      game.versions.map((version) => ({
        label: version.name,
        description: `${version.size} - ${version.date}`,
        value: version.id,
        emoji:
          version.platform === "android"
            ? "🤖"
            : version.platform === "ios"
              ? "🍎"
              : version.platform === "windows"
                ? "🪟"
                : "🎮",
      })),
    )

  const row = new ActionRowBuilder().addComponents(selectMenu)

  await interaction.reply({
    content: t("download.choose_version"),
    components: [row],
    ephemeral: true,
  })
}

async function handleAcceptRules(
  interaction: ButtonInteraction,
  roleId: string,
  locale: string,
  t: (key: string) => string,
) {
  try {
    const member = interaction.member
    if (!member || !("roles" in member)) {
      await interaction.reply({
        content: t("error.member_not_found"),
        ephemeral: true,
      })
      return
    }

    await member.roles.add(roleId)
    await interaction.reply({
      content: t("rules.accepted"),
      ephemeral: true,
    })
  } catch (error) {
    console.error("Erro ao dar role:", error)
    await interaction.reply({
      content: t("error.role_failed"),
      ephemeral: true,
    })
  }
}

async function handleVerifyAge(
  interaction: ButtonInteraction,
  roleId: string,
  locale: string,
  t: (key: string) => string,
) {
  try {
    const member = interaction.member
    if (!member || !("roles" in member)) {
      await interaction.reply({
        content: t("error.member_not_found"),
        ephemeral: true,
      })
      return
    }

    await member.roles.add(roleId)
    await interaction.reply({
      content: t("verify.age_verified"),
      ephemeral: true,
    })
  } catch (error) {
    console.error("Erro ao verificar idade:", error)
    await interaction.reply({
      content: t("error.role_failed"),
      ephemeral: true,
    })
  }
}
