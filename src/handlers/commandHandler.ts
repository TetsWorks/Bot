import type { Client } from "discord.js"
import fs from "fs"
import path from "path"
import { logger } from "../utils/logger"

export function loadCommands(client: Client) {
  const commandsPath = path.join(__dirname, "../commands")
  const commandCount = loadCommandsFromDir(client, commandsPath)
  logger.success(`${commandCount} comandos carregados`)
}

function loadCommandsFromDir(client: Client, dir: string): number {
  let count = 0
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      count += loadCommandsFromDir(client, filePath)
    } else if (file.endsWith(".ts") || file.endsWith(".js")) {
      try {
        const command = require(filePath)
        if (command.data && command.execute) {
          client.commands.set(command.data.name, command)
          count++
        }
      } catch (error) {
        logger.error(`Erro ao carregar comando ${file}`, error as Error, "CommandHandler")
      }
    }
  }

  return count
}
