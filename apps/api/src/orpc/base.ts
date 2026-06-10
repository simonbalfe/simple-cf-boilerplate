import { os, ORPCError } from '@orpc/server'
import { createAuth } from '@repo/auth'

type AuthSession = Awaited<ReturnType<ReturnType<typeof createAuth>['api']['getSession']>>

export interface ORPCContext {
  headers: Headers
}

const base = os.$context<ORPCContext>()

const withSession = base.middleware(async ({ context, next }) => {
  const session = await createAuth().api.getSession({ headers: context.headers })
  return next({ context: { session: session ?? null } })
})

export const publicProcedure = base.use(withSession)

export const protectedProcedure = publicProcedure.use(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError('UNAUTHORIZED', { message: 'Unauthorized' })
  }
  return next({ context: { session: context.session as NonNullable<AuthSession> } })
})
