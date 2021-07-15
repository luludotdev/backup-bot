import type { Message, MessageFlagsString, TextChannel } from 'discord.js'

export const channelContent: () => Promise<ContentBackup> = async () => {
  // TODO
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
