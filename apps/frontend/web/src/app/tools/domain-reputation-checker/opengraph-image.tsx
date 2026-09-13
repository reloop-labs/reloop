import { ImageResponse } from "next/og";

export const alt = "Domain Reputation Checker | Reloop";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
	const primaryColor = "#10b981"; // Emerald

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
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
					<span
						style={{
							display: "flex",
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
							display: "flex",
							fontSize: "52px",
							fontWeight: 700,
							color: "#ffffff",
							lineHeight: 1.1,
							letterSpacing: "-0.03em",
						}}
					>
						Domain Reputation Checker
					</div>
					<div
						style={{
							display: "flex",
							fontSize: "20px",
							color: "#ffffff",
							opacity: 0.7,
							lineHeight: 1.5,
						}}
					>
						Check overall sender reputation, 0–100 health score, SPF/DKIM/DMARC auth, live DNSBL status, domain age, and DNS health.
					</div>
				</div>

				<div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
					<div
						style={{
							display: "flex",
							padding: "6px 14px",
							borderRadius: "999px",
							backgroundColor: "rgba(16, 185, 129, 0.15)",
							color: primaryColor,
							fontSize: "13px",
							fontFamily: "monospace",
							border: "1px solid rgba(16, 185, 129, 0.3)",
						}}
					>
						Score 0–100 · Grade A+ to F
					</div>
					<div
						style={{
							display: "flex",
							padding: "6px 14px",
							borderRadius: "999px",
							backgroundColor: "rgba(255, 255, 255, 0.05)",
							color: "#ffffff",
							opacity: 0.7,
							fontSize: "13px",
							fontFamily: "monospace",
						}}
					>
						Auth · DNSBL · Age · DNS
					</div>
				</div>
			</div>

			<div
				style={{
					width: "360px",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					gap: "12px",
					borderRadius: "20px",
					border: "1px solid rgba(255, 255, 255, 0.1)",
					backgroundColor: "rgba(255, 255, 255, 0.03)",
					padding: "32px",
				}}
			>
				{[
					{ label: "Authentication (35%)", val: "SPF / DKIM / DMARC", color: "#10b981" },
					{ label: "Blocklists (30%)", val: "Spamhaus · URIBL · SURBL", color: "#0ea5e9" },
					{ label: "Domain Age (20%)", val: "RDAP Maturity Analysis", color: "#8b5cf6" },
					{ label: "DNS Health (15%)", val: "MX · NS · A · TLS", color: "#f59e0b" },
				].map((row) => (
					<div
						key={row.label}
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "4px",
							padding: "10px 14px",
							borderRadius: "12px",
							backgroundColor: "rgba(255, 255, 255, 0.04)",
							border: "1px solid rgba(255, 255, 255, 0.08)",
						}}
					>
						<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
							<div
								style={{
									display: "flex",
									width: "8px",
									height: "8px",
									borderRadius: "50%",
									backgroundColor: row.color,
								}}
							/>
							<span
								style={{
									fontSize: "14px",
									fontWeight: 600,
									color: "#ffffff",
								}}
							>
								{row.label}
							</span>
						</div>
						<span
							style={{
								fontSize: "11px",
								color: "#ffffff",
								opacity: 0.5,
								fontFamily: "monospace",
								paddingLeft: "16px",
							}}
						>
							{row.val}
						</span>
					</div>
				))}
			</div>
		</div>,
		{
			...size,
		},
	);
}
