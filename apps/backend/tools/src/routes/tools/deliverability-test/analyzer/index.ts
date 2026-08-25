import type {
	CategoryResult,
	DeliverabilityReport,
} from "../deliverability-test.types";
import { checkBlacklists } from "./check-blacklists";
import { checkBody } from "./check-body";
import { checkDkim } from "./check-dkim";
import { checkDmarc } from "./check-dmarc";
import { checkLinks } from "./check-links";
import { checkRdns } from "./check-rdns";
import { checkRspamdAndContent } from "./check-rspamd";
import { checkSpf } from "./check-spf";
import { parseMime } from "./parse-mime";
import { computeDeliverabilityScore } from "./score";

export async function analyzeInboundEmail(
	rawMime: string,
): Promise<DeliverabilityReport> {
	// 1. Parse MIME structure and headers
	const email = await parseMime(rawMime);

	// 2. Authentication checks in parallel
	const [spfResult, dkimResult, rdnsResult] = await Promise.all([
		checkSpf(email),
		checkDkim(email),
		checkRdns(email),
	]);

	// 3. DMARC check (requires SPF and DKIM results)
	const dmarcResult = await checkDmarc(email, spfResult, dkimResult);

	// Aggregate Signature category
	const signatureItems = [
		spfResult.item,
		dkimResult.item,
		dmarcResult.item,
		rdnsResult.rdnsItem,
		rdnsResult.heloItem,
	];

	const signatureMark = signatureItems.reduce(
		(sum, item) => sum + (item.mark || 0),
		0,
	);
	const signatureStatus = signatureItems.some((i) => i.status === "fail")
		? "fail"
		: signatureItems.some((i) => i.status === "warn")
			? "warn"
			: "pass";

	const signatureCategory: CategoryResult = {
		id: "signature",
		title: "Authentication & Identity",
		mark: Math.max(-6.0, Number.parseFloat(signatureMark.toFixed(1))),
		status: signatureStatus,
		items: signatureItems,
	};

	// 4. Blacklists, Content/Rspamd, Body, Links in parallel
	const [blacklistsRes, contentRes, bodyRes, linksRes] = await Promise.all([
		checkBlacklists(email),
		checkRspamdAndContent(email),
		Promise.resolve(checkBody(email)),
		checkLinks(email),
	]);

	// 5. Aggregate final 0-10 score and generate report
	const report = computeDeliverabilityScore({
		email,
		signatureCategory,
		blacklistsCategory: blacklistsRes.category,
		contentCategory: contentRes.category,
		bodyCategory: bodyRes.category,
		linksCategory: linksRes.category,
	});

	return report;
}

export * from "./check-blacklists";
export * from "./check-body";
export * from "./check-dkim";
export * from "./check-dmarc";
export * from "./check-links";
export * from "./check-rdns";
export * from "./check-rspamd";
export * from "./check-spf";
export * from "./parse-mime";
export * from "./score";
