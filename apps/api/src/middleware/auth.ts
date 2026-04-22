import { createAuth } from '@repo/auth'
import { createMiddleware } from 'hono/factory'

type AuthSession = Awaited<ReturnType<ReturnType<typeof createAuth>['api']['getSession']>> & {}

type AuthEnv = {
  Variables: {
    session: AuthSession
  }
}

export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const session = await createAuth().api.getSession({ headers: c.req.raw.headers })
  if (!session?.user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  c.set('session', session)
  await next()
})
