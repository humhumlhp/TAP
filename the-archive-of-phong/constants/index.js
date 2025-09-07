// Read from public Expo env vars at build/runtime. Do NOT hardcode real keys in source.
export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Optional: warn in development if env vars are missing (helps contributors)
if (!supabaseUrl || !supabaseAnonKey) {
	// eslint-disable-next-line no-console
		console.warn(`
			[config] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. 
			Create a .env file from .env.example and fill in your values.
		`);
}