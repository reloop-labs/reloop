import { checkDomainAge } from "./domain-age.service";

export async function domainAgeController({
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
			why: "Domain age and warmup checks require a registered domain name (e.g. stripe.com).",
			fix: "Enter a domain or URL to inspect.",
			link: "https://reloop.sh/tools/domain-age",
		};
	}

	try {
		return await checkDomainAge(rawDomain);
	} catch (error) {
		set.status = 400;
		return {
			message: (error as Error).message || "Failed to inspect domain age.",
			why: "The domain name is invalid or could not be parsed.",
			fix: "Provide a valid domain name (e.g. acme.com) without IP addresses or invalid characters.",
			link: "https://reloop.sh/tools/domain-age",
		};
	}
}

export async function domainAgeGetController({
	query,
	set,
}: {
	query: { domain?: string };
	set: { status?: number };
}) {
	return domainAgeController({
		body: { domain: query.domain },
		set,
	});
}
