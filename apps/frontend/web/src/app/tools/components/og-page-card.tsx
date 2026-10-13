import type { ReactNode } from "react";
import { Logo } from "../domain-age/og/og-card";

/**
 * Share-image layout that looks like a tool page: copy and a filled-in
 * search box on the left, the tool's result on the right. Rendered by
 * next/og (Satori), so every element with children is display:flex.
 */

export const INK = "#171717";
export const MUTED = "#5c5c5c";
export const SOFT = "#a3a3a3";
export const RULE = "#ebebeb";
export const WEAK = "#f7f7f7";
export const SUCCESS = "#10b981";

const BIMI_LOGO_RECTS: [string, string, string, string, string][] = [
	["49.82", "41", "91.53", "9.54", "#2C2C2C"],
	["41", "50.54", "8.82", "89.39", "#2C2C2C"],
	["141.35", "50.54", "8.82", "54.83", "#2C2C2C"],
	["150.18", "62.45", "8.82", "52.44", "#D2D2D2"],
	["132.53", "50.54", "8.82", "54.83", "#4D4D4D"],
	["123.71", "50.54", "8.82", "54.83", "#878787"],
	["79.6", "105.36", "8.82", "34.57", "#4D4D4D"],
	["70.78", "105.36", "8.82", "34.57", "#878787"],
	["132.53", "105.36", "8.82", "9.54", "#2C2C2C"],
	["141.35", "105.36", "8.82", "9.54", "#D2D2D2"],
	["141.35", "139.93", "8.82", "9.54", "#D2D2D2"],
	["123.71", "105.36", "8.82", "9.54", "#4D4D4D"],
	["114.89", "105.36", "8.82", "9.54", "#878787"],
	["88.42", "71.99", "8.82", "11.92", "#2C2C2C"],
	["79.6", "71.99", "8.82", "11.92", "#4D4D4D"],
	["70.78", "71.99", "8.82", "11.92", "#878787"],
	["141.35", "114.9", "8.82", "25.03", "#2C2C2C"],
	["150.18", "125.63", "8.82", "23.84", "#D2D2D2"],
	["132.53", "114.9", "8.82", "25.03", "#4D4D4D"],
	["123.71", "114.9", "8.82", "25.03", "#878787"],
	["88.42", "114.9", "8.82", "25.03", "#2C2C2C"],
	["49.82", "139.93", "91.53", "9.54", "#2C2C2C"],
	["58.64", "149.46", "91.53", "9.54", "#D2D2D2"],
];

/** The Reloop BIMI logo (public/bimi-logo.svg) as inline SVG. */
export function ReloopMark({ size }: { size: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 200 200">
			<rect width="200" height="200" fill="#ffffff" />
			{BIMI_LOGO_RECTS.map(([x, y, w, h, fill]) => (
				<rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} fill={fill} />
			))}
		</svg>
	);
}

export function Bar({
	width,
	height = 8,
	color = RULE,
}: {
	width: number | string;
	height?: number;
	color?: string;
}) {
	return (
		<div
			style={{
				display: "flex",
				width,
				height,
				borderRadius: height,
				backgroundColor: color,
			}}
		/>
	);
}

/** The result panel shell from the tool pages: soft grey card, white inset. */
export function Panel({ children }: { children: ReactNode }) {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
				backgroundColor: WEAK,
				border: `1px solid ${RULE}`,
				borderRadius: 18,
				padding: 12,
				gap: 12,
			}}
		>
			{children}
		</div>
	);
}

export function Inset({
	children,
	padding = 18,
}: {
	children: ReactNode;
	padding?: number;
}) {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				backgroundColor: "#ffffff",
				border: `1px solid ${RULE}`,
				borderRadius: 12,
				padding,
				gap: 12,
			}}
		>
			{children}
		</div>
	);
}

export function PageOgCard({
	titleLines,
	subtitle,
	query,
	children,
	titleSize = 60,
}: {
	titleLines: string[];
	titleSize?: number;
	subtitle: string;
	query: string;
	children: ReactNode;
}) {
	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				backgroundColor: "#ffffff",
				color: INK,
				fontFamily: "Inter, sans-serif",
				position: "relative",
			}}
		>
			{/* the page's hairline rails */}
			<div
				style={{
					position: "absolute",
					top: 0,
					bottom: 0,
					left: 40,
					right: 40,
					borderLeft: `1px solid ${RULE}`,
					borderRight: `1px solid ${RULE}`,
				}}
			/>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					width: "100%",
					padding: "0 72px",
					gap: 48,
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						width: 440,
						flexShrink: 0,
					}}
				>
					<Logo />
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							marginTop: 22,
						}}
					>
						{titleLines.map((line) => (
							<div
								key={line}
								style={{
									display: "flex",
									fontSize: titleSize,
									fontWeight: 700,
									letterSpacing: "-2px",
									lineHeight: 1.04,
									whiteSpace: "nowrap",
								}}
							>
								{line}
							</div>
						))}
					</div>
					<div
						style={{
							display: "flex",
							marginTop: 18,
							fontSize: 21,
							color: MUTED,
							lineHeight: 1.45,
						}}
					>
						{subtitle}
					</div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							marginTop: 28,
							height: 56,
							padding: "0 18px 0 20px",
							border: `1px solid ${RULE}`,
							borderRadius: 16,
							fontSize: 21,
							fontWeight: 500,
						}}
					>
						<span style={{ display: "flex" }}>{query}</span>
						<svg width="16" height="16" viewBox="0 0 24 24">
							<path
								d="M18 6 6 18M6 6l12 12"
								stroke={MUTED}
								strokeWidth="2.5"
								strokeLinecap="round"
							/>
						</svg>
					</div>
				</div>
				<div style={{ display: "flex", flex: 1, minWidth: 0 }}>{children}</div>
			</div>
		</div>
	);
}

const CHIP_TONES = {
	neutral: { color: MUTED, background: WEAK, border: RULE },
	success: {
		color: "#059669",
		background: "rgba(16,185,129,0.08)",
		border: "rgba(16,185,129,0.25)",
	},
	warn: {
		color: "#d97706",
		background: "rgba(245,158,11,0.08)",
		border: "rgba(245,158,11,0.25)",
	},
} as const;

export function Chip({
	children,
	tone = "neutral",
}: {
	children: ReactNode;
	tone?: keyof typeof CHIP_TONES;
}) {
	const t = CHIP_TONES[tone];
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: 5,
				padding: "3px 8px",
				borderRadius: 7,
				fontSize: 12,
				fontWeight: 500,
				color: t.color,
				backgroundColor: t.background,
				border: `1px solid ${t.border}`,
				whiteSpace: "nowrap",
			}}
		>
			{children}
		</div>
	);
}

export function CheckCircle({
	size,
	color = SUCCESS,
}: {
	size: number;
	color?: string;
}) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24">
			<circle
				cx="12"
				cy="12"
				r="9"
				fill="none"
				stroke={color}
				strokeWidth="2"
			/>
			<path
				d="m8 12.5 2.6 2.5L16 9.5"
				fill="none"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function ShieldCheck({
	size,
	color = SUCCESS,
}: {
	size: number;
	color?: string;
}) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24">
			<path
				d="M12 3.5 5 6v5.5c0 4.2 2.9 7.4 7 9 4.1-1.6 7-4.8 7-9V6l-7-2.5z"
				fill="none"
				stroke={color}
				strokeWidth="2"
				strokeLinejoin="round"
			/>
			<path
				d="m9 12 2 2 4-4"
				fill="none"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function AlertTriangle({
	size,
	color = "#d97706",
}: {
	size: number;
	color?: string;
}) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24">
			<path
				d="M12 4 3 19.5h18L12 4z"
				fill="none"
				stroke={color}
				strokeWidth="2"
				strokeLinejoin="round"
			/>
			<path d="M12 10v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
			<circle cx="12" cy="16.8" r="1" fill={color} />
		</svg>
	);
}

/** A titled inset, like the "Section" cards in the tool results. */
export function TitledInset({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				backgroundColor: "#ffffff",
				border: `1px solid ${RULE}`,
				borderRadius: 12,
				padding: "12px 16px",
			}}
		>
			<div
				style={{
					display: "flex",
					fontSize: 14,
					fontWeight: 700,
					paddingBottom: 8,
					borderBottom: `1px solid ${RULE}`,
				}}
			>
				{title}
			</div>
			{children}
		</div>
	);
}
