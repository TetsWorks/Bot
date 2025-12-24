import { Client, GatewayIntentBits, Collection, Partials } from "discord.js"
import dotenv from "dotenv"
import { loadCommands } from "./handlers/commandHandler"
import { loadEvents } from "./handlers/eventHandler"
import { logger } from "./utils/logger"
import type { Command } from "./types"

dotenv.config()

declare module "discord.js" {
  export interface Client {
    commands: Collection<string, Command>
    cooldowns: Collection<string, Collection<string, number>>
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
  ],
})

client.commands = new Collection()
client.cooldowns = new Collection()

loadCommands(client)
loadEvents(client)

process.on("unhandledRejection", (error: Error) => {
  logger.error("Unhandled promise rejection", error, "Process")
})

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught exception", error, "Process")
})

client.login(process.env.DISCORD_BOT_TOKEN).catch((error) => {
  logger.error("Falha ao fazer login", error, "Login")
  process.exit(1)
})
