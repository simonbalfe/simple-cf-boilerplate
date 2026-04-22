import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div>
      <h1>Simple CF Boilerplate</h1>
      <p>TanStack Start + Hono + Cloudflare Workers + D1 + Drizzle + Better Auth.</p>
    </div>
  )
}
