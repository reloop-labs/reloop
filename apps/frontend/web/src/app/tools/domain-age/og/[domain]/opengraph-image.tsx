import { productionSiteUrl } from "@reloop/web/lib/site";
import { ImageResponse } from "next/og";
import {
	calendarIcon,
	clockIcon,
	DomainAgeCard,
	giftIcon,
	loadFonts,
	OgCard,
	refreshIcon,
	size,
} from "../og-card";

export { contentType, size } from "../og-card";
export const alt = "Domain Age Calculator | Reloop";

function normalizeDomain(raw: string | undefined): string | null {
	if (!raw) return null;
	let v = "";
	try {
		v = decodeURIComponent(raw).trim().toLowerCase();
	} catch {
		return null;
	}
	if (!v || v.length > 253) return null;
	v = v.replace(/^https?:\/\//, "").split("/")[0] ?? "";
	v = v.split("?")[0] ?? "";
	v = v.split("#")[0] ?? "";
	v = v.split(":")[0] ?? "";
	v = v.replace(/[^a-z0-9.-]/g, "");
	if (!v.includes(".") || v.length < 3 || v.length > 253) return null;
	return v;
}

function formatShortAge(createdAt: string, now: Date): string {
	const start = new Date(createdAt);
	let years = now.getUTCFullYear() - start.getUTCFullYear();
	let months = now.getUTCMonth() - start.getUTCMonth();
	let days = now.getUTCDate() - start.getUTCDate();
	if (days < 0) {
		months -= 1;
		const daysInPrevMonth = new Date(
			Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0),
		).getUTCDate();
		days += daysInPrevMonth;
	}
	if (months < 0) {
		years -= 1;
		months += 12;
	}
	if (years < 0) return "0 days";
	if (years > 0) {
		const y = `${years} year${years === 1 ? "" : "s"}`;
		if (months > 0) return `${y}, ${months} month${months === 1 ? "" : "s"}`;
		return y;
	}
	if (months > 0) {
		const m = `${months} month${months === 1 ? "" : "s"}`;
		if (days > 0) return `${m}, ${days} day${days === 1 ? "" : "s"}`;
		return m;
	}
	return `${Math.max(days, 0)} day${days === 1 ? "" : "s"}`;
}

function formatDateOnly(iso: string): string {
	try {
		return new Date(iso).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			timeZone: "UTC",
		});
	} catch {
		return iso;
	}
}

type DomainAgeApiReport = {
	age: { createdAt: string | null; expiresAt: string | null };
};

/** The tools API is the single source of truth (RDAP plus its ccTLD registry catalog); the image renders what it reports. */
async function lookupAge(domain: string): Promise<{
	createdAt: string | null;
	expiresAt: string | null;
	ageLabel: string | null;
}> {
	const unknown = { createdAt: null, expiresAt: null, ageLabel: null };
	try {
		const res = await fetch(`${productionSiteUrl}/api/tools/v1/domain-age`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"User-Agent": "Reloop-Domain-Age-OG/1.0",
			},
			body: JSON.stringify({ domain }),
			next: { revalidate: 86_400 },
			signal: AbortSignal.timeout(8000),
		});
		if (!res.ok) return unknown;
		const report = (await res.json()) as DomainAgeApiReport;
		const createdAt = report.age?.createdAt ?? null;
		return {
			createdAt,
			expiresAt: report.age?.expiresAt ?? null,
			ageLabel: createdAt ? formatShortAge(createdAt, new Date()) : null,
		};
	} catch {
		return unknown;
	}
}

function truncateDomain(domain: string, max = 30): string {
	if (domain.length <= max) return domain;
	return `${domain.slice(0, max - 1)}…`;
}

export default async function OpenGraphImage({
	params,
}: {
	params: Promise<{ domain: string }>;
}) {
	const { domain: rawDomain } = await params;
	const domain = normalizeDomain(rawDomain);
	let fonts: Awaited<ReturnType<typeof loadFonts>> = [];
	try {
		fonts = await loadFonts();
	} catch {
		fonts = [];
	}

	if (!domain) {
		return new ImageResponse(<DomainAgeCard />, { ...size, fonts });
	}

	const lookup = await lookupAge(domain);
	const displayDomain = truncateDomain(domain);
	const titleLines = lookup.ageLabel
		? [displayDomain, `is ${lookup.ageLabel} old`]
		: ["How old is", `${displayDomain}?`];
	const longestLine = Math.max(...titleLines.map((l) => l.length));
	const titleFontSize = longestLine > 30 ? 36 : longestLine > 22 ? 44 : 56;

	return new ImageResponse(
		<OgCard
			titleLines={titleLines}
			titleFontSize={titleFontSize}
			subtitle="Registration date, exact age & expiry date. Free."
			features={[
				{
					title: lookup.createdAt
						? `Created ${formatDateOnly(lookup.createdAt)}`
						: "Registration date unavailable",
					icon: calendarIcon,
				},
				{
					title: lookup.expiresAt
						? `Expires ${formatDateOnly(lookup.expiresAt)}`
						: "Expiry date unavailable",
					icon: clockIcon,
				},
				{ title: "Official RDAP registry data", icon: refreshIcon },
				{ title: "100% Free & No sign-up", icon: giftIcon },
			]}
		/>,
		{ ...size, fonts },
	);
}
