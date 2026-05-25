const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zhpepigcjxtzhvotenzp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
export function requireEnv() {
    if (!SUPABASE_SERVICE_KEY) {
        throw new Error('SUPABASE_SERVICE_KEY environment variable is required');
    }
}
export async function query(table, params) {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, `eq.${value}`);
    }
    url.searchParams.set('limit', '1');
    try {
        const res = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'apikey': SUPABASE_SERVICE_KEY
            }
        });
        if (!res.ok)
            return null;
        const data = await res.json();
        return data?.[0] || null;
    }
    catch {
        return null;
    }
}
export async function update(table, params, updates) {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, `eq.${value}`);
    }
    try {
        const res = await fetch(url.toString(), {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'apikey': SUPABASE_SERVICE_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(updates)
        });
        return res.ok;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=supabase.js.map