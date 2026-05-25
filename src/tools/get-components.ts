import { getSupabase } from '../supabase.js'
import type { ToolResult } from '../types.js'

interface BookmarkRow {
  prompt_id: string
  created_at: string
}

interface PageRow {
  id: string
  name: string
}

interface PageComponentRow {
  prompt_id: string
}

export async function getComponents(userId: string, projectId: string): Promise<ToolResult> {
  const supabase = getSupabase()

  // Verify project belongs to user
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, name')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single()

  if (projectError || !project) {
    return { error: 'Project not found or access denied' }
  }

  // Get global components
  const { data: globals } = await supabase
    .from('project_bookmarks')
    .select('prompt_id, created_at')
    .eq('project_id', projectId)
    .eq('is_global', true)
    .order('created_at', { ascending: true })

  // Get pages
  const { data: pages } = await supabase
    .from('project_pages')
    .select('id, name')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  let pageComponents: Array<{ page: { id: string; name: string }; components: string[] }> = []

  if (pages && pages.length > 0) {
    const pageIds = pages.map(p => p.id)
    const { data: assignments } = await supabase
      .from('page_components')
      .select('page_id, prompt_id')
      .in('page_id', pageIds)

    if (assignments) {
      const grouped: Record<string, string[]> = {}
      for (const a of assignments) {
        if (!grouped[a.page_id]) grouped[a.page_id] = []
        grouped[a.page_id].push(a.prompt_id)
      }
      pageComponents = pages.map(p => ({
        page: { id: p.id, name: p.name },
        components: grouped[p.id] || []
      }))
    }
  }

  return {
    result: {
      project: { id: project.id, name: project.name },
      global_components: (globals || []).map(g => (g as BookmarkRow).prompt_id),
      pages: pageComponents
    }
  }
}
