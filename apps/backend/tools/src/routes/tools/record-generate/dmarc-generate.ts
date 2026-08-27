import { ToolsErrors } from "@be/tools/error/tools.error-response";
import { isPlausibleDomain, normalizeDomain } from "@be/tools/lib/domain";
import type { RecordWarning } from "./spf-generate";

export type DmarcPolicy = "none" | "quarantine" | "reject";
export type DmarcAlignment = "r" | "s";

export type DmarcGenerateInput = {
	domain: string;
	policy?: DmarcPolicy;
	rua?: string;
	ruf?: string;
	aspf?: DmarcAlignment;
	adkim?: DmarcAlignment;
	pct?: number;
	sp?: DmarcPolicy;
};

export type DmarcGenerateResult = {
	domain: string;
	dnsName: string;
	record: string;
	policy: DmarcPolicy;
	warnings: RecordWarning[];
};

const EMAIL =
	/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

function parseMailtoList(
	raw: string | undefined,
	tag: "rua" | "ruf",
): {
	values: string[];
	warnings: RecordWarning[];
} {
	const warnings: RecordWarning[] = [];
	if (!raw || !raw.trim()) return { values: [], warnings };

	const values: string[] = [];
	for (const part of raw.split(",")) {
		let item = part.trim();
		if (!item) continue;
		if (item.toLowerCase().startsWith("mailto:")) {
			item = item.slice("mailto:".length);
		}
		if (!EMAIL.test(item)) {
			warnings.push({
				severity: "fail",
				code: `bad-${tag}`,
				detail: `"${part.trim()}" is not a valid ${tag} mailbox.`,
				fix: `Use ${tag}=mailto:dmarc@yourdomain.com`,
			});
			continue;
		}
		values.push(`mailto:${item.toLowerCase()}`);
	}
	return { values, warnings };
}

export function generateDmarcRecord(
	input: DmarcGenerateInput,
): DmarcGenerateResult {
	const domain = normalizeDomain(input.domain);
	if (!domain) throw ToolsErrors.generatorEmptyDomain();
	if (!isPlausibleDomain(domain)) throw ToolsErrors.generatorInvalidDomain();

	const policy = input.policy ?? "none";
	const warnings: RecordWarning[] = [];
	const tags = ["v=DMARC1", `p=${policy}`];

	if (input.sp && input.sp !== policy) {
		tags.push(`sp=${input.sp}`);
	}

	if (input.pct !== undefined && input.pct !== 100) {
		if (!Number.isInteger(input.pct) || input.pct < 0 || input.pct > 100) {
			warnings.push({
				severity: "fail",
				code: "bad-pct",
				detail: "pct must be an integer from 0 to 100.",
				fix: "Omit pct to default to 100, or set pct=100 for full enforcement.",
			});
		} else {
			tags.push(`pct=${input.pct}`);
			if (policy !== "none") {
				warnings.push({
					severity: "warn",
					code: "partial-pct",
					detail: `pct=${input.pct} applies the policy to only ${input.pct}% of mail.`,
					fix: "Use pct=100 (or omit pct) before expecting BIMI or full enforcement.",
				});
			}
		}
	}

	if (input.adkim && input.adkim !== "r") tags.push(`adkim=${input.adkim}`);
	if (input.aspf && input.aspf !== "r") tags.push(`aspf=${input.aspf}`);

	const rua = parseMailtoList(input.rua, "rua");
	const ruf = parseMailtoList(input.ruf, "ruf");
	warnings.push(...rua.warnings, ...ruf.warnings);
	if (rua.values.length) tags.push(`rua=${rua.values.join(",")}`);
	if (ruf.values.length) tags.push(`ruf=${ruf.values.join(",")}`);

	if (policy === "none") {
		warnings.push({
			severity: "warn",
			code: "monitor-only",
			detail:
				"p=none only monitors. Receivers will not quarantine or reject unauthenticated mail.",
			fix: "Start with p=none and rua=, then move to quarantine and reject once sources are clean.",
		});
		if (rua.values.length === 0) {
			warnings.push({
				severity: "warn",
				code: "no-rua",
				detail:
					"No rua= aggregate reporting address. You will not receive DMARC reports.",
				fix: `Add rua=mailto:dmarc@${domain} (or a reporting provider mailbox).`,
			});
		}
	}

	if (policy === "reject" && (input.pct === undefined || input.pct === 100)) {
		warnings.push({
			severity: "warn",
			code: "reject-strict",
			detail:
				"p=reject tells receivers to refuse unauthenticated mail claiming this domain.",
			fix: "Inventory every sender (CRM, billing, support) before publishing reject.",
		});
	}

	return {
		domain,
		dnsName: `_dmarc.${domain}`,
		record: `${tags.join("; ")};`,
		policy,
		warnings,
	};
}
