import * as z from "zod";
import { defineTool } from "../define";
import {
	apiKeyIdSchema,
	apiKeyNameSchema,
	apiKeySchema,
	toApiKeyOutput,
} from "./schemas";

export const updateApiKey = defineTool({
	name: "update_api_key",
	title: "Rename API key",
	description:
		"Rename an API key by ID. The secret and enabled state are unchanged; use rotate_api_key to replace the secret and enable_api_key or disable_api_key to change its state.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: apiKeyIdSchema, name: apiKeyNameSchema }),
	output: z.object({ apiKey: apiKeySchema }),
	async run(args, api) {
		return {
			apiKey: toApiKeyOutput(await api.apiKeys.rename(args.id, args.name)),
		};
	},
});
