import { checkDomainAuth } from "./auth-checker.service";

export async function authCheckerController({
	body,
	set,
}: {
	body: { domain?: string; selector?: string };
	set: { status?: number };
}) {
	const rawDomain = (body.domain || "").trim();

	if (!rawDomain) {
		set.status = 400;
		return {
			message: "Domain parameter is required.",
			why: "Email authentication records require a sending domain name (e.g. stripe.com).",
			fix: "Provide a valid root or sending domain name.",
			link: "https://reloop.sh/tools/auth-checker",
		};
	}

	try {
		return await checkDomainAuth(rawDomain, body.selector);
	} catch (error) {
		set.status = 400;
		return {
			message: (error as Error).message || "Failed to query domain authentication records.",
			why: "Domain could not be resolved or input is invalid.",
			fix: "Check that the domain is spelled correctly without extra protocols or paths.",
			link: "https://reloop.sh/tools/auth-checker",
		};
	}
}

export async function authCheckerGetController({
	query,
	set,
}: {
	query: { domain?: string; selector?: string };
	set: { status?: number };
}) {
	return authCheckerController({
		body: {
			domain: query.domain,
			selector: query.selector,
		},
		set,
	});
}
