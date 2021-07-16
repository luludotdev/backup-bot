import { field } from '@lolpants/jogger'
import { Client } from 'discord.js'
import sourceMapSupport from 'source-map-support'
import { TOKEN } from './env/index.js'
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
