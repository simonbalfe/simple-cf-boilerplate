import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'

export const meRoutes = new Hono().get('/me', requireAuth, (c) => {
  const { user } = c.get('session')
  return c.json({ user })
})
