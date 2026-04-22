import { Hono } from 'hono'
import { authRoutes } from './routes/auth'
import { meRoutes } from './routes/me'

export const app = new Hono().basePath('/api').route('/', authRoutes).route('/', meRoutes)

export type AppRouter = typeof app
