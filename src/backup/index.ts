import { field } from '@lolpants/jogger'
import type { Guild } from 'discord.js'
import JSZip from 'jszip'
import { ctxField, logger } from '../logger.js'
import { resolveChannelTree } from './channelTree.js'
import { resolveRoleList } from './roles.js'

const ctx = ctxField('backup')
export const backupGuild: (guild: Guild) => Promise<Buffer> = async guild => {
  const zip = new JSZip()

  logger.debug(ctx, field('message', 'resolving channel tree...'))
  const tree = await resolveChannelTree(guild)
  zip.file('channel-tree.json', JSON.stringify(tree, null, 2))

  logger.debug(ctx, field('message', 'resolving role list...'))
  const roles = await resolveRoleList(guild)
  zip.file('roles.json', JSON.stringify(roles, null, 2))

  logger.debug(ctx, field('message', 'generating zip buffer...'))
  const buffer = await zip.generateAsync({
    compression: 'DEFLATE',
    type: 'nodebuffer',
  })

  return buffer
}
