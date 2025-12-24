import { ActivityType, type Client, Events } from "discord.js"
import { logger } from "../utils/logger"

const activities = [
  { name: "TetsWorks Games 🎮", type: ActivityType.Playing },
  { name: "/ajuda para comandos", type: ActivityType.Listening },
  { name: "{members} membros", type: ActivityType.Watching },
  { name: "novos projetos 🚀", type: ActivityType.Competing },
  { name: "/download para jogos", type: ActivityType.Listening },
]

let activityIndex = 0

function updateActivity(client: Client) {
  const activity = activities[activityIndex]
  let name = activity.name

  if (name.includes("{members}")) {
    const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
    name = name.replace("{members}", totalMembers.toString())
  }

  if (name.includes("{servers}")) {
    name = name.replace("{servers}", client.guilds.cache.size.toString())
  }

  client.user?.setActivity(name, { type: activity.type })
  activityIndex = (activityIndex + 1) % activities.length
}

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client: Client) {
    logger.banner()
    logger.divider()
    logger.success(`Bot online como ${client.user?.tag}`)
    logger.info(`Conectado a ${client.guilds.cache.size} servidor(es)`)

    const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
    logger.info(`Servindo ${totalMembers} membros`)
    logger.divider()

    updateActivity(client)
    setInterval(() => updateActivity(client), 30000)

    logger.event("ClientReady", "Bot inicializado com sucesso")
  },
}
