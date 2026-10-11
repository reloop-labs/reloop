import * as z from "zod";
import { defineTool } from "../define";
import { apiKeyIdSchema, apiKeySchema, toApiKeyOutput } from "./schemas";

export const disableApiKey = defineTool({
	name: "disable_api_key",
	title: "Disable API key",
	description:
		"Disable an API key by ID without deleting it. Every request made with it is rejected until enable_api_key is called, so services using it stop working; if this MCP server authenticates with that same key, it will lose access too. Prefer this over delete_api_key when the key may be needed again.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: apiKeyIdSchema }),
	output: z.object({ apiKey: apiKeySchema }),
	async run(args, api) {
		return { apiKey: toApiKeyOutput(await api.apiKeys.disable(args.id)) };
	},
});
