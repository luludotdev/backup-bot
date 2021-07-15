import {
  createConsoleSink,
  createField,
  createFileSink,
  createLogger,
  field,
} from '@lolpants/jogger'
import type { IField } from '@lolpants/jogger'
import { IS_DEV } from './env/index.js'

const consoleSink = createConsoleSink(IS_DEV)
const fileSink = createFileSink({
  name: 'bot',
  directory: 'logs',
  debug: IS_DEV,
})

export const logger = createLogger({
  name: 'bot',
  sink: [consoleSink, fileSink],
})

export const ctxField = createField('context')
export const errorField: <T extends Error>(error: T) => Readonly<IField> =
  error => {
    const array: Array<Readonly<IField>> = [
      field('type', error.name),
      field('message', error.message),
    ]

    if (error.stack) array.push(field('stack', error.stack))
    return field('error', array[0], ...array.slice(1))
  }

export const flush = async () => fileSink.flush()
