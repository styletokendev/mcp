import { getSupabase } from './supabase.js'

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

  const token = getAuthToken()
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('user_tokens')
    .select('user_id')
    .eq('token_hash', token)
    .single()

  if (error || !data) {
    throw new Error('Invalid API token')
  }

  // Update last_used_at
  await supabase
    .from('user_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('token_hash', token)

  if (!data.user_id) {
    throw new Error('Invalid API token')
  }
  cachedUserId = String(data.user_id)
  return cachedUserId
}

export function clearAuthCache() {
  cachedUserId = null
}
