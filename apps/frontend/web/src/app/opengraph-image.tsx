import { ImageResponse } from "next/og";

export const alt = "Reloop, open-source email infrastructure for developers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				backgroundColor: "#000000",
				padding: "64px",
				fontFamily: "sans-serif",
				color: "#ffffff",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
				<div
					style={{
						width: "44px",
						height: "44px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						borderRadius: "10px",
						backgroundColor: "#ffffff",
						color: "#000000",
						fontSize: "26px",
						fontWeight: 700,
					}}
				>
					R
				</div>
				<div style={{ fontSize: "30px", fontWeight: 600 }}>Reloop</div>
			</div>
			<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
				<div
					style={{
						fontSize: "64px",
						fontWeight: 700,
						lineHeight: 1.05,
						letterSpacing: "-0.03em",
						maxWidth: "980px",
					}}
				>
					Open-source email infrastructure for developers
				</div>
				<div
					style={{
						fontSize: "28px",
						color: "#a3a3a3",
						lineHeight: 1.35,
						maxWidth: "980px",
					}}
				>
					Transactional email API, SMTP relay, campaigns, webhooks, and agent
					inboxes. Reloop Cloud or self-hosted.
				</div>
			</div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					fontSize: "24px",
					color: "#737373",
				}}
			>
				<div>reloop.sh</div>
				<div>Apache 2.0 · Self-hostable</div>
			</div>
		</div>,
		size,
	);
}
