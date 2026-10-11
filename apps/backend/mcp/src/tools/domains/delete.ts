import * as z from "zod";
import { defineTool } from "../define";
import { domainIdSchema } from "./schemas";

export const deleteDomain = defineTool({
	name: "delete_domain",
	title: "Delete domain",
	description:
		"Permanently delete a sending domain by ID, with its DNS configuration and signing keys. This cannot be undone: email can no longer be sent from addresses on it, inbound mail for it stops, and adding it again generates new DNS records the user must re-create. Use get_domain to confirm the right domain first.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: domainIdSchema }),
	output: z.object({ deleted: z.literal(true), id: z.string() }),
	async run(args, api) {
		const domain = await api.domains.remove(args.id);
		return { deleted: true as const, id: domain.id };
	},
});
