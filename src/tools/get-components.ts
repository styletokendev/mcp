import { query } from '../supabase.js'
import type { ToolResult } from '../types.js'

export async function getComponents(userId: string, projectId: string): Promise<ToolResult> {
  const project = await query('projects', { id: projectId, user_id: userId })

  if (!project) {
    return { error: 'Project not found or access denied' }
  }

  // Get global components - we can only filter by single columns with REST API,
  // so fetch all bookmarks for this project and filter
  const globalsUrl = `https://zhpepigcjxtzhvotenzp.supabase.co/rest/v1/project_bookmarks?project_id=eq.${projectId}&is_global=eq.true&select=prompt_id,created_at&order=created_at.asc`
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''

  let globals: Array<{ prompt_id: string }> = []
  try {
    const res = await fetch(globalsUrl, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      }
    })
    if (res.ok) globals = await res.json()
  } catch { /* noop */ }

  // Pages table might not exist yet — that's okay, return empty
  let pageComponents: Array<{ page: { id: string; name: string }; components: string[] }> = []

  return {
    result: {
      project: { id: project.id, name: project.name },
      global_components: globals.map(g => g.prompt_id),
      pages: pageComponents
    }
  }
}
