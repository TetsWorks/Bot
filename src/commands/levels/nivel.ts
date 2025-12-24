import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  AttachmentBuilder,
} from "discord.js"
import { db } from "../../utils/database"
import { Colors, Emojis, getRequiredXP } from "../../config/constants"
import { logger } from "../../utils/logger"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nivel")
    .setDescription("Mostra seu nível e XP")
    .setDescriptionLocalizations({ "en-US": "Shows your level and XP" })
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setNameLocalizations({ "en-US": "user" })
        .setDescription("O usuário para verificar")
        .setDescriptionLocalizations({ "en-US": "The user to check" })
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("usuario") || interaction.user
    const userData = db.users.getOrCreate(user.id)
    const rank = db.users.getRank(user.id)

    const currentLevelXP = getRequiredXP(userData.level)
    const nextLevelXP = getRequiredXP(userData.level + 1)
    const xpForNextLevel = nextLevelXP - currentLevelXP
    const currentProgress = userData.xp - currentLevelXP
    const progressPercent = Math.floor((currentProgress / xpForNextLevel) * 100)

    const progressBarLength = 20
    const filledLength = Math.floor((progressPercent / 100) * progressBarLength)
    const emptyLength = progressBarLength - filledLength
    const progressBar = "█".repeat(filledLength) + "░".repeat(emptyLength)

    const embed = new EmbedBuilder()
      .setColor(Colors.Level)
      .setTitle(`${Emojis.Level} Nível de ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        {
          name: `${Emojis.Trophy} Rank`,
          value: `#${rank}`,
          inline: true,
        },
        {
          name: `${Emojis.Star} Nível`,
          value: `${userData.level}`,
          inline: true,
        },
        {
          name: `${Emojis.XP} XP Total`,
          value: `${userData.xp.toLocaleString()}`,
          inline: true,
        },
        {
          name: `${Emojis.Message} Mensagens`,
          value: `${userData.messages.toLocaleString()}`,
          inline: true,
        },
        {
          name: "Progresso",
          value: `\`${progressBar}\` ${progressPercent}%\n${currentProgress.toLocaleString()} / ${xpForNextLevel.toLocaleString()} XP`,
        }
      )
      .setFooter({ text: "TetsWorks Game Studio" })
      .setTimestamp()

    logger.command("nivel", interaction.user.tag, interaction.guild?.name)

    await interaction.reply({ embeds: [embed] })
  },
}
