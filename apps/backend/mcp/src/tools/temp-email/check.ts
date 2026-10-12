import * as z from "zod";
import { defineTool } from "../define";

export const checkTempEmail = defineTool({
	name: "check_temp_email",
	title: "Check temp email",
	description:
		"Check whether an email address or bare domain is disposable (a temp or throwaway inbox), a role address such as admin@ or support@, or from a free consumer provider, and whether its domain has MX records. Nothing is sent to the mailbox and nothing is stored. Use this before creating a contact or sending to an address you do not trust: treat `disposable` and `invalid` verdicts as reject, `risky` as review, and `deliverable` as safe. `riskScore` runs from 0 (safe) to 1 (throwaway).",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: true,
	},
	input: z.object({
		email: z
			.string()
			.trim()
			.min(1)
			.describe("Email address or bare domain, for example you@mailinator.com"),
	}),
	output: z.object({
		input: z.string(),
		kind: z.enum(["email", "domain"]).nullable(),
		domain: z.string().nullable(),
		verdict: z.enum(["invalid", "disposable", "risky", "deliverable"]),
		isValidSyntax: z.boolean(),
		isDisposable: z.boolean(),
		isRoleAddress: z.boolean(),
		isFreeProvider: z.boolean(),
		mxRecords: z
			.array(z.string())
			.describe("MX hosts for the domain, lowest priority first"),
		confidence: z
			.number()
			.describe("How sure Reloop is of the verdict, from 0 to 1"),
		riskScore: z.number().describe("From 0 (safe) to 1 (throwaway)"),
		flags: z.array(z.string()),
	}),
	async run(args, api) {
		const response = await api.tempEmail.check(args.email);
		return {
			input: response.input,
			kind: response.kind,
			domain: response.domain,
			verdict: response.verdict,
			isValidSyntax: response.isValidSyntax,
			isDisposable: response.isDisposable,
			isRoleAddress: response.isRoleAddress,
			isFreeProvider: response.isFreeProvider,
			mxRecords: response.mxRecords,
			confidence: response.confidence,
			riskScore: response.riskScore,
			flags: response.flags,
		};
	},
});
