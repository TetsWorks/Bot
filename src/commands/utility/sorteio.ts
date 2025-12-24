import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type TextChannel,
} from "discord.js"
import { EmbedFactory } from "../../utils/embeds"
import { db } from "../../utils/database"
import { logger } from "../../utils/logger"
import { Emojis, Limits, Colors } from "../../config/constants"

function parseDuration(duration: string): number | null {
  const match = duration.match(/^(\d+)(m|h|d)$/)
  if (!match) return null

  const value = parseInt(match[1])
  const unit = match[2]

  const multipliers: Record<string, number> = {
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }

  return value * multipliers[unit]
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sorteio")
    .setDescription("Sistema de sorteios")
    .setDescriptionLocalizations({ "en-US": "Giveaway system" })
    .addSubcommand((sub) =>
      sub
        .setName("criar")
        .setNameLocalizations({ "en-US": "create" })
        .setDescription("Cria um novo sorteio")
        .setDescriptionLocalizations({ "en-US": "Creates a new giveaway" })
        .addStringOption((option) =>
          option
            .setName("premio")
            .setNameLocalizations({ "en-US": "prize" })
            .setDescription("O prêmio do sorteio")
            .setDescriptionLocalizations({ "en-US": "The giveaway prize" })
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("duracao")
            .setNameLocalizations({ "en-US": "duration" })
            .setDescription("Duração do sorteio (ex: 10m, 1h, 1d)")
            .setDescriptionLocalizations({ "en-US": "Giveaway duration (e.g., 10m, 1h, 1d)" })
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("vencedores")
            .setNameLocalizations({ "en-US": "winners" })
            .setDescription("Número de vencedores (padrão: 1)")
            .setDescriptionLocalizations({ "en-US": "Number of winners (default: 1)" })
            .setMinValue(1)
            .setMaxValue(20)
            .setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("finalizar")
        .setNameLocalizations({ "en-US": "end" })
        .setDescription("Finaliza um sorteio antecipadamente")
        .setDescriptionLocalizations({ "en-US": "Ends a giveaway early" })
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("ID do sorteio")
            .setDescriptionLocalizations({ "en-US": "Giveaway ID" })
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("reroll")
        .setDescription("Sorteia novos vencedores")
        .setDescriptionLocalizations({ "en-US": "Rerolls new winners" })
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("ID do sorteio")
            .setDescriptionLocalizations({ "en-US": "Giveaway ID" })
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand()

    switch (subcommand) {
      case "criar": {
        const prize = interaction.options.getString("premio", true)
        const durationStr = interaction.options.getString("duracao", true)
        const winnersCount = interaction.options.getInteger("vencedores") || 1

        const duration = parseDuration(durationStr)
        if (!duration) {
          return interaction.reply({
            embeds: [EmbedFactory.error(interaction.client, "Erro", "Formato de duração inválido. Use: 10m, 1h, 1d")],
            ephemeral: true,
          })
        }

        if (duration < Limits.MinGiveawayDuration) {
          return interaction.reply({
            embeds: [EmbedFactory.error(interaction.client, "Erro", "A duração mínima é de 1 minuto.")],
            ephemeral: true,
          })
        }

        if (duration > Limits.MaxGiveawayDuration) {
          return interaction.reply({
            embeds: [EmbedFactory.error(interaction.client, "Erro", "A duração máxima é de 7 dias.")],
            ephemeral: true,
          })
        }

        const endsAt = Date.now() + duration
        const giveawayId = `gw-${Date.now().toString(36)}`

        const embed = EmbedFactory.giveaway(
          interaction.client,
          prize,
          interaction.user,
          endsAt,
          winnersCount
        )

        embed.addFields({
          name: `${Emojis.User} Participantes`,
          value: "0",
          inline: true,
        })

        const joinButton = new ButtonBuilder()
          .setCustomId(`giveaway_join:${giveawayId}`)
          .setLabel("Participar")
          .setStyle(ButtonStyle.Primary)
          .setEmoji(Emojis.Party)

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(joinButton)

        const channel = interaction.channel as TextChannel
        const message = await channel.send({ embeds: [embed], components: [row] })

        db.giveaways.create({
          id: giveawayId,
          messageId: message.id,
          channelId: channel.id,
          guildId: interaction.guild!.id,
          prize,
          winners: winnersCount,
          endsAt,
          hostId: interaction.user.id,
          participants: [],
          ended: false,
        })

        logger.command("sorteio criar", interaction.user.tag, interaction.guild?.name)

        await interaction.reply({
          embeds: [EmbedFactory.success(interaction.client, "Sorteio Criado", `O sorteio de **${prize}** foi criado!\n\nID: \`${giveawayId}\``)],
          ephemeral: true,
        })

        setTimeout(async () => {
          await endGiveaway(interaction.client, giveawayId)
        }, duration)
        break
      }

      case "finalizar": {
        const giveawayId = interaction.options.getString("id", true)
        await endGiveaway(interaction.client, giveawayId)

        await interaction.reply({
          embeds: [EmbedFactory.success(interaction.client, "Sorteio Finalizado", "O sorteio foi finalizado!")],
          ephemeral: true,
        })
        break
      }

      case "reroll": {
        const giveawayId = interaction.options.getString("id", true)
        const giveaway = db.giveaways.get(giveawayId)

        if (!giveaway) {
          return interaction.reply({
            embeds: [EmbedFactory.error(interaction.client, "Erro", "Sorteio não encontrado.")],
            ephemeral: true,
          })
        }

        if (giveaway.participants.length === 0) {
          return interaction.reply({
            embeds: [EmbedFactory.error(interaction.client, "Erro", "Não há participantes neste sorteio.")],
            ephemeral: true,
          })
        }

        const winners = selectWinners(giveaway.participants, giveaway.winners)

        await interaction.reply({
          embeds: [EmbedFactory.success(
            interaction.client,
            `${Emojis.Party} Novo(s) Vencedor(es)!`,
            `Parabéns aos novos vencedores do sorteio **${giveaway.prize}**:\n\n${winners.map(w => `<@${w}>`).join(", ")}`
          )],
        })
        break
      }
    }
  },
}

function selectWinners(participants: string[], count: number): string[] {
  const shuffled = [...participants].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

async function endGiveaway(client: any, giveawayId: string) {
  const giveaway = db.giveaways.get(giveawayId)
  if (!giveaway || giveaway.ended) return

  db.giveaways.end(giveawayId)

  try {
    const guild = client.guilds.cache.get(giveaway.guildId)
    if (!guild) return

    const channel = guild.channels.cache.get(giveaway.channelId) as TextChannel
    if (!channel) return

    const message = await channel.messages.fetch(giveaway.messageId).catch(() => null)
    if (!message) return

    if (giveaway.participants.length === 0) {
      await message.reply({
        embeds: [EmbedFactory.error(client, "Sorteio Encerrado", `Não houve participantes no sorteio de **${giveaway.prize}**.`)],
      })
      return
    }

    const winners = selectWinners(giveaway.participants, giveaway.winners)

    await message.reply({
      content: winners.map(w => `<@${w}>`).join(", "),
      embeds: [EmbedFactory.success(
        client,
        `${Emojis.Party} Parabéns!`,
        `Os vencedores do sorteio **${giveaway.prize}** são:\n\n${winners.map(w => `<@${w}>`).join(", ")}`
      )],
    })
  } catch (error) {
    logger.error("Erro ao finalizar sorteio", error as Error, "Giveaway")
  }
}
