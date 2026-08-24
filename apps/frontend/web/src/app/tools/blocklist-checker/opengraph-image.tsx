import { ImageResponse } from "next/og";
import {
	domainBlocklistCount,
	ipBlocklistCount,
	publicBlocklistCount,
} from "./content";

export const alt = "IP & Domain DNS Blocklist Checker | Reloop";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
	const primaryColor = "#0ea5e9";

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
						IP & Domain DNS Blocklist Checker
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
						{`${publicBlocklistCount} public DNS blocklists: ${ipBlocklistCount} for sending IPs, ${domainBlocklistCount} URI lists for domain names. Not a website scan.`}
					</div>
				</div>

				<div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
					<div
						style={{
							display: "flex",
							padding: "6px 14px",
							borderRadius: "999px",
							backgroundColor: "rgba(14, 165, 233, 0.15)",
							color: primaryColor,
							fontSize: "13px",
							fontFamily: "monospace",
							border: "1px solid rgba(14, 165, 233, 0.3)",
						}}
					>
						RFC 5782
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
						ZEN · DBL · URIBL
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
					{ label: "Listed", color: "#f43f5e" },
					{ label: "Not listed", color: "#10b981" },
					{ label: "Couldn't query", color: "#f59e0b" },
				].map((row) => (
					<div
						key={row.label}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "12px",
							padding: "12px 16px",
							borderRadius: "12px",
							backgroundColor: "rgba(255, 255, 255, 0.04)",
							border: "1px solid rgba(255, 255, 255, 0.08)",
						}}
					>
						<div
							style={{
								display: "flex",
								width: "10px",
								height: "10px",
								borderRadius: "50%",
								backgroundColor: row.color,
							}}
						/>
						<span
							style={{
								fontSize: "16px",
								fontWeight: 600,
								color: "#ffffff",
							}}
						>
							{row.label}
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
