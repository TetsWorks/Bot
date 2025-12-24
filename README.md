# 🎮 TetsWorks Discord Bot

<div align="center">

![TetsWorks](https://img.shields.io/badge/TetsWorks-Game%20Studio-8B00FF?style=for-the-badge)
![Discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Bot oficial do TetsWorks Game Studio**

Um bot Discord completo e profissional com moderação, níveis, tickets, sorteios e muito mais!

</div>

---

## ✨ Funcionalidades

### 📊 Informações
- `/ping` - Verificar latência do bot
- `/sobre` - Informações sobre o bot
- `/server` - Estatísticas do servidor
- `/user` - Informações de um usuário
- `/ajuda` - Lista de comandos interativa

### 🎮 Jogos & Downloads
- `/download` - Baixar jogos e aplicativos do TetsWorks
- `/setup-download` - Criar painéis de download permanentes

### 🎲 Diversão
- `/8ball` - Pergunte à bola mágica
- `/dado` - Rolar dados
- `/moeda` - Jogar moeda
- `/avatar` - Ver avatar de um usuário

### 📈 Sistema de Níveis
- `/nivel` - Ver seu nível e XP
- `/rank` - Ranking do servidor
- `/config-niveis` - Configurar o sistema de níveis
- Ganhe XP por mensagens enviadas
- Anúncios de level up personalizáveis

### 🛡️ Moderação
- `/ban` - Banir usuários
- `/unban` - Desbanir usuários
- `/kick` - Expulsar usuários
- `/mute` - Silenciar usuários (timeout)
- `/unmute` - Remover silenciamento
- `/warn` - Sistema de avisos (adicionar/listar/limpar)
- `/limpar` - Limpar mensagens do canal

### 🎫 Sistema de Tickets
- `/ticket criar` - Abrir um novo ticket
- `/ticket fechar` - Fechar ticket atual
- `/ticket setup` - Configurar sistema de tickets
- `/ticket painel` - Criar painel de tickets

### 💡 Sugestões
- `/sugestao enviar` - Enviar uma sugestão
- `/sugestao setup` - Configurar canal de sugestões
- `/sugestao aprovar` - Aprovar uma sugestão
- `/sugestao negar` - Negar uma sugestão
- Sistema de votação com botões

### 🎉 Sorteios
- `/sorteio criar` - Criar um novo sorteio
- `/sorteio finalizar` - Finalizar sorteio antecipadamente
- `/sorteio reroll` - Sortear novos vencedores

### 📊 Enquetes
- `/enquete` - Criar enquetes com múltiplas opções

### 🎭 Cargos por Reação
- `/cargo-reacao` - Criar painéis de auto-roles

### 👋 Boas-vindas
- `/config-bemvindo canal` - Definir canal de boas-vindas
- `/config-bemvindo mensagem` - Personalizar mensagem
- `/config-bemvindo testar` - Testar a mensagem

### 📢 Anúncios
- `/anuncio` - Fazer anúncio rápido
- `/setup-anuncio` - Criar anúncio personalizado
- `/setup-regras` - Criar painel de regras

---

## 🚀 Instalação

### Pré-requisitos
- [Node.js](https://nodejs.org/) v18 ou superior
- [pnpm](https://pnpm.io/) (recomendado) ou npm/yarn

### Configuração

1. **Clone o repositório**
```bash
git clone https://github.com/TetsWorks/Bot.git
cd Bot
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
DISCORD_BOT_TOKEN=seu_token_aqui
DISCORD_CLIENT_ID=seu_client_id_aqui
```

4. **Registre os comandos slash**
```bash
pnpm run deploy
```

5. **Inicie o bot**
```bash
# Desenvolvimento (com hot-reload)
pnpm run dev

# Produção
pnpm run build
pnpm start
```

---

## 📁 Estrutura do Projeto

```
src/
├── commands/           # Comandos slash organizados por categoria
│   ├── admin/         # Comandos de administração
│   ├── fun/           # Comandos de diversão
│   ├── games/         # Comandos de jogos
│   ├── info/          # Comandos informativos
│   ├── levels/        # Sistema de níveis
│   ├── moderation/    # Comandos de moderação
│   ├── tickets/       # Sistema de tickets
│   └── utility/       # Utilidades gerais
├── config/            # Configurações
│   ├── constants.ts   # Cores, emojis, limites
│   └── games.ts       # Dados dos jogos/apps
├── events/            # Eventos do Discord
├── handlers/          # Handlers de interações
├── types/             # Tipos TypeScript
├── utils/             # Utilitários
│   ├── cooldown.ts    # Sistema de cooldown
│   ├── database.ts    # Armazenamento de dados
│   ├── embeds.ts      # Factory de embeds
│   ├── i18n.ts        # Internacionalização
│   └── logger.ts      # Sistema de logs
├── deploy-commands.ts # Script de deploy de comandos
└── index.ts           # Ponto de entrada
```

---

## 🎨 Personalização

### Adicionando Jogos/Apps

Edite `src/config/games.ts`:

```typescript
export const games: Record<string, Game> = {
  "meu-jogo": {
    id: "meu-jogo",
    name: "Meu Jogo Incrível",
    description: "Um jogo muito legal!",
    thumbnail: "https://...",
    color: 0x00D9FF,
    type: "game",
    versions: [
      {
        id: "v1.0.0-android",
        name: "v1.0.0",
        description: "Primeira versão!",
        downloadUrl: "https://...",
        size: "50 MB",
        date: "01/01/2025",
        platform: "android",
        changelog: ["Lançamento inicial"],
      },
    ],
  },
}
```

### Cores e Branding

Edite `src/config/constants.ts` para personalizar:
- Cores do bot
- Emojis padrão
- Nome e informações do studio
- Limites do sistema

---

## 🌐 Suporte a Idiomas

O bot suporta:
- 🇧🇷 Português (padrão)
- 🇺🇸 Inglês

O idioma é detectado automaticamente baseado nas configurações do Discord do usuário.

---

## 📊 Armazenamento de Dados

Os dados são salvos em arquivos JSON na pasta `data/`:
- `users.json` - XP, níveis, avisos
- `guilds.json` - Configurações do servidor
- `tickets.json` - Tickets de suporte
- `giveaways.json` - Sorteios
- `suggestions.json` - Sugestões

---

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `pnpm run dev` | Inicia em modo desenvolvimento com hot-reload |
| `pnpm run build` | Compila o TypeScript para JavaScript |
| `pnpm start` | Inicia o bot em produção |
| `pnpm run deploy` | Registra os comandos slash no Discord |

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

Feito com 💜 por **TetsWorks Game Studio**

[Website](https://tetsworks.com) • [Discord](https://discord.gg/tetsworks) • [GitHub](https://github.com/TetsWorks)

</div>
