import * as z from "zod";
import { defineTool } from "../define";
import {
	apiKeyNameSchema,
	apiKeySecretSchema,
	toApiKeySecretOutput,
} from "./schemas";

export const createApiKey = defineTool({
	name: "create_api_key",
	title: "Create API key",
	description:
		"Create a new organization-wide Reloop API key. The response contains the full secret `key`, which Reloop shows only once: hand it to the user immediately and tell them to store it in a secret manager; it cannot be read back later. Do not write the key into source code, logs, or chat history beyond what the user asked for.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: false,
		openWorldHint: false,
	},
	input: z.object({ name: apiKeyNameSchema }),
	output: z.object({ apiKey: apiKeySecretSchema }),
	async run(args, api) {
		return {
			apiKey: toApiKeySecretOutput(await api.apiKeys.create(args.name)),
		};
	},
});
