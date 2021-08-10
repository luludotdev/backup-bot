import process from 'node:process'

type AsyncExitHook = () => void
type ExitHook = (exit: AsyncExitHook, error?: Error) => void | Promise<void>

const hooks: Set<ExitHook> = new Set()

export const exitHook = (hook: ExitHook) => {
  hooks.add(hook)
}

let terminating = false
const cleanup = async (error?: Error, code?: number) => {
  if (terminating === true) return
  terminating = true

  const jobs = [...hooks].map(
    async h =>
      new Promise<void>(resolve => {
        void h(resolve, error)
      })
  )

  await Promise.all(jobs)
  process.exit(code !== undefined ? code : error !== undefined ? 1 : 0)
}

export const shutdown = (code?: number) => {
  void cleanup(undefined, code)
}

process.on('exit', async () => cleanup())
process.on('SIGHUP', async () => cleanup())
process.on('SIGINT', async () => cleanup())
process.on('SIGTERM', async () => cleanup())
process.on('SIGBREAK', async () => cleanup())

process.on('uncaughtException', async error => cleanup(error))
process.on('unhandledRejection', async error => {
  await (error instanceof Error
    ? cleanup(error)
    : cleanup(new Error('Unknown rejection')))
})
