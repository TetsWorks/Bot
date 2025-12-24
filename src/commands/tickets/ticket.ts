import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type TextChannel,
} from "discord.js"
import { EmbedFactory } from "../../utils/embeds"
import { db } from "../../utils/database"
import { logger } from "../../utils/logger"
import { Colors, Emojis, Limits } from "../../config/constants"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Sistema de tickets de suporte")
    .setDescriptionLocalizations({ "en-US": "Support ticket system" })
    .addSubcommand((sub) =>
      sub
        .setName("criar")
        .setNameLocalizations({ "en-US": "create" })
        .setDescription("Abre um novo ticket de suporte")
        .setDescriptionLocalizations({ "en-US": "Opens a new support ticket" })
        .addStringOption((option) =>
          option
            .setName("assunto")
            .setNameLocalizations({ "en-US": "subject" })
            .setDescription("Assunto do ticket")
            .setDescriptionLocalizations({ "en-US": "Ticket subject" })
            .setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("fechar")
        .setNameLocalizations({ "en-US": "close" })
        .setDescription("Fecha o ticket atual")
        .setDescriptionLocalizations({ "en-US": "Closes the current ticket" })
    )
    .addSubcommand((sub) =>
      sub
        .setName("setup")
        .setDescription("Configura o sistema de tickets")
        .setDescriptionLocalizations({ "en-US": "Sets up the ticket system" })
        .addChannelOption((option) =>
          option
            .setName("categoria")
            .setNameLocalizations({ "en-US": "category" })
            .setDescription("Categoria onde os tickets serão criados")
            .setDescriptionLocalizations({ "en-US": "Category where tickets will be created" })
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("log")
            .setNameLocalizations({ "en-US": "log" })
            .setDescription("Canal de logs dos tickets")
            .setDescriptionLocalizations({ "en-US": "Ticket log channel" })
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("painel")
        .setNameLocalizations({ "en-US": "panel" })
        .setDescription("Cria um painel de tickets")
        .setDescriptionLocalizations({ "en-US": "Creates a ticket panel" })
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand()

    switch (subcommand) {
      case "criar": {
        const subject = interaction.options.getString("assunto") || "Suporte Geral"
        const guildData = db.guilds.get(interaction.guild!.id)

        if (!guildData?.ticketCategory) {
          return interaction.reply({
            embeds: [EmbedFactory.error(interaction.client, "Erro", "O sistema de tickets não foi configurado. Peça a um administrador para usar `/ticket setup`.")],
            ephemeral: true,
          })
        }

        const userTickets = db.tickets.getByUser(interaction.user.id)
        if (userTickets.length >= Limits.MaxTicketsPerUser) {
          return interaction.reply({
            embeds: [EmbedFactory.error(interaction.client, "Erro", `Você já possui ${Limits.MaxTicketsPerUser} ticket(s) aberto(s). Feche um antes de abrir outro.`)],
            ephemeral: true,
          })
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
            subject,
          })

          const embed = EmbedFactory.ticket(interaction.client, "created", interaction.user, ticketId)
          embed.addFields({ name: "Assunto", value: subject })

          const closeButton = new ButtonBuilder()
            .setCustomId(`ticket_close:${ticketId}`)
            .setLabel("Fechar Ticket")
            .setStyle(ButtonStyle.Danger)
            .setEmoji(Emojis.Lock)

          const row = new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton)

          await channel.send({
            content: `${interaction.user}`,
            embeds: [embed],
            components: [row],
          })

          logger.command("ticket criar", interaction.user.tag, interaction.guild?.name)

          await interaction.reply({
            embeds: [EmbedFactory.success(interaction.client, "Ticket Criado", `Seu ticket foi criado em ${channel}!`)],
            ephemeral: true,
          })
        } catch (error) {
          logger.error("Erro ao criar ticket", error as Error, "Ticket")
          await interaction.reply({
            embeds: [EmbedFactory.error(interaction.client, "Erro", "Não foi possível criar o ticket.")],
            ephemeral: true,
          })
        }
        break
      }

      case "fechar": {
        const tickets = Object.values(db.tickets.getByUser(interaction.user.id))
        const currentTicket = Object.values(tickets).find(t => t.channelId === interaction.channel?.id)

        if (!currentTicket) {
          return interaction.reply({
            embeds: [EmbedFactory.error(interaction.client, "Erro", "Este canal não é um ticket ou você não tem permissão para fechá-lo.")],
            ephemeral: true,
          })
        }

        db.tickets.close(currentTicket.id)

        const embed = EmbedFactory.ticket(interaction.client, "closed", interaction.user, currentTicket.id)

        await interaction.reply({ embeds: [embed] })

        setTimeout(async () => {
          try {
            await interaction.channel?.delete()
          } catch (error) {
            logger.error("Erro ao deletar canal do ticket", error as Error, "Ticket")
          }
        }, 5000)
        break
      }

      case "setup": {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({
            embeds: [EmbedFactory.error(interaction.client, "Erro", "Você precisa ser administrador para configurar o sistema de tickets.")],
            ephemeral: true,
          })
        }

        const category = interaction.options.getChannel("categoria", true)
        const logChannel = interaction.options.getChannel("log")

        db.guilds.set(interaction.guild!.id, {
          ticketCategory: category.id,
          ticketLogChannel: logChannel?.id,
        })

        await interaction.reply({
          embeds: [EmbedFactory.success(interaction.client, "Configuração Salva", `Sistema de tickets configurado!\n\n**Categoria:** ${category}\n**Logs:** ${logChannel || "Não configurado"}`)],
          ephemeral: true,
        })

        logger.command("ticket setup", interaction.user.tag, interaction.guild?.name)
        break
      }

      case "painel": {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({
            embeds: [EmbedFactory.error(interaction.client, "Erro", "Você precisa ser administrador para criar um painel de tickets.")],
            ephemeral: true,
          })
        }

        const embed = new EmbedBuilder()
          .setColor(Colors.Ticket)
          .setTitle(`${Emojis.Ticket} Central de Suporte`)
          .setDescription(
            "Precisa de ajuda? Clique no botão abaixo para abrir um ticket!\n\n" +
            "**Antes de abrir um ticket:**\n" +
            "• Verifique se sua dúvida não está nas FAQs\n" +
            "• Descreva seu problema detalhadamente\n" +
            "• Seja paciente, nossa equipe responderá em breve"
          )
          .setFooter({ text: "TetsWorks Game Studio" })
          .setTimestamp()

        const button = new ButtonBuilder()
          .setCustomId("ticket_panel_open")
          .setLabel("Abrir Ticket")
          .setStyle(ButtonStyle.Primary)
          .setEmoji(Emojis.Ticket)

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button)

        const channel = interaction.channel as TextChannel
        await channel.send({ embeds: [embed], components: [row] })

        await interaction.reply({
          embeds: [EmbedFactory.success(interaction.client, "Painel Criado", "O painel de tickets foi criado com sucesso!")],
          ephemeral: true,
        })
        break
      }
    }
  },
}
