import { REST, Routes } from "discord.js"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"

dotenv.config()

const commands: any[] = []

// Função para carregar comandos recursivamente
function loadCommandsFromDir(dir: string) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      loadCommandsFromDir(filePath)
    } else if (file.endsWith(".ts") || file.endsWith(".js")) {
      const command = require(filePath)
      if (command.data && command.execute) {
        commands.push(command.data.toJSON())
        console.log(`✅ Comando carregado: ${command.data.name}`)
      }
    }
  }
}

// Carregar todos os comandos
const commandsPath = path.join(__dirname, "commands")
loadCommandsFromDir(commandsPath)

// Registrar comandos
const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN!)
;(async () => {
  try {
    console.log(`🔄 Registrando ${commands.length} comandos...`)

    await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!), { body: commands })

    console.log(`✅ ${commands.length} comandos registrados com sucesso!`)
  } catch (error) {
    console.error("❌ Erro ao registrar comandos:", error)
  }
})()
