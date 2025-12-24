import {
  type ButtonInteraction,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ChannelType,
  type GuildMember,
} from "discord.js"
import { getTranslation } from "../utils/i18n"
import { games } from "../config/games"
import { db } from "../utils/database"
import { EmbedFactory } from "../utils/embeds"
import { logger } from "../utils/logger"
import { Limits } from "../config/constants"

export async function handleButton(interaction: ButtonInteraction) {
  const [action, ...params] = interaction.customId.split(":")
  const locale = interaction.locale.startsWith("pt") ? "pt" : "en"
  const t = (key: string) => getTranslation(locale, key)

  try {
    switch (action) {
      case "download_game":
      case "download_project":
        await handleDownloadGame(interaction, params[0], locale, t)
        break

      case "accept_rules":
        await handleAcceptRules(interaction, params[0], locale, t)
        break

      case "verify_age":
        await handleVerifyAge(interaction, params[0], locale, t)
        break

      case "ticket_close":
        await handleTicketClose(interaction, params[0])
        break

      case "ticket_panel_open":
        await handleTicketPanelOpen(interaction)
        break

      case "giveaway_join":
        await handleGiveawayJoin(interaction, params[0])
        break

      case "suggestion_vote":
        await handleSuggestionVote(interaction, params[0], params[1] as "up" | "down")
        break

      case "role_toggle":
        await handleRoleToggle(interaction, params[0])
        break

      default:
        await interaction.reply({
          content: t("error.unknown_button"),
          ephemeral: true,
        })
    }
  } catch (error) {
    logger.error("Erro no buttonHandler", error as Error, "Button")
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: t("error.generic"),
        ephemeral: true,
      })
    }
  }
}

async function handleDownloadGame(
  interaction: ButtonInteraction,
  gameId: string,
  locale: string,
  t: (key: string) => string
) {
  const game = games[gameId]

  if (!game) {
    await interaction.reply({
      content: t("error.game_not_found"),
      ephemeral: true,
    })
    return
  }

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
      }))
    )

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

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
  t: (key: string) => string
) {
  try {
    const member = interaction.member as GuildMember
    if (!member) {
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
    logger.error("Erro ao dar role", error as Error, "AcceptRules")
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
  t: (key: string) => string
) {
  try {
    const member = interaction.member as GuildMember
    if (!member) {
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
    logger.error("Erro ao verificar idade", error as Error, "VerifyAge")
    await interaction.reply({
      content: t("error.role_failed"),
      ephemeral: true,
    })
  }
}

async function handleTicketClose(interaction: ButtonInteraction, ticketId: string) {
  const ticket = db.tickets.get(ticketId)

  if (!ticket) {
    await interaction.reply({
      embeds: [EmbedFactory.error(interaction.client, "Erro", "Ticket não encontrado.")],
      ephemeral: true,
    })
    return
  }

  db.tickets.close(ticketId)

  const embed = EmbedFactory.ticket(interaction.client, "closed", interaction.user, ticketId)
  await interaction.reply({ embeds: [embed] })

  setTimeout(async () => {
    try {
      await interaction.channel?.delete()
    } catch (error) {
      logger.error("Erro ao deletar canal do ticket", error as Error, "TicketClose")
    }
  }, 5000)
}

async function handleTicketPanelOpen(interaction: ButtonInteraction) {
  const guildData = db.guilds.get(interaction.guild!.id)

  if (!guildData?.ticketCategory) {
    await interaction.reply({
      embeds: [EmbedFactory.error(interaction.client, "Erro", "O sistema de tickets não está configurado.")],
      ephemeral: true,
    })
    return
  }

  const userTickets = db.tickets.getByUser(interaction.user.id)
  if (userTickets.length >= Limits.MaxTicketsPerUser) {
    await interaction.reply({
      embeds: [EmbedFactory.error(interaction.client, "Erro", `Você já possui ${Limits.MaxTicketsPerUser} ticket(s) aberto(s).`)],
      ephemeral: true,
    })
    return
  }

  const ticketId = `ticket-${Date.now().toString(36)}`

  try {
    const channel = await interaction.guild!.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: guildData.ticketCategory,
      permissionOverwrites: [
        {
          id: interaction.guild!.id,
          deny: ["ViewChannel"],
        },
        {
          id: interaction.user.id,
          allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
        },
      ],
    })

    db.tickets.create({
      id: ticketId,
      channelId: channel.id,
      userId: interaction.user.id,
      createdAt: Date.now(),
      status: "open",
    })

    const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
    const { Emojis } = require("../config/constants")

    const embed = EmbedFactory.ticket(interaction.client, "created", interaction.user, ticketId)

    const closeButton = new ButtonBuilder()
      .setCustomId(`ticket_close:${ticketId}`)
      .setLabel("Fechar Ticket")
      .setStyle(ButtonStyle.Danger)
      .setEmoji(Emojis.Lock)

    const row = new ActionRowBuilder().addComponents(closeButton)

    await channel.send({
      content: `${interaction.user}`,
      embeds: [embed],
      components: [row],
    })

    await interaction.reply({
      embeds: [EmbedFactory.success(interaction.client, "Ticket Criado", `Seu ticket foi criado em ${channel}!`)],
      ephemeral: true,
    })
  } catch (error) {
    logger.error("Erro ao criar ticket via painel", error as Error, "TicketPanel")
    await interaction.reply({
      embeds: [EmbedFactory.error(interaction.client, "Erro", "Não foi possível criar o ticket.")],
      ephemeral: true,
    })
  }
}

async function handleGiveawayJoin(interaction: ButtonInteraction, giveawayId: string) {
  const giveaway = db.giveaways.get(giveawayId)

  if (!giveaway) {
    await interaction.reply({
      embeds: [EmbedFactory.error(interaction.client, "Erro", "Sorteio não encontrado.")],
      ephemeral: true,
    })
    return
  }

  if (giveaway.ended) {
    await interaction.reply({
      embeds: [EmbedFactory.error(interaction.client, "Erro", "Este sorteio já foi encerrado.")],
      ephemeral: true,
    })
    return
  }

  if (giveaway.participants.includes(interaction.user.id)) {
    await interaction.reply({
      embeds: [EmbedFactory.info(interaction.client, "Já Participando", "Você já está participando deste sorteio!")],
      ephemeral: true,
    })
    return
  }

  db.giveaways.addParticipant(giveawayId, interaction.user.id)

  await interaction.reply({
    embeds: [EmbedFactory.success(interaction.client, "Participação Confirmada", "Você está participando do sorteio! Boa sorte! 🍀")],
    ephemeral: true,
  })
}

async function handleSuggestionVote(
  interaction: ButtonInteraction,
  suggestionId: string,
  voteType: "up" | "down"
) {
  const suggestion = db.suggestions.get(suggestionId)

  if (!suggestion) {
    await interaction.reply({
      embeds: [EmbedFactory.error(interaction.client, "Erro", "Sugestão não encontrada.")],
      ephemeral: true,
    })
    return
  }

  db.suggestions.vote(suggestionId, interaction.user.id, voteType)

  const updatedSuggestion = db.suggestions.get(suggestionId)!
  const upVotes = updatedSuggestion.votes.up.length
  const downVotes = updatedSuggestion.votes.down.length

  await interaction.reply({
    content: `✅ Seu voto foi registrado! (👍 ${upVotes} | 👎 ${downVotes})`,
    ephemeral: true,
  })
}

async function handleRoleToggle(interaction: ButtonInteraction, roleId: string) {
  const member = interaction.member as GuildMember
  if (!member) {
    await interaction.reply({
      embeds: [EmbedFactory.error(interaction.client, "Erro", "Membro não encontrado.")],
      ephemeral: true,
    })
    return
  }

  const role = interaction.guild?.roles.cache.get(roleId)
  if (!role) {
    await interaction.reply({
      embeds: [EmbedFactory.error(interaction.client, "Erro", "Cargo não encontrado.")],
      ephemeral: true,
    })
    return
  }

  try {
    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(roleId)
      await interaction.reply({
        embeds: [EmbedFactory.success(interaction.client, "Cargo Removido", `O cargo ${role} foi removido!`)],
        ephemeral: true,
      })
    } else {
      await member.roles.add(roleId)
      await interaction.reply({
        embeds: [EmbedFactory.success(interaction.client, "Cargo Adicionado", `O cargo ${role} foi adicionado!`)],
        ephemeral: true,
      })
    }
  } catch (error) {
    logger.error("Erro ao alternar cargo", error as Error, "RoleToggle")
    await interaction.reply({
      embeds: [EmbedFactory.error(interaction.client, "Erro", "Não foi possível alterar o cargo. Verifique as permissões do bot.")],
      ephemeral: true,
    })
  }
}
