import * as z from "zod";
import { defineTool } from "../define";
import {
	sendingDomainSchema,
	smtpHostSchema,
	smtpPortSchema,
	smtpProviderIdSchema,
	smtpProviderSchema,
	smtpSecuritySchema,
	toSmtpProviderOutput,
} from "./schemas";

export const updateSmtpProvider = defineTool({
	name: "update_smtp_provider",
	title: "Update SMTP provider",
	description:
		"Change an SMTP provider by ID, or route one more sending domain through it with `domain` (added to Reloop automatically). Only the fields you pass change; omit `password` to keep the stored one. Changing connection details resets `status` to unverified, so call test_smtp_provider afterwards.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({
		id: smtpProviderIdSchema,
		domain: sendingDomainSchema.optional(),
		name: z.string().min(1).max(100).optional(),
		host: smtpHostSchema.optional(),
		port: smtpPortSchema.optional(),
		security: smtpSecuritySchema.optional(),
		username: z.string().min(1).max(255).optional(),
		password: z
			.string()
			.min(1)
			.max(1024)
			.optional()
			.describe("New password; omit to keep the stored one"),
	}),
	output: z.object({ provider: smtpProviderSchema }),
	async run({ id, ...input }, api) {
		const provider = await api.smtpProviders.update(id, input);
		return { provider: toSmtpProviderOutput(provider) };
	},
});
