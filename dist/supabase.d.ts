interface QueryResult {
    id: string;
    [key: string]: unknown;
}
export declare function requireEnv(): void;
export declare function query(table: string, params: Record<string, string>): Promise<QueryResult | null>;
export declare function update(table: string, params: Record<string, string>, updates: Record<string, unknown>): Promise<boolean>;
export {};
//# sourceMappingURL=supabase.d.ts.map