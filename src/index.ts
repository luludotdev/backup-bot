import 'source-map-support/register.js'

import { field } from '@lolpants/jogger'
import dateformat from 'dateformat'
import { Client, Intents } from 'discord.js'
import mkdirp from 'mkdirp'
import { writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { backupGuild } from '~backup/index.js'
import { BACKUPS_DIR, GUILD_ID, TOKEN } from '~env/index.js'
import { errorField, flush, logger } from '~logger.js'
import { exitHook } from './exit.js'

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS],
})

client.on('ready', async () => {
  logger.info(
    field('action', 'ready'),
    field('user', client.user?.tag ?? 'Unknown')
  )

  const resolveGuild = async () => {
    try {
      const guild = await client.guilds.fetch({ guild: GUILD_ID, force: true })
      logger.info(
        field('event', 'resolve-guild'),
        field('guild-id', guild.id),
        field('guild-name', guild.name)
      )

      return guild
    } catch {
      logger.error(
        field('error', 'INVALID_GUILD_ID'),
        field('message', `guild id \`${GUILD_ID}\` cannot be found`)
      )

      process.exit(1)
    }
  }

  // Resolve Discord Guild
  const guild = await resolveGuild()

  const members = await guild.members.fetch({ limit: 500_000 })
  logger.info(field('event', 'sync-members'), field('members', members.size))

  // Generate zip
  const buffer = await backupGuild(guild)

  const timestamp = dateformat('yyyymmddHHMMss')
  const filename = `${timestamp}.${guild.id}.zip`
  const filepath = resolve(join(BACKUPS_DIR, filename))

  await mkdirp(BACKUPS_DIR)
  await writeFile(filepath, buffer)

  logger.info(
    field('event', 'write-zip'),
    field('filename', filename),
    field('filepath', filepath),
    field('filesize', buffer.length)
  )

  process.exit(0)
})

exitHook(async (exit, error) => {
  client.destroy()
  if (error) {
    logger.error(errorField(error))
  } else {
    logger.info(field('action', 'shutdown'))
  }

  await flush()
  exit()
})

void client.login(TOKEN)
