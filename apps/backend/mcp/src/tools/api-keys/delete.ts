import * as z from "zod";
import { defineTool } from "../define";
import { apiKeyIdSchema } from "./schemas";

export const deleteApiKey = defineTool({
	name: "delete_api_key",
	title: "Delete API key",
	description:
		"Permanently delete an API key by ID. This cannot be undone: every request made with it is rejected from now on, and if this MCP server authenticates with that same key, it will lose access too. Prefer disable_api_key when the key may be needed again. Use get_api_key to confirm the right key first.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: apiKeyIdSchema }),
	output: z.object({ deleted: z.literal(true), id: z.string() }),
	async run(args, api) {
		const response = await api.apiKeys.remove(args.id);
		return { deleted: true as const, id: response.id };
	},
});
