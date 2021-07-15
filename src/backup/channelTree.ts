import type {
  Guild,
  GuildChannel,
  GuildMember,
  PermissionOverwrites,
  PermissionString,
  Role,
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

  const channels = [...guild.channels.cache.values()].sort(
    (a, b) => a.position - b.position
  )

  /* eslint-disable no-await-in-loop */
  for (const channel of channels.filter(x => x.type === 'category')) {
    tree.push({
      id: channel.id,
      name: channel.name,
      channels: [],
      permissions: await mapPermissions(channel.permissionOverwrites),
    })
  }
  /* eslint-enable no-await-in-loop */

  /* eslint-disable no-await-in-loop */
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
      permissions: await mapPermissions(channel.permissionOverwrites),
    })
  }
  /* eslint-enable no-await-in-loop */

  return tree
}

const mapPermissions: (
  overrides: GuildChannel['permissionOverwrites']
) => Promise<PermissionOverwriteBackup[] | null> = async overrides => {
  if (overrides.size === 0) return null

  /* eslint-disable no-await-in-loop */
  const array: PermissionOverwriteBackup[] = []
  for (const override of overrides.values()) {
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
