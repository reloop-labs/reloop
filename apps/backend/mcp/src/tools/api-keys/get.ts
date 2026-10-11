import * as z from "zod";
import { defineTool } from "../define";
import { apiKeyIdSchema, apiKeySchema, toApiKeyOutput } from "./schemas";

export const getApiKey = defineTool({
	name: "get_api_key",
	title: "Get API key",
	description:
		"Get one API key by ID: its name, enabled state, usage count, last use, and creator. The secret is never returned. Returns an `api_key_not_found` error when no key matches; use list_api_keys to find the ID.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: apiKeyIdSchema }),
	output: z.object({ apiKey: apiKeySchema }),
	async run(args, api) {
		return { apiKey: toApiKeyOutput(await api.apiKeys.retrieve(args.id)) };
	},
});
