import * as z from "zod";
import { defineTool } from "../define";
import { apiKeyIdSchema, apiKeySchema, toApiKeyOutput } from "./schemas";

export const enableApiKey = defineTool({
	name: "enable_api_key",
	title: "Enable API key",
	description:
		"Re-enable a disabled API key by ID so requests made with its existing secret are accepted again. Enabling an already enabled key changes nothing.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: apiKeyIdSchema }),
	output: z.object({ apiKey: apiKeySchema }),
	async run(args, api) {
		return { apiKey: toApiKeyOutput(await api.apiKeys.enable(args.id)) };
	},
});
