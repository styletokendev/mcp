import { query } from '../supabase.js';
export async function getTokens(userId, projectId) {
    const project = await query('projects', { id: projectId, user_id: userId });
    if (!project) {
        return { error: 'Project not found or access denied' };
    }
    const tokensData = await query('project_tokens', { project_id: projectId });
    if (!tokensData) {
        return { error: 'No tokens found for this project' };
    }
    return {
        result: {
            project: { id: project.id, name: project.name },
            tokens: tokensData.tokens || {}
        }
    };
}
//# sourceMappingURL=get-tokens.js.map