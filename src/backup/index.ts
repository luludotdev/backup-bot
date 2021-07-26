import { field } from '@lolpants/jogger'
import type { Guild } from 'discord.js'
import JSZip from 'jszip'
import { channelContent } from '~backup/channelContent.js'
import { resolveChannelTree } from '~backup/channelTree.js'
import { downloadGuildEmoji } from '~backup/emojis.js'
import { resolveGuildInfo } from '~backup/guildInfo.js'
import { resolveRoleList } from '~backup/roles.js'
import { PRETTY_JSON } from '~env/index.js'
import { ctxField, logger } from '~logger.js'

const ctx = ctxField('backup')
export const backupGuild: (guild: Guild) => Promise<Buffer> = async guild => {
  const zip = new JSZip()

  logger.debug(ctx, field('message', 'resolving guild info...'))
  const guildInfo = await resolveGuildInfo(guild)
  zip.file('guild.json', toJson(guildInfo))

  logger.debug(ctx, field('message', 'resolving channel tree...'))
  const tree = await resolveChannelTree(guild)
  zip.file('channels.json', toJson(tree))

  logger.debug(ctx, field('message', 'resolving role list...'))
  const roles = await resolveRoleList(guild)
  zip.file('roles.json', toJson(roles))

  logger.debug(ctx, field('message', 'backing up channel content...'))
  const channelBackups = await channelContent(guild)
  for (const [path, backup] of channelBackups.entries()) {
    zip.file(`channels/${path}.json`, toJson(backup))
  }

  logger.debug(ctx, field('message', 'backing up guild emoji...'))
  const [emoji, emojiFiles] = await downloadGuildEmoji(guild)
  zip.file('emoji.json', toJson(emoji))
  for (const [filename, data] of emojiFiles.entries()) {
    zip.file(`emoji/${filename}`, data)
  }

  logger.debug(ctx, field('message', 'generating zip buffer...'))
  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9,
    },
  })

  return buffer
}

const toJson: <T extends Record<string, any>>(data: T) => string = data => {
  if (PRETTY_JSON) return JSON.stringify(data, null, 2)
  return JSON.stringify(data)
}
