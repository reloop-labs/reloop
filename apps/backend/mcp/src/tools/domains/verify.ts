import * as z from "zod";
import { defineTool } from "../define";
import { domainIdSchema, domainStatusSchema } from "./schemas";

export const verifyDomain = defineTool({
	name: "verify_domain",
	title: "Verify domain",
	description:
		"Check the DNS records of a sending domain by ID. If every record is already in place the domain becomes `active` immediately and `verified` is true. Otherwise the status is `verifying` and Reloop keeps re-checking in the background while DNS propagates, which can take minutes to hours; call get_domain later to see the outcome and which records still fail.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: true,
	},
	input: z.object({ id: domainIdSchema }),
	output: z.object({
		id: z.string(),
		status: domainStatusSchema,
		verified: z
			.boolean()
			.describe("True when the domain is active and can send"),
	}),
	async run(args, api) {
		const response = await api.domains.verify(args.id);
		return {
			id: response.id,
			status: response.status,
			verified: response.status === "active",
		};
	},
});
