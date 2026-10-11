import * as z from "zod";
import { defineTool } from "../define";
import { domainIdSchema, domainSchema, toDomainOutput } from "./schemas";

export const getDomain = defineTool({
	name: "get_domain",
	title: "Get domain",
	description:
		"Get one sending domain by ID, including the DNS records the user must add at their DNS provider and the verification status of each. Use this to show setup instructions or to diagnose why a domain is not `active`. Returns a `domain_not_found` error when no domain matches; use list_domains to find the ID.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: domainIdSchema }),
	output: z.object({ domain: domainSchema }),
	async run(args, api) {
		return { domain: toDomainOutput(await api.domains.retrieve(args.id)) };
	},
});
