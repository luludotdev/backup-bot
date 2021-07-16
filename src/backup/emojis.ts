import type { Emoji, Guild } from 'discord.js'

export const downloadGuildEmoji: (guild: Guild) => Promise<EmojiInfo> =
  async guild => {
    const map: EmojiFiles = new Map()

    // TODO: Download and save all the emoji lol

    return [[], map]
  }

type EmojiFiles = Map<string, Buffer>

interface EmojiBackup {
  id: Emoji['id']
  name: Emoji['name']
  identifier: Emoji['identifier']
}

type EmojiInfo = [info: EmojiBackup[], files: EmojiFiles]
