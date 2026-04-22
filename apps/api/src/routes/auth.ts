import { createAuth } from '@repo/auth'
import { Hono } from 'hono'

export const authRoutes = new Hono().all('/auth/*', (c) => createAuth().handler(c.req.raw))
