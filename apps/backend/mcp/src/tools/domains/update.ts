import * as z from "zod";
import { defineTool } from "../define";
import {
	domainIdSchema,
	domainSchema,
	domainSettingsShape,
	toDomainOutput,
} from "./schemas";

export const updateDomain = defineTool({
	name: "update_domain",
	title: "Update domain",
	description:
		"Change the settings of a sending domain by ID: sending, receiving, click tracking, open tracking, or TLS mode. Only the fields you pass change. Enabling receiving or tracking can add DNS records the user must create; check `dnsRecords` in the result and call verify_domain afterwards. The domain name itself cannot be changed.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z
		.object({ id: domainIdSchema, ...domainSettingsShape })
		.refine(
			(value) =>
				value.clickTracking !== undefined ||
				value.openTracking !== undefined ||
				value.sendingEmail !== undefined ||
				value.receivingEmail !== undefined ||
				value.tls !== undefined,
			{ message: "Pass at least one setting to update" },
		),
	output: z.object({ domain: domainSchema }),
	async run(args, api) {
		const domain = await api.domains.update(args.id, {
			click_tracking: args.clickTracking,
			open_tracking: args.openTracking,
			sending_email: args.sendingEmail,
			receiving_email: args.receivingEmail,
			tls: args.tls,
		});
		return { domain: toDomainOutput(domain) };
	},
});
