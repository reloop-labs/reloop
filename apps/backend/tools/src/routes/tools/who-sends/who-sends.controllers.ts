import { checkWhoSends } from "./who-sends.service";

export async function whoSendsController({
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
			why: "Identifying authorized senders requires a sending domain name (e.g. stripe.com).",
			fix: "Provide a root domain or URL to inspect.",
			link: "https://reloop.sh/tools/who-sends",
		};
	}

	try {
		return await checkWhoSends(rawDomain);
	} catch (error) {
		set.status = 400;
		return {
			message: (error as Error).message || "Failed to inspect authorized senders.",
			why: "Domain could not be resolved or input is invalid.",
			fix: "Check that the domain is spelled correctly without special characters.",
			link: "https://reloop.sh/tools/who-sends",
		};
	}
}

export async function whoSendsGetController({
	query,
	set,
}: {
	query: { domain?: string };
	set: { status?: number };
}) {
	return whoSendsController({
		body: { domain: query.domain },
		set,
	});
}
