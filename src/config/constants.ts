export const Colors = {
  Primary: 0x8b00ff,
  Secondary: 0x00d9ff,
  Success: 0x2ecc71,
  Error: 0xe74c3c,
  Warning: 0xf39c12,
  Info: 0x3498db,
  Moderation: 0xff6b6b,
  Ticket: 0x9b59b6,
  Level: 0xf1c40f,
  Giveaway: 0xe91e63,
  Suggestion: 0x1abc9c,
} as const

export const Emojis = {
  Success: "✅",
  Error: "❌",
  Warning: "⚠️",
  Info: "ℹ️",
  Loading: "⏳",
  Star: "⭐",
  Crown: "👑",
  Trophy: "🏆",
  Medal: "🎖️",
  Gift: "🎁",
  Ticket: "🎫",
  Lock: "🔒",
  Unlock: "🔓",
  Hammer: "🔨",
  Mute: "🔇",
  Ban: "🚫",
  Kick: "👢",
  Warn: "⚠️",
  Level: "📊",
  XP: "✨",
  Message: "💬",
  User: "👤",
  Server: "🏠",
  Game: "🎮",
  App: "📱",
  Download: "📥",
  Link: "🔗",
  Clock: "🕐",
  Calendar: "📅",
  Pencil: "✏️",
  Trash: "🗑️",
  Settings: "⚙️",
  Question: "❓",
  ThumbsUp: "👍",
  ThumbsDown: "👎",
  Dice: "🎲",
  Coin: "🪙",
  EightBall: "🎱",
  Party: "🎉",
  Announcement: "📢",
  Rules: "📜",
  Welcome: "👋",
} as const

export const Branding = {
  Name: "TetsWorks Game Studio",
  ShortName: "TetsWorks",
  Footer: "TetsWorks Game Studio",
  Website: "https://tetsworks.com",
  SupportServer: "https://discord.gg/tetsworks",
  DefaultColor: Colors.Primary,
} as const

export const Limits = {
  MaxWarnings: 5,
  DefaultCooldown: 3,
  MaxTicketsPerUser: 3,
  MinGiveawayDuration: 60000,
  MaxGiveawayDuration: 604800000,
  XPPerMessage: { min: 15, max: 25 },
  XPCooldown: 60000,
  MaxSuggestionLength: 1000,
} as const

export const LevelThresholds = [
  0, 100, 255, 475, 770, 1150, 1625, 2205, 2900, 3720,
  4675, 5775, 7030, 8450, 10045, 11825, 13800, 15980, 18375, 21000,
]

export function getRequiredXP(level: number): number {
  if (level < LevelThresholds.length) {
    return LevelThresholds[level]
  }
  return Math.floor(LevelThresholds[LevelThresholds.length - 1] + (level - LevelThresholds.length + 1) * 3000)
}

export function getLevelFromXP(xp: number): number {
  let level = 0
  while (getRequiredXP(level + 1) <= xp) {
    level++
  }
  return level
}
