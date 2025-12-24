import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type TextChannel,
} from "discord.js"
import { EmbedFactory } from "../../utils/embeds"
import { Colors, Emojis } from "../../config/constants"
import { logger } from "../../utils/logger"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cargo-reacao")
    .setDescription("Cria um painel de cargos por reação")
    .setDescriptionLocalizations({ "en-US": "Creates a reaction role panel" })
    .addStringOption((option) =>
      option
        .setName("titulo")
        .setNameLocalizations({ "en-US": "title" })
        .setDescription("Título do painel")
        .setDescriptionLocalizations({ "en-US": "Panel title" })
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("descricao")
        .setNameLocalizations({ "en-US": "description" })
        .setDescription("Descrição do painel")
        .setDescriptionLocalizations({ "en-US": "Panel description" })
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("cargo1")
        .setNameLocalizations({ "en-US": "role1" })
        .setDescription("Primeiro cargo")
        .setDescriptionLocalizations({ "en-US": "First role" })
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("emoji1")
        .setDescription("Emoji para o primeiro cargo")
        .setDescriptionLocalizations({ "en-US": "Emoji for the first role" })
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("cargo2")
        .setNameLocalizations({ "en-US": "role2" })
        .setDescription("Segundo cargo")
        .setDescriptionLocalizations({ "en-US": "Second role" })
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("emoji2")
        .setDescription("Emoji para o segundo cargo")
        .setDescriptionLocalizations({ "en-US": "Emoji for the second role" })
        .setRequired(false)
    )
    .addRoleOption((option) =>
      option
        .setName("cargo3")
        .setNameLocalizations({ "en-US": "role3" })
        .setDescription("Terceiro cargo")
        .setDescriptionLocalizations({ "en-US": "Third role" })
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("emoji3")
        .setDescription("Emoji para o terceiro cargo")
        .setDescriptionLocalizations({ "en-US": "Emoji for the third role" })
        .setRequired(false)
    )
    .addRoleOption((option) =>
      option
        .setName("cargo4")
        .setNameLocalizations({ "en-US": "role4" })
        .setDescription("Quarto cargo")
        .setDescriptionLocalizations({ "en-US": "Fourth role" })
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("emoji4")
        .setDescription("Emoji para o quarto cargo")
        .setDescriptionLocalizations({ "en-US": "Emoji for the fourth role" })
        .setRequired(false)
    )
    .addRoleOption((option) =>
      option
        .setName("cargo5")
        .setNameLocalizations({ "en-US": "role5" })
        .setDescription("Quinto cargo")
        .setDescriptionLocalizations({ "en-US": "Fifth role" })
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("emoji5")
        .setDescription("Emoji para o quinto cargo")
        .setDescriptionLocalizations({ "en-US": "Emoji for the fifth role" })
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction: ChatInputCommandInteraction) {
    const title = interaction.options.getString("titulo", true)
    const description = interaction.options.getString("descricao", true)

    const roles: { role: any; emoji: string }[] = []

    for (let i = 1; i <= 5; i++) {
      const role = interaction.options.getRole(`cargo${i}`)
      const emoji = interaction.options.getString(`emoji${i}`)

      if (role && emoji) {
        roles.push({ role, emoji })
      }
    }

    if (roles.length === 0) {
      return interaction.reply({
        embeds: [EmbedFactory.error(interaction.client, "Erro", "Você precisa definir pelo menos um cargo com emoji.")],
        ephemeral: true,
      })
    }

    const rolesList = roles.map((r) => `${r.emoji} - ${r.role}`).join("\n")

    const embed = new EmbedBuilder()
      .setColor(Colors.Primary)
      .setTitle(title)
      .setDescription(`${description}\n\n**Cargos disponíveis:**\n${rolesList}`)
      .setFooter({ text: "Clique no botão para pegar ou remover o cargo" })
      .setTimestamp()

    const buttons = roles.map((r) =>
      new ButtonBuilder()
        .setCustomId(`role_toggle:${r.role.id}`)
        .setLabel(r.role.name)
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(r.emoji)
    )

    const rows: ActionRowBuilder<ButtonBuilder>[] = []
    for (let i = 0; i < buttons.length; i += 5) {
      rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(buttons.slice(i, i + 5)))
    }

    const channel = interaction.channel as TextChannel
    await channel.send({ embeds: [embed], components: rows })

    logger.command("cargo-reacao", interaction.user.tag, interaction.guild?.name)

    await interaction.reply({
      embeds: [EmbedFactory.success(interaction.client, "Painel Criado", "O painel de cargos foi criado com sucesso!")],
      ephemeral: true,
    })
  },
}
