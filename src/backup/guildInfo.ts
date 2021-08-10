import type {
  Guild,
  GuildFeatures,
  GuildMember,
  VoiceChannel,
} from 'discord.js'

export const resolveGuildInfo: (guild: Guild) => Promise<GuildBackup> =
  async guild => {
    const owner = await guild.fetchOwner()

    return {
      id: guild.id,
      name: guild.name,
      description: guild.description,
      createdAt: guild.createdTimestamp,

      memberCount: guild.memberCount,
      owner: {
        id: owner.id,
        tag: owner.user.tag,
      },

      contentFilter: guild.explicitContentFilter,
      mfaLevel: guild.mfaLevel,
      verificationLevel: guild.verificationLevel,

      defaultMessageNotifications: guild.defaultMessageNotifications,
      vanityInvite: guild.vanityURLCode,

      features: guild.features,

      afkTimeout: guild.afkTimeout ?? null,
      afkChannel: guild.afkChannel
        ? {
            id: guild.afkChannel.id,
            name: guild.afkChannel.name,
          }
        : null,
    }
  }

interface GuildBackup {
  id: Guild['id']
  name: Guild['name']
  description: Guild['description']
  createdAt: Guild['createdTimestamp']

  memberCount: Guild['memberCount']
  owner: {
    id: GuildMember['id']
    tag: GuildMember['user']['tag']
  }

  contentFilter: Guild['explicitContentFilter']
  mfaLevel: Guild['mfaLevel']
  verificationLevel: Guild['verificationLevel']

  defaultMessageNotifications: Guild['defaultMessageNotifications']
  vanityInvite: Guild['vanityURLCode']

  features: GuildFeatures[]

  afkTimeout: Guild['afkTimeout'] | null
  afkChannel: {
    id: VoiceChannel['id']
    name: VoiceChannel['name']
  } | null
}
