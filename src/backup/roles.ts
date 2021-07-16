import type { Guild, GuildMember, PermissionString, Role } from 'discord.js'

export const resolveRoleList: (guild: Guild) => Promise<readonly RoleBackup[]> =
  async guild => {
    const roles = await guild.roles.fetch(undefined, true, true)
    const array: RoleBackup[] = []

    const sorted = [...roles.cache.values()].sort(
      (a, b) => b.position - a.position
    )

    for (const role of sorted) {
      const resolveMembers = () => {
        if (role.id === guild.id) return []

        // TODO: Find more reliable method of fetching role members
        return role.members.map(member => ({
          id: member.id,
          tag: member.user.tag,
        }))
      }

      array.push({
        id: role.id,
        name: role.name,
        permissions: role.permissions.toArray(),
        members: resolveMembers(),
        color: role.color === 0 ? null : role.hexColor,
        hoisted: role.hoist,
        mentionable: role.mentionable,
      })
    }

    return array
  }

interface RoleBackup {
  id: Role['id']
  name: Role['name']
  permissions: PermissionString[]
  members: RoleMemberBackup[]

  color: Role['hexColor'] | null
  hoisted: Role['hoist']
  mentionable: Role['mentionable']
}

interface RoleMemberBackup {
  id: GuildMember['id']
  tag: GuildMember['user']['tag']
}
