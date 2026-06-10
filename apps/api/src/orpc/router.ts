import { protectedProcedure } from './base'

export const router = {
  me: protectedProcedure.handler(({ context }) => ({ user: context.session.user })),
}

export type AppRouter = typeof router
