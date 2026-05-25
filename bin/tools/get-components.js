import { query } from '../supabase.js'

export async function getComponents(userId, projectId) {
  const project = await query('projects', { id: projectId, user_id: userId })
  if (!project) {
    return { error: 'Project not found or access denied' }
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zhpepigcjxtzhvotenzp.supabase.co'
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''

  // Get global components
  const globalsUrl = `${SUPABASE_URL}/rest/v1/project_bookmarks?project_id=eq.${projectId}&is_global=eq.true&select=prompt_id,created_at&order=created_at.asc`
  let globals = []
  try {
    const res = await fetch(globalsUrl, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      }
    })
    if (res.ok) globals = await res.json()
  } catch { /* noop */ }

  return {
    result: {
      project: { id: project.id, name: project.name },
      global_components: globals.map(g => g.prompt_id),
      pages: []
    }
  }
}
