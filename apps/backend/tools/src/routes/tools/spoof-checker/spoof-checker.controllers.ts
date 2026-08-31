import { checkDomainSpoofability } from "./spoof-checker.service";

export async function spoofCheckerController({
	body,
	set,
}: {
	body: { domain?: string };
	set: { status?: number };
}) {
	const rawDomain = (body.domain || "").trim();

	if (!rawDomain) {
		set.status = 400;
		return {
			message: "Domain parameter is required.",
			why: "Checking spoofability requires a valid domain name (e.g. stripe.com).",
			fix: "Provide a root domain or URL to analyze.",
			link: "https://reloop.sh/tools/spoof-checker",
		};
	}

	try {
		return await checkDomainSpoofability(rawDomain);
	} catch (error) {
		set.status = 400;
		return {
			message: (error as Error).message || "Failed to query domain spoofing records.",
			why: "Domain could not be resolved or input is invalid.",
			fix: "Check that the domain is spelled correctly without special characters.",
			link: "https://reloop.sh/tools/spoof-checker",
		};
	}
}

export async function spoofCheckerGetController({
	query,
	set,
}: {
	query: { domain?: string };
	set: { status?: number };
}) {
	return spoofCheckerController({
		body: { domain: query.domain },
		set,
	});
}
