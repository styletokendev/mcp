import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zhpepigcjxtzhvotenzp.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''

let cachedClient: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!cachedClient) {
    if (!SUPABASE_SERVICE_KEY) {
      throw new Error('SUPABASE_SERVICE_KEY environment variable is required')
    }
    cachedClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  }
  return cachedClient
}
