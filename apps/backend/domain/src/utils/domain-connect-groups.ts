import {
	type CnameLookup,
	classifyDnsError,
	type TxtLookup,
} from "@reloop/dns/verify-records";

/**
 * Domain Connect record groups for the email-setup template (issue #170).
 *
 * DMARC used to ride in `sending` with SPF. On DNS providers that ignore TXT conflict handling
 * (Cloudflare), applying the template to a domain that already publishes DMARC leaves two
 * `_dmarc` records, and receivers treat that as no DMARC policy at all. When the template has a
 * separate `dmarc` group (`DOMAIN_CONNECT_DMARC_GROUP=true`), it is requested only for domains
 * that have no DMARC record yet.
 */

export type DmarcPresence = "present" | "absent" | "unknown";

export interface GroupOptions {
	/** The published template has a separate `dmarc` group. */
	dmarcGroup: boolean;
	/** Result of `lookupDmarc()` for the sending domain. */
	dmarc: DmarcPresence;
	/**
	 * The configured policy is the one the template publishes. The signed apply URL can't carry a
	 * policy, so a different configured policy must not be applied silently.
	 */
	policyMatchesTemplate?: boolean;
}

/** The policy the published `dmarc` group writes. */
export const TEMPLATE_DMARC_POLICY = "reject";
/** Same deadline as the other TXT checks, so a slow resolver can't stall the apply request. */
export const DMARC_LOOKUP_TIMEOUT_MS = 5_000;
const DMARC_VERSION_TAG = /^v[ \t]*=[ \t]*DMARC1[ \t]*(;|$)/i;

export function determineGroupIds(
	domain: {
		isSendingEmailEnabled?: boolean | null;
		isReceivingEmailEnabled?: boolean | null;
		isClickTrackingEnabled?: boolean | null;
		isOpenTrackingEnabled?: boolean | null;
	},
	options: GroupOptions = { dmarcGroup: false, dmarc: "unknown" },
): string[] {
	const groups = ["verification"]; // DKIM always included

	if (domain.isSendingEmailEnabled !== false) {
		groups.push("sending"); // SPF (+ DMARC on templates without a dmarc group)
		// Only "absent" adds it: a failed lookup must not risk a second _dmarc record.
		const policyMatches = options.policyMatchesTemplate ?? true;
		if (options.dmarcGroup && options.dmarc === "absent" && policyMatches) {
			groups.push("dmarc");
		}
	}
	if (domain.isReceivingEmailEnabled !== false) {
		groups.push("receiving"); // MX
	}
	if (domain.isClickTrackingEnabled || domain.isOpenTrackingEnabled) {
		groups.push("tracking"); // CNAME
	}

	return groups;
}

/**
 * Looks up `_dmarc.<domain>` and reports whether a `v=DMARC1` record is already published.
 * Pass an authoritative lookup: a public resolver can still serve a cached "not found" after
 * the customer has published DMARC. Only a definite "no such record" counts as absent; a
 * timeout or any other failure is "unknown".
 */
export async function lookupDmarc(
	domain: string,
	resolveTxt: TxtLookup,
	timeoutMs = DMARC_LOOKUP_TIMEOUT_MS,
	resolveCname?: CnameLookup,
): Promise<DmarcPresence> {
	const name = `_dmarc.${domain}`;
	try {
		const records = await withDeadline(resolveTxt(name), timeoutMs);
		if (
			records.some((chunks) => DMARC_VERSION_TAG.test(chunks.join("").trim()))
		) {
			return "present";
		}
	} catch (error) {
		if (classifyDnsError(error) !== "mismatch") return "unknown";
	}
	// An authoritative server doesn't follow a CNAME, so `_dmarc` delegated to a DMARC
	// provider looks like "no TXT". Only call it absent when there is no alias either.
	if (!resolveCname) return "unknown";
	try {
		const targets = await withDeadline(resolveCname(name), timeoutMs);
		return targets.length > 0 ? "present" : "absent";
	} catch (error) {
		return classifyDnsError(error) === "mismatch" ? "absent" : "unknown";
	}
}

function withDeadline<T>(promise: Promise<T>, ms: number): Promise<T> {
	let timer: ReturnType<typeof setTimeout> | undefined;
	const deadline = new Promise<never>((_, reject) => {
		timer = setTimeout(
			() =>
				reject(
					Object.assign(new Error("DNS query timeout"), { code: "ETIMEOUT" }),
				),
			ms,
		);
	});
	return Promise.race([promise, deadline]).finally(() => clearTimeout(timer));
}

const DMARC_POLICIES = new Set(["none", "quarantine", "reject"]);

/** `DMARC_DEFAULT_POLICY` (none | quarantine | reject); anything else keeps `reject`. */
export function parseDmarcPolicy(value: string | undefined): string {
	const policy = (value ?? "").trim().toLowerCase();
	return DMARC_POLICIES.has(policy) ? policy : "reject";
}
