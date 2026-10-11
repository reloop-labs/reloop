import * as z from "zod";
import { defineTool } from "../define";
import { apiKeySchema, toApiKeyOutput } from "./schemas";

export const listApiKeys = defineTool({
	name: "list_api_keys",
	title: "List API keys",
	description:
		"List the API keys of the authenticated Reloop organization, newest first, with offset pagination. Secrets are never returned here; each key shows only its `start` prefix. Use `search` to match on the key name or prefix and `enabled` to filter by state. Use this to find a key ID before get_api_key, update_api_key, rotate_api_key, enable_api_key, disable_api_key, or delete_api_key.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({
		page: z.number().int().min(1).default(1).describe("1-based page number"),
		limit: z
			.number()
			.int()
			.min(1)
			.max(100)
			.default(20)
			.describe("API keys per page, 1 to 100"),
		search: z
			.string()
			.trim()
			.min(1)
			.max(255)
			.optional()
			.describe(
				"Case-insensitive substring to match against the key name or prefix",
			),
		enabled: z
			.boolean()
			.optional()
			.describe("Only return enabled (true) or disabled (false) keys"),
	}),
	output: z.object({
		apiKeys: z.array(apiKeySchema),
		pagination: z.object({
			page: z.number().int(),
			limit: z.number().int(),
			total: z.number().int().describe("API keys matching the query"),
			hasMore: z.boolean(),
		}),
	}),
	async run(args, api) {
		const response = await api.apiKeys.list({
			page: args.page,
			limit: args.limit,
			q: args.search,
			enabled: args.enabled,
		});
		return {
			apiKeys: response.apiKeys.map(toApiKeyOutput),
			pagination: {
				page: response.page,
				limit: response.limit,
				total: response.total,
				hasMore: args.page * args.limit < response.total,
			},
		};
	},
});
