import { Events, type Interaction } from "discord.js"
import { handleButton } from "../handlers/buttonHandler"
import { handleSelectMenu } from "../handlers/selectMenuHandler"
import { checkCooldown, formatCooldownMessage } from "../utils/cooldown"
import { logger } from "../utils/logger"
import type { Command } from "../types"

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName) as Command | undefined

      if (!command) {
        logger.warn(`Comando ${interaction.commandName} não encontrado`)
        return
      }

      const cooldownSeconds = command.cooldown ?? 3
      const { onCooldown, remaining } = checkCooldown(interaction, interaction.commandName, cooldownSeconds)

      if (onCooldown) {
        const locale = interaction.locale.startsWith("pt") ? "pt" : "en"
        await interaction.reply({
          content: formatCooldownMessage(remaining, locale),
          ephemeral: true,
        })
        return
      }

      try {
        logger.command(interaction.commandName, interaction.user.tag, interaction.guild?.name)
        await command.execute(interaction)
      } catch (error) {
        logger.error(`Erro ao executar comando ${interaction.commandName}`, error as Error, "InteractionCreate")

        const errorMessage = interaction.locale.startsWith("pt")
          ? "❌ Houve um erro ao executar este comando!"
          : "❌ There was an error executing this command!"

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: errorMessage, ephemeral: true })
        } else {
          await interaction.reply({ content: errorMessage, ephemeral: true })
        }
      }
    } else if (interaction.isButton()) {
      await handleButton(interaction)
    } else if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction)
    } else if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName) as any

      if (!command?.autocomplete) return

      try {
        await command.autocomplete(interaction)
      } catch (error) {
        logger.error(`Erro no autocomplete do comando ${interaction.commandName}`, error as Error, "Autocomplete")
      }
    }
  },
}
