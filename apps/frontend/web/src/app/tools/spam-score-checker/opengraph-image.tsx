import { ImageResponse } from "next/og";

export const alt = "Email Content & Spam Score Checker | Reloop";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
	const primaryColor = "#ea580c";

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
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					maxWidth: "680px",
					zIndex: 1,
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
					<span
						style={{
							display: "inline-block",
							width: "8px",
							height: "8px",
							borderRadius: "50%",
							backgroundColor: primaryColor,
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
							fontSize: "52px",
							fontWeight: 700,
							color: "#ffffff",
							lineHeight: 1.1,
							letterSpacing: "-0.03em",
						}}
					>
						Email Content & Spam Score Checker
					</div>
					<div
						style={{
							fontSize: "20px",
							color: "#ffffff",
							opacity: 0.7,
							lineHeight: 1.5,
						}}
					>
						Scan email subject lines, copy, and link density in real time to avoid spam filters and reach the inbox.
					</div>
				</div>

				<div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
					<div
						style={{
							padding: "6px 14px",
							borderRadius: "999px",
							backgroundColor: "rgba(234, 88, 12, 0.15)",
							color: primaryColor,
							fontSize: "13px",
							fontFamily: "monospace",
							border: "1px solid rgba(234, 88, 12, 0.3)",
						}}
					>
						Score 0-100 Gauge
					</div>
					<div
						style={{
							padding: "6px 14px",
							borderRadius: "999px",
							backgroundColor: "rgba(255, 255, 255, 0.05)",
							color: "#ffffff",
							opacity: 0.7,
							fontSize: "13px",
							fontFamily: "monospace",
						}}
					>
						SpamAssassin Rules
					</div>
					<div
						style={{
							padding: "6px 14px",
							borderRadius: "999px",
							backgroundColor: "rgba(255, 255, 255, 0.05)",
							color: "#ffffff",
							opacity: 0.7,
							fontSize: "13px",
							fontFamily: "monospace",
						}}
					>
						Link Safety
					</div>
				</div>
			</div>

			{/* Visual Card on Right */}
			<div
				style={{
					width: "360px",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					borderRadius: "20px",
					border: "1px solid rgba(255, 255, 255, 0.1)",
					backgroundColor: "rgba(255, 255, 255, 0.03)",
					padding: "32px",
				}}
			>
				<span
					style={{
						fontSize: "14px",
						color: "#ffffff",
						opacity: 0.5,
						fontFamily: "monospace",
						textTransform: "uppercase",
					}}
				>
					Deliverability Score
				</span>
				<div
					style={{
						fontSize: "96px",
						fontWeight: 800,
						color: "#ffffff",
						lineHeight: 1,
						margin: "16px 0",
					}}
				>
					96
				</div>
				<div
					style={{
						padding: "6px 16px",
						borderRadius: "999px",
						backgroundColor: "rgba(16, 185, 129, 0.15)",
						color: "#10b981",
						fontSize: "14px",
						fontWeight: 600,
						border: "1px solid rgba(16, 185, 129, 0.3)",
					}}
				>
					Grade A+ · Inbox Ready
				</div>
			</div>
		</div>,
	);
}
