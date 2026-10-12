import * as z from "zod";
import { defineTool } from "../define";

const categoryStatus = z.enum(["pass", "warn", "fail"]);

const category = z.object({
	score: z.number().describe("Category score from 0 to 100"),
	weight: z
		.number()
		.describe("Share of the overall score this category carries, in percent"),
	status: categoryStatus,
	summary: z.string(),
});

export const checkDomainReputation = defineTool({
	name: "check_domain_reputation",
	title: "Check domain reputation",
	description:
		"Score the sender reputation of a domain from 0 to 100 with an A+ to F grade. It audits SPF, DKIM and DMARC, checks 7 domain blocklists live, and looks at domain age and DNS health (MX, A, NS, PTR, TLS). Nothing is sent and nothing is stored. Use this before sending from a domain, after changing its DNS, or when deliverability drops: each failing or warning entry in `checks` names the problem and often the current `record`, and `recommendations` lists the fixes in plain language. Treat `poor` and `critical` verdicts as not ready to send.",
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
			.describe(
				"Root or sending domain without protocol or path, for example reloop.sh",
			),
	}),
	output: z.object({
		domain: z.string(),
		score: z.number().describe("Overall reputation from 0 to 100"),
		grade: z.enum(["A+", "A", "B", "C", "D", "F"]),
		verdict: z.enum(["excellent", "good", "fair", "poor", "critical"]),
		verdictLabel: z.string(),
		breakdown: z.object({
			authentication: category,
			blocklist: category,
			domainAge: category,
			dnsHealth: category,
		}),
		checks: z.array(
			z.object({
				id: z.string(),
				category: z.enum([
					"authentication",
					"blocklist",
					"domain_age",
					"dns_health",
				]),
				label: z.string(),
				status: z.enum(["pass", "warn", "fail", "info"]),
				detail: z.string(),
				record: z
					.string()
					.optional()
					.describe("The DNS record found for this check, when there is one"),
			}),
		),
		recommendations: z.array(z.string()),
	}),
	async run(args, api) {
		const response = await api.domainReputation.check(args.domain);
		return {
			domain: response.domain,
			score: response.score,
			grade: response.grade,
			verdict: response.verdict,
			verdictLabel: response.verdictLabel,
			breakdown: response.breakdown,
			checks: response.checks.map((check) => ({
				id: check.id,
				category: check.category,
				label: check.label,
				status: check.status,
				detail: check.detail,
				record: check.record,
			})),
			recommendations: response.recommendations,
		};
	},
});
