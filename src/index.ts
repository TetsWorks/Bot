import { Client, GatewayIntentBits, Collection } from "discord.js"
import dotenv from "dotenv"
import { loadCommands } from "./handlers/commandHandler"
import { loadEvents } from "./handlers/eventHandler"

dotenv.config()

// Extender o tipo Client para incluir commands
declare module "discord.js" {
  export interface Client {
    commands: Collection<string, any>
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
})

// Inicializar collection de comandos
client.commands = new Collection()

// Carregar comandos e eventos
loadCommands(client)
loadEvents(client)

// Login
client.login(process.env.DISCORD_BOT_TOKEN)
