import type { Guild } from 'discord.js'

export const resolveGuildInfo: (guild: Guild) => Promise<GuildBackup> =
  async guild => ({
    id: guild.id,
    name: guild.name,
  })

interface GuildBackup {
  id: Guild['id']
  name: Guild['name']
  // TODO: More info
}
