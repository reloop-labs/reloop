import { classifyDnsError, type TxtLookup } from "@reloop/dns/verify-records";

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
}

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
		if (options.dmarcGroup && options.dmarc === "absent") {
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

/** Looks up `_dmarc.<domain>` and reports whether a `v=DMARC1` record is already published. */
export async function lookupDmarc(
	domain: string,
	resolveTxt: TxtLookup,
): Promise<DmarcPresence> {
	try {
		const records = await resolveTxt(`_dmarc.${domain}`);
		return records.some((chunks) =>
			chunks.join("").trim().toLowerCase().startsWith("v=dmarc1"),
		)
			? "present"
			: "absent";
	} catch (error) {
		return classifyDnsError(error) === "mismatch" ? "absent" : "unknown";
	}
}

const DMARC_POLICIES = new Set(["none", "quarantine", "reject"]);

/** `DMARC_DEFAULT_POLICY` (none | quarantine | reject); anything else keeps `reject`. */
export function parseDmarcPolicy(value: string | undefined): string {
	const policy = (value ?? "").trim().toLowerCase();
	return DMARC_POLICIES.has(policy) ? policy : "reject";
}
