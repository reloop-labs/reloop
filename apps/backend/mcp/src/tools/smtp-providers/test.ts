import * as z from "zod";
import { defineTool } from "../define";
import {
	smtpProviderIdSchema,
	smtpProviderSchema,
	toSmtpProviderOutput,
} from "./schemas";

export const testSmtpProvider = defineTool({
	name: "test_smtp_provider",
	title: "Test SMTP provider",
	description:
		"Connect to an SMTP provider by ID, negotiate STARTTLS, and log in. Pass `to` to also deliver a real test email so the user can confirm it lands. Returns `ok` and the server's `error` message when it fails, and stores the result on the provider.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: true,
	},
	input: z.object({
		id: smtpProviderIdSchema,
		to: z
			.string()
			.email()
			.optional()
			.describe("Send a real test email to this address"),
	}),
	output: z.object({
		ok: z.boolean(),
		error: z.string().nullable(),
		provider: smtpProviderSchema,
	}),
	async run(args, api) {
		const result = await api.smtpProviders.test(args.id, args.to);
		return {
			ok: result.ok,
			error: result.error,
			provider: toSmtpProviderOutput(result.provider),
		};
	},
});
