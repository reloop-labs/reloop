import { ImageResponse } from "next/og";

export const alt = "Domain Age Checker | Reloop";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PRIMARY = "#2563eb";

type Verdict =
	| "too_new"
	| "cold"
	| "warming"
	| "established"
	| "mature"
	| "unknown";

const VERDICT_META: Record<
	Verdict,
	{ label: string; color: string; bg: string; border: string }
> = {
	too_new: {
		label: "Too New · 0–7 days",
		color: "#fb7185",
		bg: "rgba(251, 113, 133, 0.12)",
		border: "rgba(251, 113, 133, 0.35)",
	},
	cold: {
		label: "Cold · 8–30 days",
		color: "#fbbf24",
		bg: "rgba(251, 191, 36, 0.12)",
		border: "rgba(251, 191, 36, 0.35)",
	},
	warming: {
		label: "Warming · 31–90 days",
		color: "#60a5fa",
		bg: "rgba(96, 165, 250, 0.12)",
		border: "rgba(96, 165, 250, 0.35)",
	},
	established: {
		label: "Established · 90+ days",
		color: "#34d399",
		bg: "rgba(52, 211, 153, 0.12)",
		border: "rgba(52, 211, 153, 0.35)",
	},
	mature: {
		label: "Mature · 1+ year",
		color: "#34d399",
		bg: "rgba(52, 211, 153, 0.12)",
		border: "rgba(52, 211, 153, 0.35)",
	},
	unknown: {
		label: "Age unavailable",
		color: "#a1a1aa",
		bg: "rgba(161, 161, 170, 0.12)",
		border: "rgba(161, 161, 170, 0.35)",
	},
};

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

function formatPreciseAge(createdAt: string, now: Date): string {
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
	const parts: string[] = [];
	if (years > 0) parts.push(`${years} year${years === 1 ? "" : "s"}`);
	if (months > 0) parts.push(`${months} month${months === 1 ? "" : "s"}`);
	if (days > 0) parts.push(`${days} day${days === 1 ? "" : "s"}`);
	if (parts.length === 0) return "0 days";
	return parts.join(", ");
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

async function fetchJsonWithTimeout(
	url: string,
	ms: number,
): Promise<{ status: number; body: unknown } | null> {
	const controller = new AbortController();
	const t = setTimeout(() => controller.abort(), ms);
	try {
		const res = await fetch(url, {
			headers: {
				Accept: "application/rdap+json, application/json",
				"User-Agent": "Reloop-Domain-Age-OG/1.0",
			},
			signal: controller.signal,
		});
		let body: unknown = null;
		try {
			body = await res.json();
		} catch {
			body = null;
		}
		return { status: res.status, body };
	} catch {
		return null;
	} finally {
		clearTimeout(t);
	}
}

async function lookupAge(domain: string): Promise<{
	createdAt: string | null;
	ageDays: number | null;
	verdict: Verdict;
	ageLabel: string | null;
}> {
	const now = new Date();
	// rdap.org follows the IANA bootstrap to the authoritative registry.
	const result = await fetchJsonWithTimeout(
		`https://rdap.org/domain/${encodeURIComponent(domain)}`,
		4500,
	);
	if (!result || result.status !== 200 || !result.body) {
		return {
			createdAt: null,
			ageDays: null,
			verdict: "unknown",
			ageLabel: null,
		};
	}
	const data = result.body as {
		events?: Array<{ eventAction?: string; eventDate?: string }>;
	};
	let createdAt: string | null = null;
	if (Array.isArray(data.events)) {
		for (const ev of data.events) {
			if (ev.eventAction === "registration" && ev.eventDate) {
				try {
					createdAt = new Date(ev.eventDate).toISOString();
				} catch {
					createdAt = null;
				}
			}
		}
	}
	if (!createdAt) {
		return {
			createdAt: null,
			ageDays: null,
			verdict: "unknown",
			ageLabel: null,
		};
	}
	const ageDays = Math.max(
		0,
		Math.floor((now.getTime() - new Date(createdAt).getTime()) / 86_400_000),
	);
	const verdict: Verdict =
		ageDays <= 7
			? "too_new"
			: ageDays <= 30
				? "cold"
				: ageDays <= 90
					? "warming"
					: ageDays <= 365
						? "established"
						: "mature";
	return {
		createdAt,
		ageDays,
		verdict,
		ageLabel: formatPreciseAge(createdAt, now),
	};
}

async function loadFonts(): Promise<
	Array<{ name: string; data: ArrayBuffer; weight: 500 | 600; style: "normal" }>
> {
	try {
		const [medium, semiBold] = await Promise.all([
			fetch(
				"https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-500-normal.woff",
			).then((r) => r.arrayBuffer()),
			fetch(
				"https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.woff",
			).then((r) => r.arrayBuffer()),
		]);
		return [
			{ name: "Inter", data: medium, weight: 500, style: "normal" },
			{ name: "Inter", data: semiBold, weight: 600, style: "normal" },
		];
	} catch {
		return [];
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
	const fonts = await loadFonts();

	if (!domain) {
		return new ImageResponse(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					backgroundColor: "#000000",
					padding: "56px 64px",
					fontFamily: fonts.length > 0 ? "Inter" : "sans-serif",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
					<span
						style={{
							display: "flex",
							width: "8px",
							height: "8px",
							borderRadius: "50%",
							backgroundColor: PRIMARY,
						}}
					/>
					<span
						style={{
							fontSize: "14px",
							color: "#ffffff",
							opacity: 0.6,
							letterSpacing: "0.15em",
							textTransform: "uppercase",
							fontFamily: "monospace",
						}}
					>
						Reloop Free Tools
					</span>
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
					<div
						style={{
							display: "flex",
							fontSize: "56px",
							fontWeight: 600,
							color: "#ffffff",
							lineHeight: 1.05,
							letterSpacing: "-0.03em",
						}}
					>
						Domain Age Checker
					</div>
					<div
						style={{
							display: "flex",
							fontSize: "21px",
							color: "#ffffff",
							opacity: 0.65,
							lineHeight: 1.5,
						}}
					>
						Registration date, warmup stage &amp; deliverability risk — free.
					</div>
				</div>
				<div
					style={{
						display: "flex",
						fontSize: "15px",
						color: "#ffffff",
						opacity: 0.4,
						fontFamily: "monospace",
					}}
				>
					reloop.sh/tools/domain-age
				</div>
			</div>,
			{ ...size, fonts },
		);
	}

	const lookup = await lookupAge(domain);
	const meta = VERDICT_META[lookup.verdict];
	const displayDomain = truncateDomain(domain);
	const domainFontSize =
		displayDomain.length > 24 ? 52 : displayDomain.length > 18 ? 64 : 76;

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				backgroundColor: "#000000",
				padding: "52px 60px",
				fontFamily: fonts.length > 0 ? "Inter" : "sans-serif",
				position: "relative",
				overflow: "hidden",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
				<span
					style={{
						display: "flex",
						width: "8px",
						height: "8px",
						borderRadius: "50%",
						backgroundColor: PRIMARY,
					}}
				/>
				<span
					style={{
						fontSize: "14px",
						color: "#ffffff",
						opacity: 0.6,
						letterSpacing: "0.15em",
						textTransform: "uppercase",
						fontFamily: "monospace",
					}}
				>
					Reloop · Domain Age Checker
				</span>
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
				<div
					style={{
						display: "flex",
						fontSize: domainFontSize,
						fontWeight: 600,
						color: "#ffffff",
						lineHeight: 1,
						letterSpacing: "-0.03em",
					}}
				>
					{displayDomain}
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
					{lookup.ageLabel ? (
						<span
							style={{
								fontSize: "30px",
								fontWeight: 600,
								color: meta.color,
								letterSpacing: "-0.02em",
							}}
						>
							{lookup.ageLabel} old
						</span>
					) : (
						<span
							style={{
								fontSize: "30px",
								fontWeight: 600,
								color: meta.color,
								letterSpacing: "-0.02em",
							}}
						>
							Check this domain&apos;s age
						</span>
					)}
				</div>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "12px",
						marginTop: "4px",
					}}
				>
					<span
						style={{
							display: "flex",
							padding: "7px 16px",
							borderRadius: "999px",
							backgroundColor: meta.bg,
							border: `1px solid ${meta.border}`,
							color: meta.color,
							fontSize: "14px",
							fontFamily: "monospace",
							fontWeight: 500,
						}}
					>
						{meta.label}
					</span>
					{lookup.createdAt ? (
						<span
							style={{
								fontSize: "14px",
								color: "#ffffff",
								opacity: 0.55,
								fontFamily: "monospace",
							}}
						>
							Registered {formatDateOnly(lookup.createdAt)}
						</span>
					) : null}
				</div>
			</div>

			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<span
					style={{
						fontSize: "15px",
						color: "#ffffff",
						opacity: 0.4,
						fontFamily: "monospace",
					}}
				>
					reloop.sh/tools/domain-age
				</span>
				<span style={{ fontSize: "15px", color: PRIMARY, fontWeight: 600 }}>
					Free · No sign-up
				</span>
			</div>
		</div>,
		{ ...size, fonts },
	);
}
