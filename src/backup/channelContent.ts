import type {
  Guild,
  Message,
  MessageFlagsString,
  TextChannel,
} from 'discord.js'

export const channelContent: (guild: Guild) => Promise<ContentBackup> =
  async guild => {
    const map: ContentBackup = new Map()

    /* eslint-disable no-await-in-loop */
    for (const channel of guild.channels.cache.values()) {
      if (!channel.isText()) continue
      if (!channel.viewable) continue

      const messages = await channel.messages.fetch({ limit: 100 })
      if (messages.size === 0) continue
      if (messages.size > 95) continue

      const mapped = messages
        .map(m => mapMessage(m))
        .sort((a, b) => a.createdAt - b.createdAt)

      const backup: ChannelBackup = {
        id: channel.id,
        name: channel.name,
        messages: mapped,
      }

      map.set(`#${channel.id}@${channel.name}`, backup)
    }
    /* eslint-enable no-await-in-loop */

    return map
  }

const mapMessage: (message: Message) => MessageBackup = message => ({
  id: message.id,
  authorID: message.author.id,
  authorTag: message.author.tag,
  createdAt: message.createdTimestamp,
  editedAt: message.editedTimestamp === 0 ? null : message.editedTimestamp,
  content: message.content,
  embeds: message.embeds,
  flags: message.flags.toArray(),
  pinned: message.pinned,
})

type ContentBackup = Map<string, ChannelBackup>

interface ChannelBackup {
  id: TextChannel['id']
  name: TextChannel['name']
  messages: MessageBackup[]
}

interface MessageBackup {
  id: Message['id']

  authorID: Message['author']['id']
  authorTag: Message['author']['tag']

  createdAt: Message['createdTimestamp']
  editedAt: Message['editedTimestamp']

  content: Message['content']
  embeds: Message['embeds']
  flags: MessageFlagsString[]

  pinned: Message['pinned']
}
