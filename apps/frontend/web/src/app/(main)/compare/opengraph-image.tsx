import { ImageResponse } from "next/og";

export const alt = "Compare Reloop | Email Provider Comparisons";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const featuredComparisons = ["Resend", "SendGrid", "Mailgun", "AWS SES"];

export default function OpenGraphImage() {
	const primaryColor = "#d97757";

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				backgroundColor: "#000000",
				padding: "56px",
				fontFamily: "sans-serif",
			}}
		>
			<div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
				<div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
					<span style={{ fontSize: "22px", fontWeight: 600, color: "#ffffff" }}>
						Reloop
					</span>
					<span style={{ fontSize: "22px", color: "rgba(255, 255, 255, 0.4)" }}>
						/
					</span>
					<span style={{ fontSize: "22px", color: "rgba(255, 255, 255, 0.6)" }}>
						Compare
					</span>
				</div>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						marginTop: "24px",
					}}
				>
					<span
						style={{
							fontSize: "52px",
							fontWeight: 700,
							color: "#ffffff",
							letterSpacing: "-1.5px",
						}}
					>
						Reloop vs the competition
					</span>
					<span
						style={{
							fontSize: "18px",
							color: "rgba(255, 255, 255, 0.5)",
							marginTop: "10px",
							maxWidth: "900px",
						}}
					>
						Open-source email infrastructure compared to Resend, SendGrid,
						Mailgun, and more.
					</span>
				</div>
			</div>

			<div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
				{featuredComparisons.map((name) => (
					<div
						key={name}
						style={{
							display: "flex",
							flexDirection: "column",
							flex: 1,
							border: "1px solid rgba(255, 255, 255, 0.08)",
							borderRadius: "12px",
							padding: "16px",
							backgroundColor: "rgba(255, 255, 255, 0.02)",
						}}
					>
						<span
							style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff" }}
						>
							vs {name}
						</span>
					</div>
				))}
			</div>

			<div
				style={{
					borderTop: "1px solid rgba(255, 255, 255, 0.06)",
					paddingTop: "16px",
					marginTop: "16px",
					display: "flex",
					justifyContent: "space-between",
				}}
			>
				<span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.3)" }}>
					Modern email infrastructure for developers
				</span>
				<span
					style={{ fontSize: "14px", fontWeight: 600, color: primaryColor }}
				>
					reloop.sh
				</span>
			</div>
		</div>,
		{ ...size },
	);
}
