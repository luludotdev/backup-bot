import { registerBool, registerInt, registerString } from './register.js'

// #region Globals
const NODE_ENV = registerString('NODE_ENV')
const IS_PROD = NODE_ENV?.toLowerCase() === 'production'
export const IS_DEV = !IS_PROD
// #endregion

// #region Bot
export const TOKEN = registerString('TOKEN', true)
export const GUILD_ID = registerString('GUILD_ID', true)
export const BACKUPS_DIR = registerString('BACKUPS_DIR') ?? './backups'
export const PRETTY_JSON = registerBool('PRETTY_JSON') ?? false
export const MAX_ROLE_MEMBERS = registerInt('MAX_ROLE_MEMBERS') ?? 500
// #endregion
