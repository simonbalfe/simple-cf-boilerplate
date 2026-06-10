import { RPCHandler } from '@orpc/server/fetch'
import { Hono } from 'hono'
import { router } from './orpc/router'
import { authRoutes } from './routes/auth'

const rpcHandler = new RPCHandler(router)

export const app = new Hono()
  .basePath('/api')
  .route('/', authRoutes)
  .use('/rpc/*', async (c, next) => {
    const { matched, response } = await rpcHandler.handle(c.req.raw, {
      prefix: '/api/rpc',
      context: { headers: c.req.raw.headers },
    })
    if (matched) return c.newResponse(response.body, response)
    await next()
  })

export { router } from './orpc/router'
export type { AppRouter } from './orpc/router'
