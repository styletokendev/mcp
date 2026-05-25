import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { authenticate } from './auth.js';
import { getTokens } from './tools/get-tokens.js';
import { getComponents } from './tools/get-components.js';
import { getMetadata } from './tools/get-metadata.js';
const server = new Server({ name: 'styletoken-mcp-server', version: '0.1.0' }, { capabilities: { tools: {} } });
// ── Tool list ──
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: 'get_tokens',
            description: 'Get style tokens (colors, fonts, spacing) for a project',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID from Styletoken' }
                },
                required: ['project_id']
            }
        },
        {
            name: 'get_components',
            description: 'Get global components and page-assigned components for a project',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID from Styletoken' }
                },
                required: ['project_id']
            }
        },
        {
            name: 'get_metadata',
            description: 'Get metadata (intent, animation specs, timing) for a specific component',
            inputSchema: {
                type: 'object',
                properties: {
                    component_id: { type: 'string', description: 'Component ID like HP-001' }
                },
                required: ['component_id']
            }
        }
    ]
}));
// ── Tool call handler ──
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    // Authenticate on every call
    let userId;
    try {
        userId = await authenticate();
    }
    catch (err) {
        throw new McpError(ErrorCode.InvalidRequest, `Authentication failed: ${err instanceof Error ? err.message : 'Invalid token'}`);
    }
    if (!args) {
        throw new McpError(ErrorCode.InvalidParams, 'Missing arguments');
    }
    try {
        let result;
        switch (name) {
            case 'get_tokens': {
                const projectId = args.project_id;
                if (!projectId)
                    throw new McpError(ErrorCode.InvalidParams, 'project_id is required');
                result = await getTokens(userId, projectId);
                break;
            }
            case 'get_components': {
                const projectId = args.project_id;
                if (!projectId)
                    throw new McpError(ErrorCode.InvalidParams, 'project_id is required');
                result = await getComponents(userId, projectId);
                break;
            }
            case 'get_metadata': {
                const componentId = args.component_id;
                if (!componentId)
                    throw new McpError(ErrorCode.InvalidParams, 'component_id is required');
                result = await getMetadata(componentId);
                break;
            }
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
        if (result.error) {
            return {
                content: [{ type: 'text', text: `Error: ${result.error}` }],
                isError: true
            };
        }
        return {
            content: [{ type: 'text', text: JSON.stringify(result.result, null, 2) }]
        };
    }
    catch (err) {
        if (err instanceof McpError)
            throw err;
        throw new McpError(ErrorCode.InternalError, `Internal error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
});
// ── Start ──
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Styletoken MCP server running on stdio');
}
main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map