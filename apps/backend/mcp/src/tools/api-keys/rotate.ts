import * as z from "zod";
import { defineTool } from "../define";
import {
	apiKeyIdSchema,
	apiKeySecretSchema,
	toApiKeySecretOutput,
} from "./schemas";

export const rotateApiKey = defineTool({
	name: "rotate_api_key",
	title: "Rotate API key",
	description:
		"Replace the secret of an API key while keeping its ID. The old secret stops working immediately, so every service still using it will fail until it is updated; if this MCP server authenticates with that same key, it will lose access too. The response contains the new secret `key`, shown only once: hand it to the user immediately.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: false,
		openWorldHint: false,
	},
	input: z.object({ id: apiKeyIdSchema }),
	output: z.object({ apiKey: apiKeySecretSchema }),
	async run(args, api) {
		return {
			apiKey: toApiKeySecretOutput(await api.apiKeys.rotate(args.id)),
		};
	},
});
