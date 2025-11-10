# 🎮 TetsWorks Discord Bot

Bot oficial do TetsWorks Game Studio com comandos de barra, múltiplos idiomas e interações avançadas.

## 🚀 Funcionalidades

### 📊 Comandos de Informação
- `/ping` - Mostra a latência do bot
- `/sobre` - Informações sobre o TetsWorks
- `/server` - Informações do servidor
- `/user` - Informações de usuário
- `/ajuda` - Lista todos os comandos

### 🎮 Sistema de Downloads
- `/download` - Sistema interativo para baixar jogos
- `/setup-download` - (Admin) Cria mensagem permanente de download

### 🎲 Comandos de Diversão
- `/avatar` - Mostra avatar de usuário
- `/8ball` - Bola mágica 8
- `/dado` - Rola um dado
- `/moeda` - Joga uma moeda

### 👑 Comandos de Admin
- `/limpar` - Limpa mensagens do canal
- `/anuncio` - Faz um anúncio
- `/setup-anuncio` - Cria anúncio personalizado com botões
- `/setup-regras` - Cria mensagem de regras com aceite automático

## 📦 Instalação

### 1. Instalar dependências

\`\`\`bash
cd discord-bot
npm install
\`\`\`

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

\`\`\`bash
cp .env.example .env
\`\`\`

Edite o `.env` e adicione suas credenciais:

\`\`\`env
DISCORD_BOT_TOKEN=seu_token_aqui
DISCORD_CLIENT_ID=seu_client_id_aqui
\`\`\`

### 3. Criar o bot no Discord

1. Acesse: https://discord.com/developers/applications
2. Clique em "New Application"
3. Dê um nome (ex: TetsWorks Bot)
4. Vá em "Bot" no menu lateral
5. Clique em "Add Bot"
6. Copie o TOKEN (isso é o `DISCORD_BOT_TOKEN`)
7. Em "General Information", copie o APPLICATION ID (isso é o `DISCORD_CLIENT_ID`)

### 4. Configurar permissões e adicionar ao servidor

1. Vá em "OAuth2" → "URL Generator"
2. Marque os scopes:
   - `bot`
   - `applications.commands`
3. Marque as permissões:
   - Read Messages/View Channels
   - Send Messages
   - Manage Messages
   - Embed Links
   - Attach Files
   - Read Message History
   - Add Reactions
   - Use Slash Commands
   - Manage Roles (se for usar sistema de regras)
4. Copie a URL gerada e abra no navegador
5. Selecione seu servidor e autorize

### 5. Registrar comandos

\`\`\`bash
npm run deploy
\`\`\`

Este comando registra todos os comandos de barra no Discord.

### 6. Iniciar o bot

**Desenvolvimento (com hot reload):**
\`\`\`bash
npm run dev
\`\`\`

**Produção:**
\`\`\`bash
npm run build
npm start
\`\`\`

## 🌐 Multi-idioma

O bot detecta automaticamente o idioma do usuário:
- 🇧🇷 Português (pt-BR)
- 🇺🇸 Inglês (en-US)

## 🎮 Configurar Jogos

Edite o arquivo `src/config/games.ts` para adicionar seus jogos:

\`\`\`typescript
export const games: Record<string, Game> = {
  'seu-jogo': {
    id: 'seu-jogo',
    name: 'Seu Jogo Incrível',
    description: 'Descrição do jogo',
    thumbnail: 'https://url-da-imagem.com/icon.png',
    color: 0x00D9FF,
    versions: [
      {
        id: 'v1.0.0',
        name: 'v1.0.0',
        description: 'Lançamento oficial!',
        downloadUrl: 'https://exemplo.com/download.apk',
        size: '50 MB',
        date: '10/11/2025',
        platform: 'android',
        changelog: [
          'Lançamento inicial',
          'Sistema de gameplay completo'
        ]
      }
    ]
  }
};
\`\`\`

## 🚀 Deploy

### Opção 1: Railway (Recomendado - Grátis)

1. Crie conta em https://railway.app
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Selecione seu repositório
5. Adicione as variáveis de ambiente:
   - `DISCORD_BOT_TOKEN`
   - `DISCORD_CLIENT_ID`
6. O bot iniciará automaticamente!

### Opção 2: Render (Grátis)

1. Crie conta em https://render.com
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório
4. Configure:
   - **Build Command:** `cd discord-bot && npm install && npm run build`
   - **Start Command:** `cd discord-bot && npm start`
5. Adicione as variáveis de ambiente
6. Deploy!

### Opção 3: Fly.io (Grátis)

1. Instale o CLI: https://fly.io/docs/hands-on/install-flyctl/
2. Faça login: `flyctl auth login`
3. Na pasta do bot: `flyctl launch`
4. Configure as variáveis: `flyctl secrets set DISCORD_BOT_TOKEN=...`
5. Deploy: `flyctl deploy`

## 📁 Estrutura do Projeto

\`\`\`
discord-bot/
├── src/
│   ├── index.ts              # Ponto de entrada
│   ├── deploy-commands.ts    # Registrador de comandos
│   ├── commands/
│   │   ├── info/            # Comandos de informação
│   │   ├── games/           # Comandos de jogos
│   │   ├── fun/             # Comandos de diversão
│   │   └── admin/           # Comandos de admin
│   ├── events/              # Eventos do Discord
│   ├── handlers/            # Handlers de interações
│   ├── config/              # Configurações (jogos, etc)
│   └── utils/               # Utilitários (i18n, etc)
├── package.json
├── tsconfig.json
└── README.md
\`\`\`

## 🛠️ Desenvolvimento

### Adicionar novo comando

1. Crie um arquivo em `src/commands/[categoria]/nome.ts`
2. Use este template:

\`\`\`typescript
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('comando')
    .setDescription('Descrição'),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply('Resposta!');
  },
};
\`\`\`

3. Rode `npm run deploy` para registrar
4. Reinicie o bot

### Adicionar tradução

Edite `src/utils/i18n.ts` e adicione as chaves nos objetos `pt` e `en`.

## 📝 Licença

MIT © TetsWorks Game Studio

## 🆘 Suporte

Problemas? Abra uma issue no GitHub ou entre no Discord!

---

**Feito com ❤️ pelo TetsWorks**
