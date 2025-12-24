import fs from "fs"
import path from "path"
import type { UserData, GuildData, Ticket, Giveaway, Suggestion } from "../types"
import { logger } from "./logger"

const DATA_DIR = path.join(__dirname, "../../data")

interface Database {
  users: Record<string, UserData>
  guilds: Record<string, GuildData>
  tickets: Record<string, Ticket>
  giveaways: Record<string, Giveaway>
  suggestions: Record<string, Suggestion>
}

const defaultDatabase: Database = {
  users: {},
  guilds: {},
  tickets: {},
  giveaways: {},
  suggestions: {},
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    logger.info("Diretório de dados criado", "Database")
  }
}

function getFilePath(collection: keyof Database): string {
  return path.join(DATA_DIR, `${collection}.json`)
}

function loadCollection<T>(collection: keyof Database): Record<string, T> {
  ensureDataDir()
  const filePath = getFilePath(collection)
  
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8")
      return JSON.parse(data)
    }
  } catch (error) {
    logger.error(`Erro ao carregar ${collection}`, error as Error, "Database")
  }
  
  return {} as Record<string, T>
}

function saveCollection<T>(collection: keyof Database, data: Record<string, T>): void {
  ensureDataDir()
  const filePath = getFilePath(collection)
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    logger.error(`Erro ao salvar ${collection}`, error as Error, "Database")
  }
}

export const db = {
  users: {
    get(userId: string): UserData | null {
      const users = loadCollection<UserData>("users")
      return users[userId] || null
    },

    getOrCreate(userId: string): UserData {
      const users = loadCollection<UserData>("users")
      if (!users[userId]) {
        users[userId] = {
          id: userId,
          xp: 0,
          level: 0,
          messages: 0,
          warnings: [],
        }
        saveCollection("users", users)
      }
      return users[userId]
    },

    set(userId: string, data: Partial<UserData>): void {
      const users = loadCollection<UserData>("users")
      users[userId] = { ...users[userId], ...data, id: userId }
      saveCollection("users", users)
    },

    addXP(userId: string, amount: number): { leveledUp: boolean; newLevel: number } {
      const user = this.getOrCreate(userId)
      const oldLevel = user.level
      user.xp += amount
      
      const { getLevelFromXP } = require("../config/constants")
      const newLevel = getLevelFromXP(user.xp)
      user.level = newLevel
      
      this.set(userId, user)
      
      return { leveledUp: newLevel > oldLevel, newLevel }
    },

    addWarning(userId: string, moderatorId: string, reason: string): number {
      const user = this.getOrCreate(userId)
      const warning = {
        id: `warn-${Date.now()}`,
        moderatorId,
        reason,
        timestamp: Date.now(),
      }
      user.warnings.push(warning)
      this.set(userId, user)
      return user.warnings.length
    },

    getWarnings(userId: string) {
      const user = this.get(userId)
      return user?.warnings || []
    },

    clearWarnings(userId: string): void {
      const user = this.get(userId)
      if (user) {
        user.warnings = []
        this.set(userId, user)
      }
    },

    getLeaderboard(limit: number = 10): UserData[] {
      const users = loadCollection<UserData>("users")
      return Object.values(users)
        .sort((a, b) => b.xp - a.xp)
        .slice(0, limit)
    },

    getRank(userId: string): number {
      const users = loadCollection<UserData>("users")
      const sorted = Object.values(users).sort((a, b) => b.xp - a.xp)
      return sorted.findIndex(u => u.id === userId) + 1
    },
  },

  guilds: {
    get(guildId: string): GuildData | null {
      const guilds = loadCollection<GuildData>("guilds")
      return guilds[guildId] || null
    },

    getOrCreate(guildId: string): GuildData {
      const guilds = loadCollection<GuildData>("guilds")
      if (!guilds[guildId]) {
        guilds[guildId] = {
          id: guildId,
          autoRoles: [],
          levelsEnabled: true,
        }
        saveCollection("guilds", guilds)
      }
      return guilds[guildId]
    },

    set(guildId: string, data: Partial<GuildData>): void {
      const guilds = loadCollection<GuildData>("guilds")
      guilds[guildId] = { ...guilds[guildId], ...data, id: guildId }
      saveCollection("guilds", guilds)
    },
  },

  tickets: {
    get(ticketId: string): Ticket | null {
      const tickets = loadCollection<Ticket>("tickets")
      return tickets[ticketId] || null
    },

    getByUser(userId: string): Ticket[] {
      const tickets = loadCollection<Ticket>("tickets")
      return Object.values(tickets).filter(t => t.userId === userId && t.status === "open")
    },

    create(ticket: Ticket): void {
      const tickets = loadCollection<Ticket>("tickets")
      tickets[ticket.id] = ticket
      saveCollection("tickets", tickets)
    },

    close(ticketId: string): void {
      const tickets = loadCollection<Ticket>("tickets")
      if (tickets[ticketId]) {
        tickets[ticketId].status = "closed"
        saveCollection("tickets", tickets)
      }
    },

    delete(ticketId: string): void {
      const tickets = loadCollection<Ticket>("tickets")
      delete tickets[ticketId]
      saveCollection("tickets", tickets)
    },
  },

  giveaways: {
    get(giveawayId: string): Giveaway | null {
      const giveaways = loadCollection<Giveaway>("giveaways")
      return giveaways[giveawayId] || null
    },

    getActive(): Giveaway[] {
      const giveaways = loadCollection<Giveaway>("giveaways")
      return Object.values(giveaways).filter(g => !g.ended && g.endsAt > Date.now())
    },

    create(giveaway: Giveaway): void {
      const giveaways = loadCollection<Giveaway>("giveaways")
      giveaways[giveaway.id] = giveaway
      saveCollection("giveaways", giveaways)
    },

    addParticipant(giveawayId: string, userId: string): boolean {
      const giveaways = loadCollection<Giveaway>("giveaways")
      const giveaway = giveaways[giveawayId]
      if (giveaway && !giveaway.participants.includes(userId)) {
        giveaway.participants.push(userId)
        saveCollection("giveaways", giveaways)
        return true
      }
      return false
    },

    end(giveawayId: string): void {
      const giveaways = loadCollection<Giveaway>("giveaways")
      if (giveaways[giveawayId]) {
        giveaways[giveawayId].ended = true
        saveCollection("giveaways", giveaways)
      }
    },
  },

  suggestions: {
    get(suggestionId: string): Suggestion | null {
      const suggestions = loadCollection<Suggestion>("suggestions")
      return suggestions[suggestionId] || null
    },

    create(suggestion: Suggestion): void {
      const suggestions = loadCollection<Suggestion>("suggestions")
      suggestions[suggestion.id] = suggestion
      saveCollection("suggestions", suggestions)
    },

    vote(suggestionId: string, oderId: string, type: "up" | "down"): void {
      const suggestions = loadCollection<Suggestion>("suggestions")
      const suggestion = suggestions[suggestionId]
      if (suggestion) {
        suggestion.votes.up = suggestion.votes.up.filter(id => id !== oderId)
        suggestion.votes.down = suggestion.votes.down.filter(id => id !== oderId)
        suggestion.votes[type].push(oderId)
        saveCollection("suggestions", suggestions)
      }
    },

    updateStatus(suggestionId: string, status: "approved" | "denied"): void {
      const suggestions = loadCollection<Suggestion>("suggestions")
      if (suggestions[suggestionId]) {
        suggestions[suggestionId].status = status
        saveCollection("suggestions", suggestions)
      }
    },
  },
}
