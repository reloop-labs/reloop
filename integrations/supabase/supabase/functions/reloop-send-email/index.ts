import { createHandler } from "./handler.ts";

Deno.serve(
	createHandler({
		apiKey: Deno.env.get("RELOOP_API_KEY") ?? "",
		from: Deno.env.get("RELOOP_FROM") ?? "",
		hookSecret: Deno.env.get("SEND_EMAIL_HOOK_SECRET") ?? "",
		supabaseUrl: Deno.env.get("SUPABASE_URL") ?? "",
		apiUrl: Deno.env.get("RELOOP_API_URL"),
	}),
);
