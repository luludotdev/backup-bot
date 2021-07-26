import { field } from '@lolpants/jogger'
import type { Guild } from 'discord.js'
import JSZip from 'jszip'
import { channelContent } from '~backup/channelContent.js'
import { resolveChannelTree } from '~backup/channelTree.js'
import { downloadGuildEmoji } from '~backup/emojis.js'
import { resolveGuildInfo } from '~backup/guildInfo.js'
import { resolveRoleList } from '~backup/roles.js'
import { ctxField, logger } from '~logger.js'

const ctx = ctxField('backup')
export const backupGuild: (guild: Guild) => Promise<Buffer> = async guild => {
  const zip = new JSZip()

  logger.debug(ctx, field('message', 'resolving guild info...'))
  const guildInfo = await resolveGuildInfo(guild)
  zip.file('guild.json', JSON.stringify(guildInfo, null, 2))

  logger.debug(ctx, field('message', 'resolving channel tree...'))
  const tree = await resolveChannelTree(guild)
  zip.file('channels.json', JSON.stringify(tree, null, 2))

  logger.debug(ctx, field('message', 'resolving role list...'))
  const roles = await resolveRoleList(guild)
  zip.file('roles.json', JSON.stringify(roles, null, 2))

  logger.debug(ctx, field('message', 'backing up channel content...'))
  const channelBackups = await channelContent(guild)
  for (const [path, backup] of channelBackups.entries()) {
    zip.file(`channels/${path}.json`, JSON.stringify(backup, null, 2))
  }

  logger.debug(ctx, field('message', 'backing up guild emoji...'))
  const [emoji, emojiFiles] = await downloadGuildEmoji(guild)
  zip.file('emoji.json', JSON.stringify(emoji, null, 2))
  for (const [filename, data] of emojiFiles.entries()) {
    zip.file(`emoji/${filename}`, data)
  }

  logger.debug(ctx, field('message', 'generating zip buffer...'))
  const buffer = await zip.generateAsync({
    compression: 'DEFLATE',
    type: 'nodebuffer',
  })

  return buffer
}
