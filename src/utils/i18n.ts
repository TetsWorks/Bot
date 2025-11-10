type Locale = "pt" | "en"

const translations: Record<Locale, Record<string, string>> = {
  pt: {
    // Comandos gerais
    "ping.pong": "🏓 Pong! Latência: {latency}ms",
    "ping.description": "Mostra a latência do bot",

    // Download
    "download.description": "Baixe nossos jogos e apps",
    "download.select_version": "Selecione a versão",
    "download.choose_version": "📦 Escolha a versão que deseja baixar:",
    "download.ready": "Download pronto!",
    "download.platform": "Plataforma",
    "download.size": "Tamanho",
    "download.date": "Data",
    "download.changelog": "📝 Novidades",
    "download.footer": "TetsWorks Game Studio",

    // Setup
    "setup.download.description": "Cria mensagem de download permanente",
    "setup.download.game": "ID do jogo (tetsworks-runner, hollow-knight, silksong)",
    "setup.download.created": "✅ Mensagem de download criada!",
    "setup.announcement.description": "Cria um anúncio personalizado",
    "setup.announcement.title": "Título do anúncio",
    "setup.announcement.description_param": "Descrição do anúncio",
    "setup.announcement.color": "Cor em hexadecimal (ex: #FF0000)",
    "setup.announcement.button_text": "Texto do botão (opcional)",
    "setup.announcement.created": "✅ Anúncio criado!",
    "setup.rules.description": "Cria mensagem de regras com botão de aceite",
    "setup.rules.role": "Cargo a ser dado ao aceitar",
    "setup.rules.created": "✅ Mensagem de regras criada!",

    // Rules
    "rules.title": "📜 Regras do Servidor",
    "rules.accept_button": "Aceitar Regras",
    "rules.accepted": "✅ Você aceitou as regras!",

    // Verify
    "verify.age_verified": "✅ Idade verificada com sucesso!",

    // Errors
    "error.unknown_button": "❌ Botão desconhecido",
    "error.unknown_menu": "❌ Menu desconhecido",
    "error.generic": "❌ Ocorreu um erro. Tente novamente.",
    "error.game_not_found": "❌ Jogo não encontrado",
    "error.version_not_found": "❌ Versão não encontrada",
    "error.member_not_found": "❌ Membro não encontrado",
    "error.role_failed": "❌ Erro ao atribuir cargo",
    "error.no_permission": "❌ Você não tem permissão para usar este comando",

    // Info
    "info.description": "Informações sobre o TetsWorks",
    "server.description": "Informações sobre o servidor",
    "user.description": "Informações sobre um usuário",
    "help.description": "Lista todos os comandos disponíveis",

    // Admin
    "clear.description": "Limpa mensagens do canal",
    "clear.amount": "Quantidade de mensagens (1-100)",
    "clear.success": "🗑️ {amount} mensagens foram deletadas!",
    "announce.description": "Faz um anúncio no canal",
    "announce.message": "Mensagem do anúncio",
    "announce.sent": "📢 Anúncio enviado!",

    // Fun
    "avatar.description": "Mostra o avatar de um usuário",
    "avatar.user": "Usuário",
    "8ball.description": "Faça uma pergunta à bola mágica",
    "8ball.question": "Sua pergunta",
    "dice.description": "Rola um dado",
    "dice.sides": "Número de lados (padrão: 6)",
    "dice.result": "🎲 Você rolou um dado de {sides} lados e tirou: **{result}**!",
    "coinflip.description": "Joga uma moeda",
    "coinflip.result": "🪙 A moeda caiu em: **{result}**!",
    "coinflip.heads": "Cara",
    "coinflip.tails": "Coroa",
  },
  en: {
    // General commands
    "ping.pong": "🏓 Pong! Latency: {latency}ms",
    "ping.description": "Shows bot latency",

    // Download
    "download.description": "Download our games and apps",
    "download.select_version": "Select version",
    "download.choose_version": "📦 Choose the version you want to download:",
    "download.ready": "Download ready!",
    "download.platform": "Platform",
    "download.size": "Size",
    "download.date": "Date",
    "download.changelog": "📝 What's New",
    "download.footer": "TetsWorks Game Studio",

    // Setup
    "setup.download.description": "Creates permanent download message",
    "setup.download.game": "Game ID (tetsworks-runner, hollow-knight, silksong)",
    "setup.download.created": "✅ Download message created!",
    "setup.announcement.description": "Creates a custom announcement",
    "setup.announcement.title": "Announcement title",
    "setup.announcement.description_param": "Announcement description",
    "setup.announcement.color": "Color in hexadecimal (ex: #FF0000)",
    "setup.announcement.button_text": "Button text (optional)",
    "setup.announcement.created": "✅ Announcement created!",
    "setup.rules.description": "Creates rules message with accept button",
    "setup.rules.role": "Role to give on accept",
    "setup.rules.created": "✅ Rules message created!",

    // Rules
    "rules.title": "📜 Server Rules",
    "rules.accept_button": "Accept Rules",
    "rules.accepted": "✅ You accepted the rules!",

    // Verify
    "verify.age_verified": "✅ Age verified successfully!",

    // Errors
    "error.unknown_button": "❌ Unknown button",
    "error.unknown_menu": "❌ Unknown menu",
    "error.generic": "❌ An error occurred. Please try again.",
    "error.game_not_found": "❌ Game not found",
    "error.version_not_found": "❌ Version not found",
    "error.member_not_found": "❌ Member not found",
    "error.role_failed": "❌ Failed to assign role",
    "error.no_permission": "❌ You don't have permission to use this command",

    // Info
    "info.description": "Information about TetsWorks",
    "server.description": "Server information",
    "user.description": "User information",
    "help.description": "Lists all available commands",

    // Admin
    "clear.description": "Clears messages from the channel",
    "clear.amount": "Amount of messages (1-100)",
    "clear.success": "🗑️ {amount} messages were deleted!",
    "announce.description": "Makes an announcement in the channel",
    "announce.message": "Announcement message",
    "announce.sent": "📢 Announcement sent!",

    // Fun
    "avatar.description": "Shows a user's avatar",
    "avatar.user": "User",
    "8ball.description": "Ask the magic 8-ball a question",
    "8ball.question": "Your question",
    "dice.description": "Roll a dice",
    "dice.sides": "Number of sides (default: 6)",
    "dice.result": "🎲 You rolled a {sides}-sided die and got: **{result}**!",
    "coinflip.description": "Flip a coin",
    "coinflip.result": "🪙 The coin landed on: **{result}**!",
    "coinflip.heads": "Heads",
    "coinflip.tails": "Tails",
  },
}

export function getTranslation(locale: Locale, key: string, params?: Record<string, any>): string {
  let translation = translations[locale]?.[key] || translations["en"][key] || key

  if (params) {
    Object.keys(params).forEach((param) => {
      translation = translation.replace(`{${param}}`, params[param])
    })
  }

  return translation
}
