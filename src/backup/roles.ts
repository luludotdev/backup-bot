import type { Guild, GuildMember, PermissionString, Role } from 'discord.js'
import { MAX_ROLE_MEMBERS } from '../env/index.js'

export const resolveRoleList: (guild: Guild) => Promise<readonly RoleBackup[]> =
  async guild => {
    const roles = await guild.roles.fetch(undefined, true, true)
    const array: RoleBackup[] = []

    const sorted = [...roles.cache.values()].sort(
      (a, b) => b.position - a.position
    )

    for (const role of sorted) {
      const resolveMembers = () => {
        if (role.id === guild.id) return null
        if (MAX_ROLE_MEMBERS >= 0 && role.members.size > MAX_ROLE_MEMBERS) {
          return null
        }

        return role.members.map(member => ({
          id: member.id,
          tag: member.user.tag,
        }))
      }

      array.push({
        id: role.id,
        name: role.name,
        permissions: role.permissions.toArray(),
        memberCount: role.members.size,
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

  memberCount: number
  members: RoleMemberBackup[] | null

  color: Role['hexColor'] | null
  hoisted: Role['hoist']
  mentionable: Role['mentionable']
}

interface RoleMemberBackup {
  id: GuildMember['id']
  tag: GuildMember['user']['tag']
}
