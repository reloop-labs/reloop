import { runLookalikeWatch } from "./lookalike-watch.service";

export async function lookalikeWatchController({
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
			why: "Lookalike domain scans require a target domain name (e.g. acme.com).",
			fix: "Provide a root domain or URL to inspect for lookalikes.",
			link: "https://reloop.sh/tools/lookalike-watch",
		};
	}

	try {
		return await runLookalikeWatch(rawDomain);
	} catch (error) {
		set.status = 400;
		return {
			message: (error as Error).message || "Failed to scan lookalike domains.",
			why: "The domain name is invalid or could not be parsed.",
			fix: "Provide a valid domain name (e.g. stripe.com) without IP addresses or invalid characters.",
			link: "https://reloop.sh/tools/lookalike-watch",
		};
	}
}

export async function lookalikeWatchGetController({
	query,
	set,
}: {
	query: { domain?: string };
	set: { status?: number };
}) {
	return lookalikeWatchController({
		body: { domain: query.domain },
		set,
	});
}
