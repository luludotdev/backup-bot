import { Client } from 'discord.js'
import sourceMapSupport from 'source-map-support'
import { TOKEN } from './env/index.js'

// Enable Source Maps
sourceMapSupport.install()

const client = new Client({ partials: ['CHANNEL', 'MESSAGE', 'USER'] })

void client.login(TOKEN)
