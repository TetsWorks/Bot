import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  version as djsVersion,
} from "discord.js"
import { Colors, Emojis, Branding } from "../../config/constants"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sobre")
    .setDescription("Informações sobre o TetsWorks Bot")
    .setDescriptionLocalizations({
      "en-US": "Information about TetsWorks Bot",
    }),

  async execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client

    const uptime = process.uptime()
    const days = Math.floor(uptime / 86400)
    const hours = Math.floor((uptime % 86400) / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    const seconds = Math.floor(uptime % 60)

    const uptimeString = days > 0
      ? `${days}d ${hours}h ${minutes}m ${seconds}s`
      : hours > 0
        ? `${hours}h ${minutes}m ${seconds}s`
        : `${minutes}m ${seconds}s`

    const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)

    const embed = new EmbedBuilder()
      .setColor(Colors.Primary)
      .setTitle(`${Emojis.Info} Sobre o TetsWorks Bot`)
      .setThumbnail(client.user?.displayAvatarURL({ size: 256 }) || "")
      .setDescription(
        `O bot oficial do **${Branding.Name}**!\n\n` +
        "Desenvolvido para gerenciar nossa comunidade, distribuir nossos jogos e apps, " +
        "e proporcionar a melhor experiência para nossos membros."
      )
      .addFields(
        {
          name: `${Emojis.Server} Estatísticas`,
          value: [
            `**Servidores:** ${client.guilds.cache.size}`,
            `**Usuários:** ${totalMembers.toLocaleString()}`,
            `**Comandos:** ${client.commands.size}`,
          ].join("\n"),
          inline: true,
        },
        {
          name: `${Emojis.Settings} Sistema`,
          value: [
            `**Node.js:** ${process.version}`,
            `**Discord.js:** v${djsVersion}`,
            `**Memória:** ${memoryUsage} MB`,
          ].join("\n"),
          inline: true,
        },
        {
          name: `${Emojis.Clock} Uptime`,
          value: uptimeString,
          inline: true,
        },
        {
          name: `${Emojis.Star} Recursos`,
          value: [
            "• Sistema de Níveis e XP",
            "• Moderação Completa",
            "• Sistema de Tickets",
            "• Sorteios e Enquetes",
            "• Download de Jogos/Apps",
            "• Boas-vindas Personalizadas",
            "• Cargos por Reação",
            "• Suporte Multilíngue",
          ].join("\n"),
        }
      )
      .setFooter({ text: Branding.Footer, iconURL: client.user?.displayAvatarURL() })
      .setTimestamp()

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Site Oficial")
        .setStyle(ButtonStyle.Link)
        .setURL(Branding.Website)
        .setEmoji(Emojis.Link),
      new ButtonBuilder()
        .setLabel("Servidor de Suporte")
        .setStyle(ButtonStyle.Link)
        .setURL(Branding.SupportServer)
        .setEmoji(Emojis.Server)
    )

    await interaction.reply({ embeds: [embed], components: [row] })
  },
}
