import type { GlossaryTermDefinition } from "@reloop/web/lib/landing/types";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const glossaryOgSize = { width: 1200, height: 630 } as const;
export const glossaryOgContentType = "image/png";

/** Page tokens (dark glossary chrome) */
const BG = "#000000";
const BORDER = "rgba(255, 255, 255, 0.10)";
const TEXT = "#ffffff";
const MUTED = "rgba(255, 255, 255, 0.55)";
const FAINT = "rgba(255, 255, 255, 0.40)";
const PRIMARY = "#d97757";

/** Outer padding between canvas edge and the bordered frame */
const FRAME_PAD = 48;

async function loadFonts() {
	const candidates = [
		join(process.cwd(), "public/font/openRunde"),
		join(process.cwd(), "apps/frontend/web/public/font/openRunde"),
	];

	const { access } = await import("node:fs/promises");
	let fontDir: string | null = null;
	for (const dir of candidates) {
		try {
			await access(join(dir, "OpenRunde-Regular.woff"));
			fontDir = dir;
			break;
		} catch {
			// try next
		}
	}
	if (!fontDir) {
		throw new Error(
			"OpenRunde fonts not found (checked public/font/openRunde)",
		);
	}

	const [regular, medium, semibold, bold] = await Promise.all([
		readFile(join(fontDir, "OpenRunde-Regular.woff")),
		readFile(join(fontDir, "OpenRunde-Medium.woff")),
		readFile(join(fontDir, "OpenRunde-Semibold.woff")),
		readFile(join(fontDir, "OpenRunde-Bold.woff")),
	]);

	return [
		{
			name: "OpenRunde",
			data: regular,
			weight: 400 as const,
			style: "normal" as const,
		},
		{
			name: "OpenRunde",
			data: medium,
			weight: 500 as const,
			style: "normal" as const,
		},
		{
			name: "OpenRunde",
			data: semibold,
			weight: 600 as const,
			style: "normal" as const,
		},
		{
			name: "OpenRunde",
			data: bold,
			weight: 700 as const,
			style: "normal" as const,
		},
	];
}

function truncate(text: string, max: number): string {
	const t = text.trim().replace(/\s+/g, " ");
	if (t.length <= max) return t;
	return `${t.slice(0, max - 1).trimEnd()}...`;
}

/** Index OG: centered hero inside a bordered frame. */
export async function createGlossaryIndexOgImage(termCount: number) {
	const fonts = await loadFonts();

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: BG,
				fontFamily: "OpenRunde",
				padding: FRAME_PAD,
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					// X: left · Y: vertical center
					alignItems: "flex-start",
					justifyContent: "center",
					width: "100%",
					height: "100%",
					border: `1px solid ${BORDER}`,
					padding: "48px 56px",
				}}
			>
				<span
					style={{
						fontSize: "13px",
						fontWeight: 600,
						color: MUTED,
						letterSpacing: "0.16em",
						textTransform: "uppercase",
					}}
				>
					Glossary
				</span>
				<span
					style={{
						marginTop: "18px",
						fontFamily: "Georgia, ui-serif, serif",
						fontSize: "56px",
						fontWeight: 400,
						color: TEXT,
						letterSpacing: "-0.05em",
						lineHeight: 1.05,
						textAlign: "left",
					}}
				>
					Email terms, explained.
				</span>
				<span
					style={{
						marginTop: "16px",
						fontSize: "18px",
						fontWeight: 400,
						color: "rgba(255, 255, 255, 0.50)",
						lineHeight: 1.5,
						textAlign: "left",
						maxWidth: "720px",
					}}
				>
					Short definitions for the words you run into when you set up sending,
					fix deliverability, or dig through docs.
				</span>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "flex-start",
						gap: "20px",
						marginTop: "36px",
					}}
				>
					<span style={{ fontSize: "14px", color: FAINT }}>
						{termCount} terms
					</span>
					<span style={{ fontSize: "14px", color: "rgba(255,255,255,0.2)" }}>
						·
					</span>
					<span style={{ fontSize: "14px", fontWeight: 600, color: PRIMARY }}>
						reloop.sh/glossary
					</span>
				</div>
			</div>
		</div>,
		{ ...glossaryOgSize, fonts },
	);
}

/** Term OG: definition content centered inside a full bordered frame. */
export async function createGlossaryTermOgImage(term: GlossaryTermDefinition) {
	const fonts = await loadFonts();
	const initial = term.title.trim().charAt(0).toUpperCase() || "#";
	const description = truncate(term.description, 160);
	const detail = truncate(
		term.body.split(/\n\n+/)[0] ?? term.description,
		200,
	);
	const titleSize =
		term.title.length > 24 ? 44 : term.title.length > 16 ? 52 : 60;

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: BG,
				fontFamily: "OpenRunde",
				padding: FRAME_PAD,
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					// X: left · Y: vertical center
					alignItems: "flex-start",
					justifyContent: "center",
					width: "100%",
					height: "100%",
					border: `1px solid ${BORDER}`,
					padding: "40px 56px",
				}}
			>
				{/* Breadcrumb */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "flex-start",
						gap: "10px",
					}}
				>
					<span style={{ fontSize: "14px", color: MUTED }}>Glossary</span>
					<span
						style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.25)" }}
					>
						/
					</span>
					<span style={{ fontSize: "14px", color: TEXT, fontWeight: 500 }}>
						{term.title}
					</span>
				</div>

				{/* Letter + definition block */}
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "flex-start",
						gap: "32px",
						marginTop: "28px",
						maxWidth: "900px",
					}}
				>
					<span
						style={{
							fontSize: "120px",
							fontWeight: 400,
							lineHeight: 0.9,
							letterSpacing: "-0.04em",
							color: "rgba(255, 255, 255, 0.18)",
						}}
					>
						{initial}
					</span>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "flex-start",
							maxWidth: "680px",
						}}
					>
						<span
							style={{
								fontSize: "12px",
								fontWeight: 600,
								color: MUTED,
								letterSpacing: "0.16em",
								textTransform: "uppercase",
							}}
						>
							Definition
						</span>
						<span
							style={{
								marginTop: "10px",
								fontFamily: "Georgia, ui-serif, serif",
								fontSize: titleSize,
								fontWeight: 400,
								color: TEXT,
								letterSpacing: "-0.05em",
								lineHeight: 1.05,
							}}
						>
							{term.title}
						</span>
						<span
							style={{
								marginTop: "14px",
								fontSize: "18px",
								fontWeight: 400,
								color: MUTED,
								lineHeight: 1.5,
							}}
						>
							{description}
						</span>
					</div>
				</div>

				{/* In detail */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "flex-start",
						marginTop: "32px",
						paddingTop: "28px",
						borderTop: `1px solid ${BORDER}`,
						width: "100%",
						maxWidth: "820px",
					}}
				>
					<span
						style={{
							fontSize: "12px",
							fontWeight: 600,
							color: MUTED,
							letterSpacing: "0.16em",
							textTransform: "uppercase",
						}}
					>
						In detail
					</span>
					<span
						style={{
							marginTop: "12px",
							fontSize: "16px",
							fontWeight: 400,
							color: "rgba(255, 255, 255, 0.75)",
							lineHeight: 1.65,
							textAlign: "left",
							maxWidth: "760px",
						}}
					>
						{detail}
					</span>
				</div>

				{/* Footer URL */}
				<span
					style={{
						marginTop: "28px",
						fontSize: "14px",
						fontWeight: 600,
						color: PRIMARY,
					}}
				>
					{`reloop.sh/glossary/${term.slug}`}
				</span>
			</div>
		</div>,
		{ ...glossaryOgSize, fonts },
	);
}
