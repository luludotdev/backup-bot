import type { Guild, GuildChannel } from 'discord.js'

export const backupGuild: (guild: Guild) => Promise<void> = async guild => {
  const tree = await resolveChannelTree(guild)
  const treeJSON = JSON.stringify(tree, null, 2)
}

const resolveChannelTree: (guild: Guild) => Promise<Readonly<ChannelTree>> =
  async guild => {
    const rootID = '#root'
    const tree: ChannelTree = [
      {
        id: rootID,
        name: rootID,
        channels: [],
      },
    ]

    const channels = [...guild.channels.cache.values()].sort(
      (a, b) => a.position - b.position
    )

    for (const channel of channels.filter(x => x.type === 'category')) {
      tree.push({
        id: channel.id,
        name: channel.name,
        channels: [],
      })
    }

    for (const channel of channels.filter(x => x.type !== 'category')) {
      const parentID = channel.parentID ?? rootID
      const parent = tree.find(x => x.id === parentID)
      if (!parent) {
        throw new Error(
          `failed to find parent of #${channel.name} (${channel.id})`
        )
      }

      parent.channels.push({
        id: channel.id,
        name: channel.name,
        // @ts-expect-error
        type: channel.type,
        // @ts-expect-error
        topic: channel.topic ?? null,
      })
    }

    return tree
  }

type ChannelTree = CategoryBackup[]

interface CategoryBackup {
  id: GuildChannel['id']
  name: GuildChannel['name']
  channels: ChannelBackup[]
}

interface ChannelBackup {
  id: GuildChannel['id']
  name: GuildChannel['name']
  type: Exclude<GuildChannel['type'], 'category'>
  topic: string | null
}
