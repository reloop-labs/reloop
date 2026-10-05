export interface DomainAgeReport {
	domain: string;
	registrableDomain: string;
	resolvedAt: string;
	responseTimeMs: number;
	verdict:
		| "too_new"
		| "cold"
		| "warming"
		| "established"
		| "mature"
		| "unknown_age"
		| "not_registered"
		| "held";
	headline: string;
	summary: string;
	disclaimer: string;
	age: {
		createdAt: string | null;
		ageDays: number | null;
		expiresAt: string | null;
		source: "rdap" | "none";
	};
	registry: {
		registrar: string | null;
		status: string[];
		tld: string | null;
	};
	nameservers: {
		hosts: string[];
		provider: string | null;
		kind: "production" | "registrar_default" | "parking" | "unknown";
	};
	emailSetup: {
		spf: boolean;
		dmarc: boolean;
		dmarcPolicy: string | null;
		mx: boolean;
	};
	nextStep: {
		title: string;
		body: string;
		href: string;
	};
	warnings: string[];
}

export async function runDomainAge(
	domain: string,
	signal?: AbortSignal,
): Promise<DomainAgeReport> {
	const res = await fetch("/api/tools/v1/domain-age", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ domain: domain.trim() }),
		signal,
	});

	if (!res.ok) {
		const err = await res.json().catch(() => null);
		if (err?.message) throw new Error(err.message);
		// The backend never answers 404 for this route (unknown domains return
		// 200 with verdict "not_registered"), so a 404 means the tool API isn't
		// reachable here — e.g. plain localhost:3000 without the backend stack.
		// Use the full local stack (https://local.reloop.sh) instead.
		if (res.status === 404) {
			throw new Error(
				"Domain age service isn't reachable from this page. Run the full local stack and use https://local.reloop.sh/tools/domain-age instead of plain localhost.",
			);
		}
		throw new Error(`Domain age check failed with status ${res.status}.`);
	}

	return res.json();
}
