import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  PermissionResolvable,
  Collection,
} from "discord.js"

export interface Command {
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>
  cooldown?: number
  permissions?: PermissionResolvable[]
  category?: CommandCategory
}

export type CommandCategory = "info" | "fun" | "admin" | "moderation" | "games" | "utility" | "tickets" | "levels"

export interface CooldownData {
  commands: Collection<string, Collection<string, number>>
}

export interface UserData {
  id: string
  xp: number
  level: number
  messages: number
  lastDaily?: number
  warnings: Warning[]
}

export interface Warning {
  id: string
  moderatorId: string
  reason: string
  timestamp: number
}

export interface GuildData {
  id: string
  welcomeChannel?: string
  welcomeMessage?: string
  logChannel?: string
  suggestionsChannel?: string
  ticketCategory?: string
  ticketLogChannel?: string
  autoRoles: AutoRole[]
  levelsEnabled: boolean
  levelUpChannel?: string
}

export interface AutoRole {
  messageId: string
  channelId: string
  roles: { emoji: string; roleId: string; label: string }[]
}

export interface Ticket {
  id: string
  channelId: string
  userId: string
  createdAt: number
  status: "open" | "closed"
  subject?: string
}

export interface Giveaway {
  id: string
  messageId: string
  channelId: string
  guildId: string
  prize: string
  winners: number
  endsAt: number
  hostId: string
  participants: string[]
  ended: boolean
}

export interface Suggestion {
  id: string
  messageId: string
  userId: string
  content: string
  status: "pending" | "approved" | "denied"
  votes: { up: string[]; down: string[] }
}

export type Locale = "pt" | "en"

declare module "discord.js" {
  export interface Client {
    commands: Collection<string, Command>
    cooldowns: Collection<string, Collection<string, number>>
  }
}
