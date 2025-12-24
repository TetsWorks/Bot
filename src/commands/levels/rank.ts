import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js"
import { db } from "../../utils/database"
import { Colors, Emojis } from "../../config/constants"
import { logger } from "../../utils/logger"

const medals = ["🥇", "🥈", "🥉"]

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Mostra o ranking de níveis do servidor")
    .setDescriptionLocalizations({ "en-US": "Shows the server level ranking" })
    .addIntegerOption((option) =>
      option
        .setName("pagina")
        .setNameLocalizations({ "en-US": "page" })
        .setDescription("Página do ranking (padrão: 1)")
        .setDescriptionLocalizations({ "en-US": "Ranking page (default: 1)" })
        .setMinValue(1)
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const page = interaction.options.getInteger("pagina") || 1
    const perPage = 10
    const offset = (page - 1) * perPage

    const allUsers = db.users.getLeaderboard(100)
    
    const guildMembers = interaction.guild?.members.cache
    const filteredUsers = allUsers.filter(u => guildMembers?.has(u.id))

    const totalPages = Math.ceil(filteredUsers.length / perPage)
    const pageUsers = filteredUsers.slice(offset, offset + perPage)

    if (pageUsers.length === 0) {
      return interaction.reply({
        content: "❌ Nenhum usuário encontrado nesta página.",
        ephemeral: true,
      })
    }

    const description = await Promise.all(
      pageUsers.map(async (user, index) => {
        const position = offset + index + 1
        const medal = position <= 3 ? medals[position - 1] : `**${position}.**`
        const member = interaction.guild?.members.cache.get(user.id)
        const username = member?.user.tag || "Usuário desconhecido"

        return `${medal} **${username}**\n   Nível ${user.level} • ${user.xp.toLocaleString()} XP`
      })
    )

    const embed = new EmbedBuilder()
      .setColor(Colors.Level)
      .setTitle(`${Emojis.Trophy} Ranking do Servidor`)
      .setDescription(description.join("\n\n"))
      .setFooter({
        text: `Página ${page}/${totalPages} • ${filteredUsers.length} usuários no ranking`,
      })
      .setTimestamp()

    if (interaction.guild?.iconURL()) {
      embed.setThumbnail(interaction.guild.iconURL({ size: 256 })!)
    }

    logger.command("rank", interaction.user.tag, interaction.guild?.name)

    await interaction.reply({ embeds: [embed] })
  },
}
