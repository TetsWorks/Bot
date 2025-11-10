// ================================================
// 📦 Estrutura base para listar seus jogos e apps
// ================================================

export interface GameVersion {
  id: string
  name: string
  description: string
  downloadUrl: string
  size: string
  date: string
  platform: "android" | "ios" | "windows" | "universal"
  changelog?: string[]
}

export interface Game {
  id: string
  name: string
  description: string
  thumbnail: string
  color: number
  versions: GameVersion[]
  type: "game" | "app" // 👈 novo campo
}

// ============================================================
// 🕹️ Seus jogos e aplicativos reais
// ============================================================

export const games: Record<string, Game> = {
  "meu-jogo": {
    id: "meu-jogo",
    name: "Meu Jogo de Teste",
    description: "Um jogo de exemplo para mostrar como adicionar versões.",
    thumbnail: "https://meusite.com/imagens/meu-jogo-icon.png",
    color: 0x00d9ff,
    type: "game",
    versions: [
      {
        id: "v1.0.0-android",
        name: "v1.0.0",
        description: "Lançamento inicial do jogo!",
        downloadUrl: "https://meusite.com/downloads/meu-jogo-v1.0.0.apk",
        size: "50 MB",
        date: "09/11/2025",
        platform: "android",
        changelog: [
          "Lançamento oficial do jogo",
          "Sistema de pontuação básico",
          "Interface simples e leve",
        ],
      },
    ],
  },

  "meu-app": {
    id: "meu-app",
    name: "Meu Aplicativo",
    description: "Um app de exemplo para demonstrar separação por categoria.",
    thumbnail: "https://meusite.com/imagens/meu-app-icon.png",
    color: 0x2ecc71,
    type: "app",
    versions: [
      {
        id: "v1.0.0-android",
        name: "v1.0.0",
        description: "Primeira versão do aplicativo.",
        downloadUrl: "https://meusite.com/downloads/meu-app-v1.0.0.apk",
        size: "20 MB",
        date: "09/11/2025",
        platform: "android",
      },
    ],
  },
}