import { NewsChannel, StoreChannel, TextChannel } from 'discord.js'
import type {
  Guild,
  GuildChannel,
  GuildMember,
  PermissionOverwrites,
  PermissionString,
  Role,
  VoiceChannel,
} from 'discord.js'

export const resolveChannelTree: (
  guild: Guild
) => Promise<Readonly<ChannelTree>> = async guild => {
  const rootID = '#root'
  const tree: ChannelTree = [
    {
      id: rootID,
      name: rootID,
      channels: [],
      permissions: null,
    },
  ]

  const channels = [...guild.channels.cache.values()]
    .filter((channel): channel is GuildChannel => !channel.isThread())
    .sort((a, b) => a.position - b.position)

  /* eslint-disable no-await-in-loop */
  for (const channel of channels.filter(x => x.type === 'GUILD_CATEGORY')) {
    tree.push({
      id: channel.id,
      name: channel.name,
      channels: [],
      permissions: await mapPermissions(channel.permissionOverwrites),
    })
  }
  /* eslint-enable no-await-in-loop */

  type NotCategory = TextChannel | StoreChannel | NewsChannel | VoiceChannel
  const notCategories = channels.filter(
    (channel): channel is NotCategory => channel.type !== 'GUILD_CATEGORY'
  )

  /* eslint-disable no-await-in-loop */
  for (const channel of notCategories) {
    const parentID = channel.parentId ?? rootID
    const parent = tree.find(x => x.id === parentID)
    if (!parent) {
      throw new Error(
        `failed to find parent of #${channel.name} (${channel.id})`
      )
    }

    type Slowmode = TextChannel['rateLimitPerUser'] | null
    const slowmode: Slowmode =
      channel instanceof TextChannel ? channel.rateLimitPerUser : null

    const topic =
      channel instanceof TextChannel || channel instanceof NewsChannel
        ? channel.topic
        : null

    const nsfw =
      channel instanceof TextChannel ||
      channel instanceof NewsChannel ||
      channel instanceof StoreChannel
        ? channel.nsfw
        : false

    parent.channels.push({
      id: channel.id,
      name: channel.name,
      type: channel.type,
      topic,
      nsfw,
      slowmode: slowmode === 0 ? null : slowmode,
      permissions: await mapPermissions(channel.permissionOverwrites),
    })
  }
  /* eslint-enable no-await-in-loop */

  return tree
}

const mapPermissions: (
  overrides: GuildChannel['permissionOverwrites']
) => Promise<PermissionOverwriteBackup[] | null> = async overrides => {
  if (overrides.cache.size === 0) return null

  /* eslint-disable no-await-in-loop */
  const array: PermissionOverwriteBackup[] = []
  for (const override of overrides.cache.values()) {
    const { id, type } = override
    const allow = override.allow.toArray()
    const deny = override.deny.toArray()

    if (type === 'role') {
      const guildRole = await override.channel.guild.roles.fetch(override.id)
      const name = guildRole?.name ?? '__unknown__'

      const role: RolePermissionOverwrite = {
        id,
        type,
        name,
        allow,
        deny,
      }

      array.push(role)
    } else {
      const guildMember = await override.channel.guild.members.fetch(
        override.id
      )

      const tag = guildMember.user.tag
      const member: MemberPermissionOverwrite = {
        id,
        type,
        tag,
        allow,
        deny,
      }

      array.push(member)
    }
  }
  /* eslint-enable no-await-in-loop */

  return array
}

type ChannelTree = CategoryBackup[]

interface CategoryBackup {
  id: GuildChannel['id']
  name: GuildChannel['name']
  channels: ChannelBackup[]
  permissions: PermissionOverwriteBackup[] | null
}

interface ChannelBackup {
  id: GuildChannel['id']
  name: GuildChannel['name']
  type: Exclude<GuildChannel['type'], 'category'>
  topic: string | null
  nsfw: TextChannel['nsfw']
  slowmode: TextChannel['rateLimitPerUser'] | null
  permissions: PermissionOverwriteBackup[] | null
}

type PermissionOverwriteBackup =
  | MemberPermissionOverwrite
  | RolePermissionOverwrite

interface CommonPermissionOverwrite {
  id: PermissionOverwrites['id']
  allow: PermissionString[]
  deny: PermissionString[]
}

interface MemberPermissionOverwrite extends CommonPermissionOverwrite {
  type: 'member'
  tag: GuildMember['user']['tag']
}

interface RolePermissionOverwrite extends CommonPermissionOverwrite {
  type: 'role'
  name: Role['name']
}
