import { ToolsErrors } from "@be/tools/error/tools.error-response";
import {
	domainExists,
	findRecordsByPrefix,
	lookupTxtResult,
	type TxtResult,
	type TxtResultLookup,
} from "@be/tools/lib/dns-txt";
import { isPlausibleDomain, normalizeDomain } from "@be/tools/lib/domain";
import { fetchHttpsText } from "@be/tools/lib/fetch-https";
import { inspectSvgTinyPs } from "@be/tools/lib/svg-tiny-ps";
import { getDomain } from "tldts";
import {
	type BimiCheckItem,
	type CheckStatus,
	evaluateDmarcForBimi,
	httpsUrlIssue,
	overallVerdict,
	parseBimiRecord,
} from "./bimi-parse";

export type LogoInspection = {
	fetched: boolean;
	contentType: string | null;
	tinyPsOk: boolean | null;
	issues: { status: CheckStatus; detail: string; fix?: string }[];
};

export interface BimiCheckResult {
	domain: string;
	queryName: string;
	verdict: CheckStatus;
	bimiRecord: string | null;
	logoUrl: string | null;
	authorityUrl: string | null;
	dmarcRecord: string | null;
	dmarcPolicy: string | null;
	dmarcPct: number | null;
	dmarcEnforced: boolean;
	logo: LogoInspection;
	checks: BimiCheckItem[];
	recommendations: string[];
}

export type BimiCheckDeps = {
	lookupTxt: TxtResultLookup;
	domainExists: (domain: string) => Promise<boolean | null>;
	fetchLogo: boolean;
};

const defaultDeps: BimiCheckDeps = {
	lookupTxt: (name) => lookupTxtResult(name),
	domainExists: (domain) => domainExists(domain),
	fetchLogo: true,
};

const MAX_DMARC_WALK = 8;

function parentDomain(domain: string): string | null {
	const labels = domain.split(".");
	if (labels.length <= 2) return null;
	return labels.slice(1).join(".");
}

// One retry: a single dropped UDP packet shouldn't turn into "no record".
async function lookupWithRetry(
	name: string,
	lookup: TxtResultLookup,
): Promise<TxtResult> {
	const first = await lookup(name);
	return first.failed ? lookup(name) : first;
}

export async function discoverDmarc(
	domain: string,
	lookup: TxtResultLookup,
): Promise<{
	records: string[];
	at: string;
	inherited: boolean;
	failed: boolean;
}> {
	let current: string | null = domain;
	let failed = false;
	for (let hop = 0; hop < MAX_DMARC_WALK && current; hop++) {
		const result = await lookupWithRetry(`_dmarc.${current}`, lookup);
		failed ||= result.failed;
		const matches = findRecordsByPrefix(result.records, "v=dmarc1");
		if (matches.length > 0) {
			return {
				records: matches,
				at: current,
				inherited: current !== domain,
				failed: false,
			};
		}
		current = parentDomain(current);
	}
	return { records: [], at: domain, inherited: false, failed };
}

// BIMI discovery: look at default._bimi.<domain>, and if that holds no BIMI
// record, fall back to the organizational domain (draft-brand-indicators-for-
// message-identification, "Assertion Record Discovery").
export async function discoverBimi(
	domain: string,
	lookup: TxtResultLookup,
): Promise<{ records: string[]; queryName: string; inherited: boolean }> {
	const queryName = `default._bimi.${domain}`;
	const own = await lookupWithRetry(queryName, lookup);
	if (own.failed) throw ToolsErrors.bimiLookupFailed();

	const ownMatches = findRecordsByPrefix(own.records, "v=bimi1");
	const orgDomain = getDomain(domain);
	if (ownMatches.length > 0 || !orgDomain || orgDomain === domain) {
		return { records: ownMatches, queryName, inherited: false };
	}

	const orgQueryName = `default._bimi.${orgDomain}`;
	const org = await lookupWithRetry(orgQueryName, lookup);
	if (org.failed) throw ToolsErrors.bimiLookupFailed();

	const orgMatches = findRecordsByPrefix(org.records, "v=bimi1");
	if (orgMatches.length === 0) {
		return { records: [], queryName, inherited: false };
	}
	return { records: orgMatches, queryName: orgQueryName, inherited: true };
}

function recommendationsFrom(checks: BimiCheckItem[]): string[] {
	const lines: string[] = [];
	for (const check of checks) {
		if (check.status !== "pass" && check.fix) lines.push(check.fix);
	}
	if (lines.length === 0) {
		lines.push(
			"BIMI looks ready. Mailbox providers that support BIMI may show the logo on authenticated mail.",
		);
	}
	return [...new Set(lines)];
}

async function inspectLogo(
	url: string,
	enabled: boolean,
): Promise<LogoInspection> {
	if (!enabled) {
		return { fetched: false, contentType: null, tinyPsOk: null, issues: [] };
	}

	const fetched = await fetchHttpsText(url);
	if (!fetched.ok) {
		return {
			fetched: false,
			contentType: fetched.contentType || null,
			tinyPsOk: null,
			issues: [
				{
					status: "warn",
					detail: fetched.error || "Could not fetch the BIMI logo.",
					fix: "Confirm the l= URL is publicly reachable over HTTPS and returns an SVG.",
				},
			],
		};
	}

	const typeOk =
		fetched.contentType === "" ||
		fetched.contentType === "image/svg+xml" ||
		fetched.contentType === "text/xml" ||
		fetched.contentType === "application/xml";

	const issues: LogoInspection["issues"] = [];
	if (!typeOk) {
		issues.push({
			status: "warn",
			detail: `Logo Content-Type is "${fetched.contentType || "missing"}"; expected image/svg+xml.`,
			fix: "Serve the logo with Content-Type: image/svg+xml.",
		});
	}

	const svg = inspectSvgTinyPs(fetched.body);
	for (const issue of svg.issues) {
		issues.push({
			status: issue.status,
			detail: issue.detail,
			fix: issue.fix,
		});
	}

	return {
		fetched: true,
		contentType: fetched.contentType || null,
		tinyPsOk: svg.ok,
		issues,
	};
}

export async function checkBimiController(
	rawDomain: string,
	deps: Partial<BimiCheckDeps> = {},
): Promise<BimiCheckResult> {
	const {
		lookupTxt: resolveTxt,
		domainExists: checkDomainExists,
		fetchLogo,
	} = { ...defaultDeps, ...deps };
	const domain = normalizeDomain(rawDomain);

	if (!domain) throw ToolsErrors.bimiEmptyInput();
	if (!isPlausibleDomain(domain)) throw ToolsErrors.bimiInvalidDomain();

	const [bimiDiscovery, dmarcDiscovery] = await Promise.all([
		discoverBimi(domain, resolveTxt),
		discoverDmarc(domain, resolveTxt),
	]);
	const { queryName, records: bimiMatches } = bimiDiscovery;

	// No record anywhere could mean the domain itself is a typo. Only ask then,
	// so a working domain doesn't pay for the extra lookup.
	if (bimiMatches.length === 0 && dmarcDiscovery.records.length === 0) {
		if ((await checkDomainExists(domain)) === false) {
			throw ToolsErrors.bimiDomainNotFound(domain);
		}
	}

	const dmarcMatches = dmarcDiscovery.records;
	const bimiRaw = bimiMatches[0] ?? null;
	const dmarcRaw = dmarcMatches.length === 1 ? (dmarcMatches[0] ?? null) : null;
	const dmarc = evaluateDmarcForBimi(dmarcRaw, {
		inherited: dmarcDiscovery.inherited,
	});

	const checks: BimiCheckItem[] = [];

	if (bimiMatches.length > 1) {
		checks.push({
			id: "duplicate-bimi",
			label: "Single BIMI record",
			status: "fail",
			detail: `Found ${bimiMatches.length} BIMI TXT records at ${queryName}. Only one is valid.`,
			fix: "Delete extra default._bimi TXT records so a single v=BIMI1 record remains.",
		});
	}

	const parsed = bimiRaw ? parseBimiRecord(bimiRaw) : null;
	let logoUrl: string | null = parsed?.logoUrl || null;
	const authorityUrl: string | null = parsed?.authorityUrl || null;

	if (!parsed) {
		const orgDomain = getDomain(domain);
		const checkedOrg = orgDomain && orgDomain !== domain;
		checks.push({
			id: "bimi-present",
			label: "BIMI TXT",
			status: "fail",
			detail: checkedOrg
				? `No BIMI record at ${queryName} or default._bimi.${orgDomain}.`
				: `No BIMI record at ${queryName}.`,
			fix: `Publish a TXT record at ${queryName} with v=BIMI1; l=https://…/logo.svg`,
		});
	} else {
		checks.push({
			id: "bimi-present",
			label: "BIMI TXT",
			status: "pass",
			detail: bimiDiscovery.inherited
				? `No record at default._bimi.${domain}, so inboxes use the one at ${queryName}.`
				: `Found BIMI record at ${queryName}.`,
			record: parsed.raw,
		});

		const versionOk = (parsed.version || "").toUpperCase() === "BIMI1";
		checks.push({
			id: "bimi-version",
			label: "v=BIMI1",
			status: versionOk ? "pass" : "fail",
			detail: versionOk
				? "Version tag is BIMI1."
				: `Version tag is "${parsed.version || "missing"}"; expected v=BIMI1.`,
			fix: versionOk ? undefined : "Start the record with v=BIMI1;",
		});

		if (parsed.isDecline) {
			logoUrl = "";
			checks.push({
				id: "bimi-logo",
				label: "Logo URL (l=)",
				status: "warn",
				detail:
					"l= is empty. That is a valid BIMI assertion that asks receivers not to show a logo.",
				fix: "Set l= to an HTTPS SVG Tiny PS logo if you want the brand mark in supporting inboxes.",
			});
		} else {
			const logo = httpsUrlIssue(parsed.logoUrl, "logo");
			checks.push({
				id: "bimi-logo",
				label: "Logo URL (l=)",
				status: logo.ok ? "pass" : "fail",
				detail: parsed.logoUrl
					? `${logo.detail} ${parsed.logoUrl}`
					: logo.detail,
				fix: logo.fix,
			});
		}

		if (parsed.authorityUrl) {
			const auth = httpsUrlIssue(parsed.authorityUrl, "authority certificate");
			checks.push({
				id: "bimi-authority",
				label: "VMC / CMC (a=)",
				status: auth.ok ? "pass" : "fail",
				detail: `${auth.detail} ${parsed.authorityUrl}`,
				fix: auth.fix,
			});
		} else {
			checks.push({
				id: "bimi-authority",
				label: "VMC / CMC (a=)",
				status: "warn",
				detail:
					"No a= certificate URL. Gmail and some other providers require a Verified Mark Certificate before they show the logo.",
				fix: "Add a=https://…/vmc.pem after you obtain a VMC or CMC from a BIMI certificate authority.",
			});
		}
	}

	if (dmarcMatches.length > 1) {
		checks.push({
			id: "dmarc",
			label: "DMARC enforcement",
			status: "fail",
			detail: `Found ${dmarcMatches.length} DMARC TXT records at _dmarc.${dmarcDiscovery.at}. Multiple DMARC records must be discarded.`,
			fix: "Keep a single v=DMARC1 TXT record at that name.",
		});
	} else if (!dmarc.present && dmarcDiscovery.failed) {
		checks.push({
			id: "dmarc",
			label: "DMARC enforcement",
			status: "warn",
			detail: `The DNS lookup for _dmarc.${domain} did not answer, so DMARC could not be checked.`,
			fix: "Run the check again in a moment.",
		});
	} else if (!dmarc.present) {
		checks.push({
			id: "dmarc",
			label: "DMARC enforcement",
			status: "fail",
			detail: `No DMARC record at _dmarc.${domain} or a parent domain. BIMI requires DMARC at enforcement.`,
			fix: `Publish _dmarc.${domain} with v=DMARC1; p=quarantine or p=reject and pct=100 (or omit pct).`,
		});
	} else if (!dmarc.enforced) {
		const policy = dmarc.policy || "missing";
		const pct = dmarc.pct === null ? "invalid" : String(dmarc.pct);
		checks.push({
			id: "dmarc",
			label: "DMARC enforcement",
			status: "fail",
			detail: `DMARC is present but not at BIMI enforcement (p=${policy}, pct=${pct}). BIMI needs p=quarantine or p=reject with pct=100.`,
			record: dmarc.record || undefined,
			fix: "Raise p= to quarantine or reject and set pct=100 (or remove pct so it defaults to 100).",
		});
	} else {
		checks.push({
			id: "dmarc",
			label: "DMARC enforcement",
			status: "pass",
			detail: `DMARC is at enforcement (p=${dmarc.policy}, pct=${dmarc.pct}).`,
			record: dmarc.record || undefined,
		});
	}

	let logo: LogoInspection = {
		fetched: false,
		contentType: null,
		tinyPsOk: null,
		issues: [],
	};

	if (parsed?.logoUrl && !parsed.isDecline) {
		const urlCheck = httpsUrlIssue(parsed.logoUrl, "logo");
		if (urlCheck.ok) {
			logo = await inspectLogo(parsed.logoUrl, fetchLogo);
			for (const issue of logo.issues) {
				checks.push({
					id: `logo-${checks.length}`,
					label: "Logo file",
					status: issue.status,
					detail: issue.detail,
					fix: issue.fix,
				});
			}
		}
	}

	const verdict = overallVerdict(checks);

	return {
		domain,
		queryName,
		verdict,
		bimiRecord: bimiRaw,
		logoUrl,
		authorityUrl,
		dmarcRecord: dmarc.record,
		dmarcPolicy: dmarc.policy,
		dmarcPct: dmarc.pct,
		dmarcEnforced: dmarc.enforced,
		logo,
		checks,
		recommendations: recommendationsFrom(checks),
	};
}
