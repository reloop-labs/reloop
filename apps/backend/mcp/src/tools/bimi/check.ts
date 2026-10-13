import * as z from "zod";
import { defineTool } from "../define";

const status = z.enum(["pass", "warn", "fail"]);

export const checkBimi = defineTool({
	name: "check_bimi",
	title: "Check BIMI",
	description:
		"Check whether a domain's logo can show next to its email in the inbox (BIMI). Looks up the TXT record at default._bimi.<domain>, validates v=BIMI1, the l= logo URL and the a= certificate (VMC/CMC) URL, confirms DMARC is at enforcement (p=quarantine or p=reject with pct=100), and fetches the SVG logo to flag scripts, animation, external references or a non-square canvas. The `verdict` is `pass` (ready), `warn` (works in some inboxes; Gmail and Apple Mail need the a= certificate) or `fail` (no logo anywhere). Each entry in `checks` has a `fix` when it is not passing. Nothing is sent and nothing is stored. Use this when setting up or debugging a brand logo in the inbox.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: true,
	},
	input: z.object({
		domain: z
			.string()
			.trim()
			.min(1)
			.describe("Domain or URL, for example reloop.sh or https://reloop.sh"),
	}),
	output: z.object({
		domain: z.string(),
		queryName: z
			.string()
			.describe(
				"The DNS name that was looked up, e.g. default._bimi.reloop.sh",
			),
		verdict: status,
		bimiRecord: z.string().nullable(),
		logoUrl: z.string().nullable(),
		authorityUrl: z
			.string()
			.nullable()
			.describe("The a= certificate (VMC or CMC) URL, if any"),
		dmarcPolicy: z.string().nullable(),
		dmarcEnforced: z.boolean(),
		checks: z.array(
			z.object({
				id: z.string(),
				label: z.string(),
				status,
				detail: z.string(),
				fix: z.string().nullable(),
			}),
		),
		recommendations: z.array(z.string()),
	}),
	async run(args, api) {
		const response = await api.bimi.check(args.domain);
		return {
			domain: response.domain,
			queryName: response.queryName,
			verdict: response.verdict,
			bimiRecord: response.bimiRecord,
			logoUrl: response.logoUrl,
			authorityUrl: response.authorityUrl,
			dmarcPolicy: response.dmarcPolicy,
			dmarcEnforced: response.dmarcEnforced,
			checks: response.checks.map((check) => ({
				id: check.id,
				label: check.label,
				status: check.status,
				detail: check.detail,
				fix: check.fix ?? null,
			})),
			recommendations: response.recommendations,
		};
	},
});
