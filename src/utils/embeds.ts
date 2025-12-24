import { EmbedBuilder, type User, type Client, type ColorResolvable } from "discord.js"
import { Colors, Emojis, Branding } from "../config/constants"

export class EmbedFactory {
  private static getFooter(client: Client) {
    return {
      text: Branding.Footer,
      iconURL: client.user?.displayAvatarURL(),
    }
  }

  static success(client: Client, title: string, description: string): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(Colors.Success)
      .setTitle(`${Emojis.Success} ${title}`)
      .setDescription(description)
      .setFooter(this.getFooter(client))
      .setTimestamp()
  }

  static error(client: Client, title: string, description: string): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(Colors.Error)
      .setTitle(`${Emojis.Error} ${title}`)
      .setDescription(description)
      .setFooter(this.getFooter(client))
      .setTimestamp()
  }

  static warning(client: Client, title: string, description: string): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(Colors.Warning)
      .setTitle(`${Emojis.Warning} ${title}`)
      .setDescription(description)
      .setFooter(this.getFooter(client))
      .setTimestamp()
  }

  static info(client: Client, title: string, description: string): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(Colors.Info)
      .setTitle(`${Emojis.Info} ${title}`)
      .setDescription(description)
      .setFooter(this.getFooter(client))
      .setTimestamp()
  }

  static moderation(
    client: Client,
    action: "ban" | "kick" | "mute" | "warn" | "unban" | "unmute",
    user: User,
    moderator: User,
    reason: string,
    duration?: string
  ): EmbedBuilder {
    const actionConfig = {
      ban: { title: "Usuário Banido", emoji: Emojis.Ban, color: Colors.Error },
      kick: { title: "Usuário Expulso", emoji: Emojis.Kick, color: Colors.Warning },
      mute: { title: "Usuário Silenciado", emoji: Emojis.Mute, color: Colors.Warning },
      warn: { title: "Aviso Aplicado", emoji: Emojis.Warn, color: Colors.Warning },
      unban: { title: "Usuário Desbanido", emoji: Emojis.Unlock, color: Colors.Success },
      unmute: { title: "Silenciamento Removido", emoji: Emojis.Unlock, color: Colors.Success },
    }

    const config = actionConfig[action]
    const embed = new EmbedBuilder()
      .setColor(config.color)
      .setTitle(`${config.emoji} ${config.title}`)
      .setThumbnail(user.displayAvatarURL({ size: 128 }))
      .addFields(
        { name: `${Emojis.User} Usuário`, value: `${user.tag} (${user.id})`, inline: true },
        { name: `${Emojis.Crown} Moderador`, value: `${moderator.tag}`, inline: true },
        { name: `${Emojis.Pencil} Motivo`, value: reason || "Não especificado" }
      )
      .setFooter(this.getFooter(client))
      .setTimestamp()

    if (duration) {
      embed.addFields({ name: `${Emojis.Clock} Duração`, value: duration, inline: true })
    }

    return embed
  }

  static ticket(
    client: Client,
    type: "created" | "closed",
    user: User,
    ticketId: string
  ): EmbedBuilder {
    const isCreated = type === "created"
    return new EmbedBuilder()
      .setColor(isCreated ? Colors.Ticket : Colors.Error)
      .setTitle(`${Emojis.Ticket} Ticket ${isCreated ? "Aberto" : "Fechado"}`)
      .setDescription(
        isCreated
          ? `Olá ${user}! Um membro da equipe irá atendê-lo em breve.\n\nDescreva seu problema ou dúvida detalhadamente.`
          : `Este ticket foi fechado. Obrigado por entrar em contato!`
      )
      .addFields({ name: "ID do Ticket", value: `\`${ticketId}\``, inline: true })
      .setFooter(this.getFooter(client))
      .setTimestamp()
  }

  static levelUp(client: Client, user: User, newLevel: number): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(Colors.Level)
      .setTitle(`${Emojis.Party} Level Up!`)
      .setDescription(`Parabéns ${user}! Você alcançou o **nível ${newLevel}**!`)
      .setThumbnail(user.displayAvatarURL({ size: 128 }))
      .setFooter(this.getFooter(client))
      .setTimestamp()
  }

  static giveaway(
    client: Client,
    prize: string,
    host: User,
    endTime: number,
    winners: number
  ): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(Colors.Giveaway)
      .setTitle(`${Emojis.Gift} Sorteio!`)
      .setDescription(`**${prize}**\n\nReaja com ${Emojis.Party} para participar!`)
      .addFields(
        { name: `${Emojis.Crown} Organizador`, value: `${host}`, inline: true },
        { name: `${Emojis.Trophy} Vencedores`, value: `${winners}`, inline: true },
        { name: `${Emojis.Clock} Termina em`, value: `<t:${Math.floor(endTime / 1000)}:R>`, inline: true }
      )
      .setFooter(this.getFooter(client))
      .setTimestamp(endTime)
  }

  static suggestion(client: Client, user: User, content: string, id: string): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(Colors.Suggestion)
      .setTitle(`${Emojis.Message} Nova Sugestão`)
      .setDescription(content)
      .addFields(
        { name: "Status", value: "⏳ Pendente", inline: true },
        { name: "ID", value: `\`${id}\``, inline: true }
      )
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
      .setFooter(this.getFooter(client))
      .setTimestamp()
  }

  static welcome(client: Client, user: User, guildName: string, memberCount: number): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(Colors.Primary)
      .setTitle(`${Emojis.Welcome} Bem-vindo(a)!`)
      .setDescription(
        `Olá ${user}! Seja bem-vindo(a) ao **${guildName}**!\n\n` +
        `Você é nosso **${memberCount}º** membro!\n\n` +
        `Não esqueça de ler as regras e se divertir!`
      )
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .setFooter(this.getFooter(client))
      .setTimestamp()
  }

  static custom(
    client: Client,
    options: {
      title?: string
      description?: string
      color?: ColorResolvable
      thumbnail?: string
      image?: string
      fields?: { name: string; value: string; inline?: boolean }[]
      author?: { name: string; iconURL?: string }
    }
  ): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(options.color || Colors.Primary)
      .setFooter(this.getFooter(client))
      .setTimestamp()

    if (options.title) embed.setTitle(options.title)
    if (options.description) embed.setDescription(options.description)
    if (options.thumbnail) embed.setThumbnail(options.thumbnail)
    if (options.image) embed.setImage(options.image)
    if (options.fields) embed.addFields(options.fields)
    if (options.author) embed.setAuthor(options.author)

    return embed
  }
}
