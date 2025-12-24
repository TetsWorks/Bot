import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  type TextChannel,
} from "discord.js"
import { Colors, Emojis } from "../../config/constants"
import { logger } from "../../utils/logger"

const numberEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]

module.exports = {
  data: new SlashCommandBuilder()
    .setName("enquete")
    .setDescription("Cria uma enquete")
    .setDescriptionLocalizations({ "en-US": "Creates a poll" })
    .addStringOption((option) =>
      option
        .setName("pergunta")
        .setNameLocalizations({ "en-US": "question" })
        .setDescription("A pergunta da enquete")
        .setDescriptionLocalizations({ "en-US": "The poll question" })
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("opcoes")
        .setNameLocalizations({ "en-US": "options" })
        .setDescription("Opções separadas por | (ex: Sim | Não | Talvez)")
        .setDescriptionLocalizations({ "en-US": "Options separated by | (e.g., Yes | No | Maybe)" })
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("anonima")
        .setNameLocalizations({ "en-US": "anonymous" })
        .setDescription("Enquete anônima? (padrão: não)")
        .setDescriptionLocalizations({ "en-US": "Anonymous poll? (default: no)" })
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const question = interaction.options.getString("pergunta", true)
    const optionsStr = interaction.options.getString("opcoes", true)
    const anonymous = interaction.options.getBoolean("anonima") || false

    const options = optionsStr.split("|").map((o) => o.trim()).filter((o) => o.length > 0)

    if (options.length < 2) {
      return interaction.reply({
        content: "❌ Você precisa fornecer pelo menos 2 opções separadas por |",
        ephemeral: true,
      })
    }

    if (options.length > 10) {
      return interaction.reply({
        content: "❌ O máximo de opções é 10.",
        ephemeral: true,
      })
    }

    const optionsText = options
      .map((opt, i) => `${numberEmojis[i]} ${opt}`)
      .join("\n\n")

    const embed = new EmbedBuilder()
      .setColor(Colors.Primary)
      .setTitle(`${Emojis.Question} ${question}`)
      .setDescription(optionsText)
      .setFooter({
        text: anonymous
          ? `Enquete anônima por ${interaction.user.tag}`
          : `Enquete criada por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp()

    const channel = interaction.channel as TextChannel
    const message = await channel.send({ embeds: [embed] })

    for (let i = 0; i < options.length; i++) {
      await message.react(numberEmojis[i])
    }

    logger.command("enquete", interaction.user.tag, interaction.guild?.name)

    await interaction.reply({
      content: "✅ Enquete criada com sucesso!",
      ephemeral: true,
    })
  },
}
