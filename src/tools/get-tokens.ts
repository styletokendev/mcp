import { getSupabase } from '../supabase.js'
import type { ToolResult } from '../types.js'

interface TokenRow {
  project_id: string
  tokens: Record<string, string>
}

export async function getTokens(userId: string, projectId: string): Promise<ToolResult> {
  const supabase = getSupabase()

  // Verify the project belongs to this user
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, name')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single()

  if (projectError || !project) {
    return { error: 'Project not found or access denied' }
  }

  const { data, error } = await supabase
    .from('project_tokens')
    .select('tokens')
    .eq('project_id', projectId)
    .single()

  if (error || !data) {
    return { error: 'No tokens found for this project' }
  }

  const tokens = (data as TokenRow).tokens

  return {
    result: {
      project: { id: project.id, name: project.name },
      tokens
    }
  }
}
