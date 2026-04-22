import { env } from 'cloudflare:workers'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { schema } from './schema'

export function getDb() {
  return drizzle(neon(env.DATABASE_URL), { schema })
}

export { schema }
