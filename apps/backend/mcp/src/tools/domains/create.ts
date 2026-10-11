import * as z from "zod";
import { defineTool } from "../define";
import {
	domainNameSchema,
	domainSchema,
	domainSettingsShape,
	toDomainOutput,
} from "./schemas";

export const createDomain = defineTool({
	name: "create_domain",
	title: "Create domain",
	description:
		"Add a sending domain to the Reloop organization. The domain starts as `pending` and cannot send until verified: show the user the returned `dnsRecords` to add at their DNS provider, then call verify_domain. Fails with `domain_already_exists` if the domain is already registered, or `quota_exceeded` when the plan's domain limit is reached. Settings default to sending, receiving, click and open tracking enabled, and opportunistic TLS.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: false,
		openWorldHint: false,
	},
	input: z.object({ domain: domainNameSchema, ...domainSettingsShape }),
	output: z.object({ domain: domainSchema }),
	async run(args, api) {
		const domain = await api.domains.create({
			domain: args.domain,
			click_tracking: args.clickTracking,
			open_tracking: args.openTracking,
			sending_email: args.sendingEmail,
			receiving_email: args.receivingEmail,
			tls: args.tls,
		});
		return { domain: toDomainOutput(domain) };
	},
});
