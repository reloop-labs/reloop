export type SetupStepId = "domain" | "send" | "apiKey";

export type SetupDomain = {
	id: string;
	domain: string;
	status: string;
};

export type SetupStep = {
	id: SetupStepId;
	title: string;
	description: string;
	complete: boolean;
	href?: string;
	cta: string;
	/** When true, the CTA is a send action instead of navigation. */
	action?: "send";
	disabled?: boolean;
};

export type SetupProgress = {
	steps: SetupStep[];
	completedCount: number;
	totalCount: number;
	allComplete: boolean;
	activeDomain: SetupDomain | null;
};

const STEP_COPY: Record<SetupStepId, { title: string; description: string }> = {
	domain: {
		title: "Add a domain",
		description: "Verify a domain so you can send as you@yourdomain.",
	},
	send: {
		title: "Send from your domain",
		description: "Send a test email from hello@yourdomain to yourself.",
	},
	apiKey: {
		title: "Create an API key",
		description: "Use it to send from your app or SMTP.",
	},
};

/** Extract the host from `Name <user@host>` or `user@host`. */
export function extractSenderDomain(fromEmail: string): string {
	const angled = fromEmail.match(/<([^<>]+)>/);
	const address = (angled?.[1] ?? fromEmail).trim();
	const host = address.split("@")[1];
	return host?.toLowerCase() ?? "";
}

export function formatOwnDomainFrom(
	orgName: string | null | undefined,
	domain: string,
): string {
	const address = `hello@${domain}`;
	const name = (orgName ?? "").replace(/["<>]/g, "").trim();
	if (!name) return address;
	return `${name} <${address}>`;
}

export function hasSentFromOwnDomain(
	emails: { fromEmail: string }[],
	domains: SetupDomain[],
): boolean {
	if (emails.length === 0 || domains.length === 0) return false;
	const hosts = new Set(domains.map((d) => d.domain.toLowerCase()));
	return emails.some((email) =>
		hosts.has(extractSenderDomain(email.fromEmail)),
	);
}

export function deriveSetupProgress({
	domains,
	apiKeyCount,
	sentFromOwnDomain,
}: {
	domains: SetupDomain[];
	apiKeyCount: number;
	sentFromOwnDomain: boolean;
}): SetupProgress {
	const hasDomain = domains.length > 0;
	const activeDomain = domains.find((d) => d.status === "active") ?? null;
	const pendingDomain =
		domains.find((d) => d.status === "pending" || d.status === "verifying") ??
		null;

	const domainStep: SetupStep = {
		id: "domain",
		...STEP_COPY.domain,
		complete: hasDomain,
		href:
			hasDomain && pendingDomain
				? `/domain/${pendingDomain.id}`
				: "/domain/add",
		cta: hasDomain && pendingDomain ? "Finish DNS" : "Add domain",
	};

	let sendCta = "Send test";
	let sendHref: string | undefined;
	let sendAction: "send" | undefined = "send";
	let sendDisabled = false;

	if (!hasDomain) {
		sendCta = "Add a domain first";
		sendHref = "/domain/add";
		sendAction = undefined;
	} else if (!activeDomain) {
		sendCta = "Verify DNS";
		const fallbackDomainId = pendingDomain?.id ?? domains[0]?.id;
		sendHref = fallbackDomainId ? `/domain/${fallbackDomainId}` : "/domain";
		sendAction = undefined;
	} else {
		sendDisabled = false;
	}

	const sendStep: SetupStep = {
		id: "send",
		...STEP_COPY.send,
		description: activeDomain
			? `Send a test email from hello@${activeDomain.domain} to yourself.`
			: STEP_COPY.send.description,
		complete: sentFromOwnDomain,
		href: sendHref,
		cta: sendCta,
		action: sendAction,
		disabled: sendDisabled,
	};

	const apiKeyStep: SetupStep = {
		id: "apiKey",
		...STEP_COPY.apiKey,
		complete: apiKeyCount > 0,
		href: "/api-keys?modal=create-api-key",
		cta: "Create API key",
	};

	const steps = [domainStep, sendStep, apiKeyStep];
	const completedCount = steps.filter((s) => s.complete).length;

	return {
		steps,
		completedCount,
		totalCount: steps.length,
		allComplete: completedCount === steps.length,
		activeDomain,
	};
}
