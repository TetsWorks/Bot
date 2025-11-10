import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  type TextChannel,
} from "discord.js"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("anuncio")
    .setDescription("Faz um anúncio no canal")
    .setDescriptionLocalizations({
      "en-US": "Makes an announcement in the channel",
    })
    .addStringOption((option) =>
      option
        .setName("mensagem")
        .setNameLocalizations({ "en-US": "message" })
        .setDescription("Mensagem do anúncio")
        .setDescriptionLocalizations({
          "en-US": "Announcement message",
        })
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction: ChatInputCommandInteraction) {
    const mensagem = interaction.options.getString("mensagem", true)

    const embed = new EmbedBuilder()
      .setColor(0xff1744)
      .setTitle("📢 Anúncio")
      .setDescription(mensagem)
      .setFooter({ text: `Anunciado por ${interaction.user.tag}` })
      .setTimestamp()

    // ✅ Força o tipo correto para TextChannel
    const channel = interaction.channel as TextChannel | null
    if (channel) {
      await channel.send({ embeds: [embed] })
    }

    await interaction.reply({
      content: "✅ Anúncio enviado!",
      ephemeral: true,
    })
  },
}