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

      // TODO: Backup Messages
      map.set(`#${channel.id}@${channel.name}`, [])
    }
    /* eslint-enable no-await-in-loop */

    return map
  }

type ContentBackup = Map<string, ChannelBackup[]>

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
