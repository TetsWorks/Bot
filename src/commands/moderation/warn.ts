import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js"
import { EmbedFactory } from "../../utils/embeds"
import { db } from "../../utils/database"
import { logger } from "../../utils/logger"
import { Colors, Emojis, Limits } from "../../config/constants"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Gerencia avisos de usuários")
    .setDescriptionLocalizations({ "en-US": "Manages user warnings" })
    .addSubcommand((sub) =>
      sub
        .setName("adicionar")
        .setNameLocalizations({ "en-US": "add" })
        .setDescription("Adiciona um aviso a um usuário")
        .setDescriptionLocalizations({ "en-US": "Adds a warning to a user" })
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setNameLocalizations({ "en-US": "user" })
            .setDescription("O usuário")
            .setDescriptionLocalizations({ "en-US": "The user" })
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("motivo")
            .setNameLocalizations({ "en-US": "reason" })
            .setDescription("Motivo do aviso")
            .setDescriptionLocalizations({ "en-US": "Reason for the warning" })
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("listar")
        .setNameLocalizations({ "en-US": "list" })
        .setDescription("Lista os avisos de um usuário")
        .setDescriptionLocalizations({ "en-US": "Lists a user's warnings" })
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setNameLocalizations({ "en-US": "user" })
            .setDescription("O usuário")
            .setDescriptionLocalizations({ "en-US": "The user" })
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("limpar")
        .setNameLocalizations({ "en-US": "clear" })
        .setDescription("Limpa todos os avisos de um usuário")
        .setDescriptionLocalizations({ "en-US": "Clears all warnings from a user" })
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setNameLocalizations({ "en-US": "user" })
            .setDescription("O usuário")
            .setDescriptionLocalizations({ "en-US": "The user" })
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand()
    const user = interaction.options.getUser("usuario", true)

    switch (subcommand) {
      case "adicionar": {
        const reason = interaction.options.getString("motivo", true)
        const warningCount = db.users.addWarning(user.id, interaction.user.id, reason)

        const embed = EmbedFactory.moderation(
          interaction.client,
          "warn",
          user,
          interaction.user,
          reason
        )

        embed.addFields({
          name: `${Emojis.Warning} Total de Avisos`,
          value: `${warningCount}/${Limits.MaxWarnings}`,
          inline: true,
        })

        if (warningCount >= Limits.MaxWarnings) {
          embed.addFields({
            name: `${Emojis.Error} Atenção`,
            value: "Este usuário atingiu o limite de avisos!",
          })
        }

        logger.command("warn add", interaction.user.tag, interaction.guild?.name)

        await interaction.reply({ embeds: [embed] })
        break
      }

      case "listar": {
        const warnings = db.users.getWarnings(user.id)

        if (warnings.length === 0) {
          return interaction.reply({
            embeds: [EmbedFactory.info(interaction.client, "Avisos", `${user.tag} não possui avisos.`)],
            ephemeral: true,
          })
        }

        const embed = new EmbedBuilder()
          .setColor(Colors.Warning)
          .setTitle(`${Emojis.Warning} Avisos de ${user.tag}`)
          .setThumbnail(user.displayAvatarURL())
          .setDescription(
            warnings
              .map((w, i) => {
                const date = new Date(w.timestamp).toLocaleDateString("pt-BR")
                return `**${i + 1}.** ${w.reason}\n   *Por <@${w.moderatorId}> em ${date}*`
              })
              .join("\n\n")
          )
          .addFields({
            name: "Total",
            value: `${warnings.length}/${Limits.MaxWarnings}`,
            inline: true,
          })
          .setFooter({ text: "TetsWorks Game Studio" })
          .setTimestamp()

        await interaction.reply({ embeds: [embed] })
        break
      }

      case "limpar": {
        db.users.clearWarnings(user.id)

        const embed = EmbedFactory.success(
          interaction.client,
          "Avisos Limpos",
          `Todos os avisos de ${user.tag} foram removidos.`
        )

        logger.command("warn clear", interaction.user.tag, interaction.guild?.name)

        await interaction.reply({ embeds: [embed] })
        break
      }
    }
  },
}
