import { type Client, Events } from "discord.js"

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client: Client) {
    console.log(`✅ Bot online como ${client.user?.tag}`)
    console.log(`📊 Conectado a ${client.guilds.cache.size} servidor(es)`)

    // Atualizar status
    client.user?.setPresence({
      activities: [{ name: "TetsWorks Games 🎮" }],
      status: "online",
    })
  },
}
