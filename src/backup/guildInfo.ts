import type { Guild, GuildMember, VoiceChannel } from 'discord.js'

export const resolveGuildInfo: (guild: Guild) => Promise<GuildBackup> =
  async guild => ({
    id: guild.id,
    name: guild.name,
    description: guild.description,
    createdAt: guild.createdTimestamp,

    memberCount: guild.memberCount,
    owner: guild.owner
      ? {
          id: guild.owner.id,
          tag: guild.owner.user.tag,
        }
      : null,

    contentFilter: guild.explicitContentFilter,
    mfaLevel: guild.mfaLevel,
    verificationLevel: guild.verificationLevel,

    defaultMessageNotifications: guild.defaultMessageNotifications,
    region: guild.region,
    vanityInvite: guild.vanityURLCode,

    afkTimeout: guild.afkTimeout ?? null,
    afkChannel: guild.afkChannel
      ? {
          id: guild.afkChannel.id,
          name: guild.afkChannel.name,
        }
      : null,
  })

interface GuildBackup {
  id: Guild['id']
  name: Guild['name']
  description: Guild['description']
  createdAt: Guild['createdTimestamp']

  memberCount: Guild['memberCount']
  owner: {
    id: GuildMember['id']
    tag: GuildMember['user']['tag']
  } | null

  contentFilter: Guild['explicitContentFilter']
  mfaLevel: Guild['mfaLevel']
  verificationLevel: Guild['verificationLevel']

  defaultMessageNotifications: Guild['defaultMessageNotifications']
  region: Guild['region']
  vanityInvite: Guild['vanityURLCode']

  afkTimeout: Guild['afkTimeout'] | null
  afkChannel: {
    id: VoiceChannel['id']
    name: VoiceChannel['name']
  } | null
}
