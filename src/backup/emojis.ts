import axios from 'axios'
import type { Emoji, Guild } from 'discord.js'
import { parse } from 'node:path'

export const downloadGuildEmoji: (guild: Guild) => Promise<EmojiInfo> =
  async guild => {
    const info: EmojiBackup[] = []
    const map: EmojiFiles = new Map()

    /* eslint-disable no-await-in-loop */
    for (const emoji of guild.emojis.cache.values()) {
      info.push({
        id: emoji.id,
        name: emoji.name,
        identifier: emoji.identifier,
        animated: emoji.animated,
      })

      const { ext } = parse(emoji.url)
      const filename = `${emoji.name}.${emoji.id}${ext}`

      const resp = await axios.get<Buffer>(emoji.url, {
        responseType: 'arraybuffer',
      })

      map.set(filename, Buffer.from(resp.data))
    }
    /* eslint-enable no-await-in-loop */

    return [[], map]
  }

type EmojiFiles = Map<string, Buffer>

interface EmojiBackup {
  id: Emoji['id']
  name: Emoji['name']
  identifier: Emoji['identifier']
  animated: Emoji['animated']
}

type EmojiInfo = [info: EmojiBackup[], files: EmojiFiles]
