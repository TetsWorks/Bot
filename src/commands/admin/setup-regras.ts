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
    .setName("setup-regras")
    .setDescription("Creates rules message with accept button")
    .setDescriptionLocalizations({
      "pt-BR": "Cria mensagem de regras com botão de aceite",
    })
    .addRoleOption((option) =>
      option
        .setName("cargo")
        .setNameLocalizations({ "en-US": "role" })
        .setDescription("Cargo a ser dado ao aceitar")
        .setDescriptionLocalizations({ "en-US": "Role to give on accept" })
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction: ChatInputCommandInteraction) {
    const locale = interaction.locale.startsWith("pt") ? "pt" : "en"
    const t = (key: string) => getTranslation(locale, key)
    const cargo = interaction.options.getRole("cargo", true)

    const embed = new EmbedBuilder()
      .setColor(0x00d9ff)
      .setTitle(t("rules.title"))
      .setDescription(
        "**1. Respeito em primeiro lugar:** Trate todos os membros com educação, sem discriminação, assédio ou ofensas.\n" +
        "**2. Sem spam:** Evite enviar mensagens repetitivas, flood ou propaganda não autorizada.\n" +
        "**3. Conteúdo apropriado:** É proibido compartilhar conteúdo NSFW, ofensivo, ilegal ou pirata.\n" +
        "**4. Foco nos projetos:** Utilize os canais corretos para cada assunto (dev, arte, ideias, bugs, etc.).\n" +
        "**5. Colaboração e comunicação:** Trabalhe em equipe, mantenha um ambiente positivo e ajude os outros quando possível.\n" +
        "**6. Sigilo de projetos:** Não compartilhe informações internas, arquivos, códigos ou ideias fora do estúdio sem permissão.\n" +
        "**7. Feedback construtivo:** Toda crítica deve ser feita de forma respeitosa e objetiva.\n" +
        "**8. Segurança:** Não envie links suspeitos ou arquivos sem autorização.\n" +
        "**9. Uso de IA e ferramentas:** Utilize ferramentas de IA apenas quando permitido pelos líderes do projeto.\n" +
        "**10. Seja parte da TetsWorks:** Colabore, divirta-se e ajude a construir nossos jogos e aplicativos!\n\n" +
        `Ao aceitar, você receberá o cargo ${cargo} e concorda com todas as regras acima.`,
      )
      .setFooter({ text: "TetsWorks Game Studio" })
      .setTimestamp()

    const button = new ButtonBuilder()
      .setCustomId(`accept_rules:${cargo.id}`)
      .setLabel(t("rules.accept_button"))
      .setStyle(ButtonStyle.Success)
      .setEmoji("✅")

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button)

    const canal = interaction.channel

    if (canal && canal.isTextBased() && "send" in canal) {
      await (canal as TextChannel).send({
        embeds: [embed],
        components: [row],
      })
    } else {
      await interaction.reply({
        content: "❌ Não foi possível enviar a mensagem de regras neste canal.",
        ephemeral: true,
      })
      return
    }

    await interaction.reply({
      content: t("setup.rules.created"),
      ephemeral: true,
    })
  },
}
