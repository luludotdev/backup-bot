import type { Guild } from 'discord.js'
import { resolveChannelTree } from './channelTree.js'

export const backupGuild: (guild: Guild) => Promise<void> = async guild => {
  const tree = await resolveChannelTree(guild)
  const treeJSON = JSON.stringify(tree, null, 2)
}
