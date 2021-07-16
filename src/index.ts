import { field } from '@lolpants/jogger'
import dateformat from 'dateformat'
import { Client } from 'discord.js'
import { writeFile } from 'node:fs/promises'
import sourceMapSupport from 'source-map-support'
import { backupGuild } from './backup/index.js'
import { GUILD_ID, TOKEN } from './env/index.js'
import { exitHook } from './exit.js'
import { errorField, flush, logger } from './logger.js'

// Enable Source Maps
sourceMapSupport.install()

const client = new Client()
client.on('ready', async () => {
  logger.info(
    field('action', 'ready'),
    field('user', client.user?.tag ?? 'Unknown')
  )

  const resolveGuild = async () => {
    try {
      const guild = await client.guilds.fetch(GUILD_ID)
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

  const guild = await resolveGuild()
  const buffer = await backupGuild(guild)

  const timestamp = dateformat('yyyymmddHHMMss')
  const filepath = `./${timestamp}.${guild.id}.zip`
  await writeFile(filepath, buffer)

  logger.info(
    field('event', 'write-zip'),
    field('path', filepath),
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
