import { ImageResponse } from "next/og";

/**
 * Feature-page OG card (same layout as /features/smtp) shared by the MCP and
 * CLI pages: brand + title on the left, terminal block of commands on the right.
 */

export const aiToolsOgSize = { width: 1200, height: 630 };
export const aiToolsOgContentType = "image/png";

const PRIMARY = "#d97757";

/** Reloop mark as [x, y, width, rotated 90° about (x, y), white | grey] rects. */
const MARK_RECTS: Array<[number, number, number, boolean, "w" | "g"]> = [
	[55, 51, 83, false, "w"],
	[55, 59, 75, true, "w"],
	[146, 59, 46, true, "w"],
	[154, 69, 44, true, "w"],
	[138, 59, 46, true, "g"],
	[130, 59, 46, true, "g"],
	[90, 105, 29, true, "g"],
	[82, 105, 29, true, "g"],
	[138, 105, 8, true, "w"],
	[146, 105, 8, true, "w"],
	[146, 134, 8, true, "w"],
	[130, 105, 8, true, "g"],
	[122, 105, 8, true, "g"],
	[98, 77, 10, true, "w"],
	[90, 77, 10, true, "g"],
	[82, 77, 10, true, "g"],
	[146, 113, 21, true, "w"],
	[154, 122, 20, true, "w"],
	[138, 113, 21, true, "g"],
	[130, 113, 21, true, "g"],
	[98, 113, 21, true, "w"],
	[55, 134, 83, false, "w"],
	[63, 142, 83, false, "w"],
];

function ReloopMark() {
	return (
		<svg
			width="50"
			height="50"
			viewBox="0 0 200 200"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			{MARK_RECTS.map(([x, y, width, rotate, tone]) => (
				<rect
					key={`${x}-${y}-${width}`}
					x={x}
					y={y}
					width={width}
					height="8"
					transform={rotate ? `rotate(90 ${x} ${y})` : undefined}
					fill={tone === "w" ? "#ffffff" : "#878787"}
				/>
			))}
		</svg>
	);
}

export type AiToolsOgLine = { command: string; detail: string };

export function renderAiToolsOgImage({
	title,
	description,
	section = "Features",
	lines,
}: {
	title: string;
	description: string;
	section?: string;
	lines: AiToolsOgLine[];
}) {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "row",
				justifyContent: "space-between",
				backgroundColor: "#000000",
				padding: "48px",
				fontFamily: "sans-serif",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* Left Column */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					width: "560px",
					height: "100%",
				}}
			>
				{/* Logo / Header */}
				<div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
					<ReloopMark />
					<span
						style={{
							fontSize: "24px",
							fontWeight: 600,
							color: "#ffffff",
							letterSpacing: "-0.5px",
							marginLeft: "8px",
						}}
					>
						Reloop
					</span>
					<span
						style={{
							fontSize: "24px",
							fontWeight: 400,
							color: "rgba(255, 255, 255, 0.4)",
							letterSpacing: "-0.5px",
							marginLeft: "8px",
						}}
					>
						/
					</span>
					<span
						style={{
							fontSize: "24px",
							fontWeight: 500,
							color: "rgba(255, 255, 255, 0.6)",
							letterSpacing: "-0.5px",
							marginLeft: "8px",
						}}
					>
						{section}
					</span>
				</div>

				{/* Title and description */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						width: "100%",
						marginTop: "24px",
					}}
				>
					<div
						style={{
							display: "flex",
							fontSize: title.length > 18 ? "48px" : "56px",
							fontWeight: 700,
							color: "#ffffff",
							letterSpacing: "-1.5px",
							lineHeight: "1.1",
						}}
					>
						{title}
					</div>
					<div
						style={{
							display: "flex",
							fontSize: "20px",
							fontWeight: 400,
							color: "rgba(255, 255, 255, 0.55)",
							lineHeight: "1.5",
							marginTop: "16px",
						}}
					>
						{description}
					</div>
				</div>

				{/* Footer */}
				<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
					<div style={{ fontSize: "16px", color: "rgba(255, 255, 255, 0.3)" }}>
						Modern email infrastructure for developers
					</div>
					<div style={{ fontSize: "16px", fontWeight: 600, color: PRIMARY }}>
						reloop.sh
					</div>
				</div>
			</div>

			{/* Terminal Block */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					width: "480px",
					height: "100%",
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						backgroundColor: "#050505",
						border: "1px solid rgba(255, 255, 255, 0.12)",
						borderRadius: "16px",
						padding: "24px",
						fontFamily: "monospace",
						width: "100%",
						height: "380px",
						boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
					}}
				>
					<div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
						{["#ff5f56", "#ffbd2e", "#27c93f"].map((color) => (
							<div
								key={color}
								style={{
									width: "12px",
									height: "12px",
									borderRadius: "50%",
									backgroundColor: color,
								}}
							/>
						))}
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "8px",
							fontSize: "14px",
							lineHeight: "1.6",
						}}
					>
						{lines.map((line) => (
							<div
								key={line.command}
								style={{
									display: "flex",
									flexDirection: "column",
									marginBottom: "8px",
								}}
							>
								<span style={{ color: PRIMARY, fontWeight: 600 }}>
									$ {line.command}
								</span>
								<span
									style={{
										color: "rgba(255, 255, 255, 0.6)",
										paddingLeft: "16px",
										marginTop: "4px",
									}}
								>
									{line.detail}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>,
		{ ...aiToolsOgSize },
	);
}
