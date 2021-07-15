import type { Guild } from 'discord.js'
import JSZip from 'jszip'
import { resolveChannelTree } from './channelTree.js'

export const backupGuild: (guild: Guild) => Promise<Buffer> = async guild => {
  const zip = new JSZip()

  const tree = await resolveChannelTree(guild)
  zip.file('channel-tree.json', JSON.stringify(tree, null, 2))

  const buffer = await zip.generateAsync({
    compression: 'DEFLATE',
    type: 'nodebuffer',
  })

  return buffer
}
