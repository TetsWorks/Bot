import { Events, type Interaction } from "discord.js"
import { handleButton } from "../handlers/buttonHandler"
import { handleSelectMenu } from "../handlers/selectMenuHandler"

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    // Comandos de barra
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName)

      if (!command) {
        console.error(`Comando ${interaction.commandName} não encontrado`)
        return
      }

      try {
        await command.execute(interaction)
      } catch (error) {
        console.error("Erro ao executar comando:", error)
        const errorMessage = "Houve um erro ao executar este comando!"

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: errorMessage, ephemeral: true })
        } else {
          await interaction.reply({ content: errorMessage, ephemeral: true })
        }
      }
    }
    // Botões
    else if (interaction.isButton()) {
      await handleButton(interaction)
    }
    // Select Menus
    else if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction)
    }
  },
}
