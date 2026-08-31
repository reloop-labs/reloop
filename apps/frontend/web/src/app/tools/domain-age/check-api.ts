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
		throw new Error(
			err?.message || `Domain age check failed with status ${res.status}.`,
		);
	}

	return res.json();
}
