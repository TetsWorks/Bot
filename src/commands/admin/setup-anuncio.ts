import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
} from "discord.js"
import { getTranslation } from "../../utils/i18n"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-anuncio")
    .setDescription("Creates a custom announcement")
    .setDescriptionLocalizations({
      "pt-BR": "Cria um anúncio personalizado",
    })
    .addStringOption((option) =>
      option
        .setName("titulo")
        .setNameLocalizations({ "en-US": "title" })
        .setDescription("Título do anúncio")
        .setDescriptionLocalizations({ "en-US": "Announcement title" })
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("descricao")
        .setNameLocalizations({ "en-US": "description" })
        .setDescription("Descrição do anúncio")
        .setDescriptionLocalizations({ "en-US": "Announcement description" })
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("cor")
        .setNameLocalizations({ "en-US": "color" })
        .setDescription("Cor em hexadecimal (ex: #FF0000)")
        .setDescriptionLocalizations({ "en-US": "Color in hexadecimal (ex: #FF0000)" })
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("botao")
        .setNameLocalizations({ "en-US": "button" })
        .setDescription("Texto do botão (opcional)")
        .setDescriptionLocalizations({ "en-US": "Button text (optional)" })
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction: ChatInputCommandInteraction) {
    const locale = interaction.locale.startsWith("pt") ? "pt" : "en"
    const t = (key: string) => getTranslation(locale, key)

    const titulo = interaction.options.getString("titulo", true)
    const descricao = interaction.options.getString("descricao", true)
    const corHex = interaction.options.getString("cor") || "#8B00FF"
    const botaoTexto = interaction.options.getString("botao")

    const cor = Number.parseInt(corHex.replace("#", ""), 16)

    const embed = new EmbedBuilder()
      .setColor(cor)
      .setTitle(titulo)
      .setDescription(descricao)
      .setFooter({ text: "TetsWorks Game Studio" })
      .setTimestamp()

    const components = []
    if (botaoTexto) {
      const button = new ButtonBuilder()
        .setCustomId(`announcement_${Date.now()}`)
        .setLabel(botaoTexto)
        .setStyle(ButtonStyle.Primary)

      components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(button))
    }

    const canal = interaction.channel
    if (canal && canal.isTextBased() && "send" in canal) {
      await (canal as TextChannel).send({
        embeds: [embed],
        components,
      })

      await interaction.reply({
        content: t("setup.announcement.created") || "✅ Anúncio criado com sucesso!",
        ephemeral: true,
      })
    } else {
      await interaction.reply({
        content: "❌ Não foi possível enviar o anúncio neste canal.",
        ephemeral: true,
      })
    }
  },
}