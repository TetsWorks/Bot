import type { Client } from "discord.js"
import fs from "fs"
import path from "path"
import { logger } from "../utils/logger"

export function loadEvents(client: Client) {
  const eventsPath = path.join(__dirname, "../events")
  const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".ts") || file.endsWith(".js"))

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file)
    
    try {
      const event = require(filePath)

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args))
      } else {
        client.on(event.name, (...args) => event.execute(...args))
      }
    } catch (error) {
      logger.error(`Erro ao carregar evento ${file}`, error as Error, "EventHandler")
    }
  }

  logger.success(`${eventFiles.length} eventos carregados`)
}
