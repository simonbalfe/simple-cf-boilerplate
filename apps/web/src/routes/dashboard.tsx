import { createAuth } from '@repo/auth'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { orpc } from '~/lib/api'
import { signOut, useSession } from '~/lib/auth-client'

const getServerSession = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest()
  return await createAuth().api.getSession({ headers: request.headers })
})

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const session = await getServerSession()
    if (!session) throw redirect({ to: '/login' })
    return { session }
  },
  component: Dashboard,
})

function Dashboard() {
  const navigate = useNavigate()
  const { data: session } = useSession()
  const { data: me } = useQuery(orpc.me.queryOptions())

  async function handleSignOut() {
    await signOut()
    navigate({ to: '/login' })
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Hello, {session?.user.name ?? session?.user.email}.</p>
      <p>oRPC /me: {me?.user.email ?? 'loading...'}</p>
      <button type="button" onClick={handleSignOut}>
        Sign out
      </button>
    </div>
  )
}
