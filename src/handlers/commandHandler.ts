import type { Client } from "discord.js"
import fs from "fs"
import path from "path"

export function loadCommands(client: Client) {
  const commandsPath = path.join(__dirname, "../commands")
  loadCommandsFromDir(client, commandsPath)
  console.log(`✅ ${client.commands.size} comandos carregados`)
}

function loadCommandsFromDir(client: Client, dir: string) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      loadCommandsFromDir(client, filePath)
    } else if (file.endsWith(".ts") || file.endsWith(".js")) {
      const command = require(filePath)
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command)
      }
    }
  }
}
