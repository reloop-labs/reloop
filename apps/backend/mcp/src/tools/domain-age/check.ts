import * as z from "zod";
import { defineTool } from "../define";

export const checkDomainAge = defineTool({
	name: "check_domain_age",
	title: "Check domain age",
	description:
		"Look up how old a domain is from its official registry over RDAP: registration date, age in days, last update date, expiry date and registrar. The `verdict` is also its email warmup stage: `too_new` (0 to 7 days) and `cold` (8 to 30 days) mean mailbox providers will filter mail from it, `warming` (31 to 90 days) means ramp volume up gradually, and `established` or `mature` means age no longer hurts deliverability. `not_registered`, `held` and `unknown_age` mean no usable age. It also reports whether SPF, DMARC and MX are published and whether the nameservers are parked. Nothing is sent and nothing is stored. Use this before sending from a new domain or before trusting an unfamiliar one.",
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
		registrableDomain: z
			.string()
			.describe("The registered domain the age belongs to, without subdomains"),
		verdict: z.enum([
			"too_new",
			"cold",
			"warming",
			"established",
			"mature",
			"unknown_age",
			"not_registered",
			"held",
		]),
		headline: z.string(),
		summary: z.string(),
		createdAt: z.string().nullable(),
		ageDays: z.number().nullable(),
		expiresAt: z.string().nullable(),
		updatedAt: z
			.string()
			.nullable()
			.describe("When the registry record last changed"),
		registrar: z.string().nullable(),
		registryStatus: z.array(z.string()),
		nameserverProvider: z.string().nullable(),
		nameserverKind: z.enum([
			"production",
			"registrar_default",
			"parking",
			"unknown",
		]),
		emailSetup: z.object({
			spf: z.boolean(),
			dmarc: z.boolean(),
			dmarcPolicy: z.string().nullable(),
			mx: z.boolean(),
		}),
		warnings: z.array(z.string()),
	}),
	async run(args, api) {
		const response = await api.domainAge.check(args.domain);
		return {
			domain: response.domain,
			registrableDomain: response.registrableDomain,
			verdict: response.verdict,
			headline: response.headline,
			summary: response.summary,
			createdAt: response.age.createdAt,
			ageDays: response.age.ageDays,
			expiresAt: response.age.expiresAt,
			updatedAt: response.age.updatedAt,
			registrar: response.registry.registrar,
			registryStatus: response.registry.status,
			nameserverProvider: response.nameservers.provider,
			nameserverKind: response.nameservers.kind,
			emailSetup: {
				spf: response.emailSetup.spf,
				dmarc: response.emailSetup.dmarc,
				dmarcPolicy: response.emailSetup.dmarcPolicy,
				mx: response.emailSetup.mx,
			},
			warnings: response.warnings,
		};
	},
});
