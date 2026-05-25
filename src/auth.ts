import { requireEnv, query, update } from './supabase.js'

let cachedUserId: string | null = null

export function getAuthToken(): string {
  const token = process.env.STYLETOKEN_API_KEY
  if (!token) {
    throw new Error('STYLETOKEN_API_KEY environment variable is required')
  }
  return token
}

export async function authenticate(): Promise<string> {
  if (cachedUserId) return cachedUserId

  requireEnv()

  const token = getAuthToken()

  const data = await query('user_tokens', { token_hash: token })

  if (!data || !data.user_id) {
    throw new Error('Invalid API token')
  }

  await update('user_tokens', { token_hash: token }, { last_used_at: new Date().toISOString() })

  cachedUserId = String(data.user_id)
  return cachedUserId
}

export function clearAuthCache() {
  cachedUserId = null
}
