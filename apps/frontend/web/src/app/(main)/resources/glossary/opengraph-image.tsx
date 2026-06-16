import { ImageResponse } from "next/og";

export const alt = "Email Glossary | Reloop";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
	const primaryColor = "#d97757";

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
			{/* Left Main Card (60%) */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					width: "640px",
					height: "100%",
					backgroundColor: "rgba(255, 255, 255, 0.02)",
					border: "1px solid rgba(255, 255, 255, 0.08)",
					borderRadius: "24px",
					padding: "40px",
				}}
			>
				{/* Logo / Header */}
				<div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
					<svg width="40" height="40" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
						<rect x="55" y="51" width="83" height="8" fill="#ffffff" />
						<rect x="55" y="59" width="75" height="8" transform="rotate(90 55 59)" fill="#ffffff" />
						<rect x="146" y="59" width="46" height="8" transform="rotate(90 146 59)" fill="#ffffff" />
						<rect x="154" y="69" width="44" height="8" transform="rotate(90 154 69)" fill="#ffffff" />
						<rect x="138" y="59" width="46" height="8" transform="rotate(90 138 59)" fill="#878787" />
						<rect x="130" y="59" width="46" height="8" transform="rotate(90 130 59)" fill="#878787" />
						<rect x="90" y="105" width="29" height="8" transform="rotate(90 90 105)" fill="#878787" />
						<rect x="82" y="105" width="29" height="8" transform="rotate(90 82 105)" fill="#878787" />
						<rect x="138" y="105" width="8" height="8" transform="rotate(90 138 105)" fill="#ffffff" />
						<rect x="146" y="105" width="8" height="8" transform="rotate(90 146 105)" fill="#ffffff" />
						<rect x="146" y="134" width="8" height="8" transform="rotate(90 146 134)" fill="#ffffff" />
						<rect x="130" y="105" width="8" height="8" transform="rotate(90 130 105)" fill="#878787" />
						<rect x="122" y="105" width="8" height="8" transform="rotate(90 122 105)" fill="#878787" />
						<rect x="98" y="77" width="10" height="8" transform="rotate(90 98 77)" fill="#ffffff" />
						<rect x="90" y="77" width="10" height="8" transform="rotate(90 90 77)" fill="#878787" />
						<rect x="82" y="77" width="10" height="8" transform="rotate(90 82 77)" fill="#878787" />
						<rect x="146" y="113" width="21" height="8" transform="rotate(90 146 113)" fill="#ffffff" />
						<rect x="154" y="122" width="20" height="8" transform="rotate(90 154 122)" fill="#ffffff" />
						<rect x="138" y="113" width="21" height="8" transform="rotate(90 138 113)" fill="#878787" />
						<rect x="130" y="113" width="21" height="8" transform="rotate(90 130 113)" fill="#878787" />
						<rect x="98" y="113" width="21" height="8" transform="rotate(90 98 113)" fill="#ffffff" />
						<rect x="55" y="134" width="83" height="8" fill="#ffffff" />
						<rect x="63" y="142" width="83" height="8" fill="#ffffff" />
					</svg>
					<span style={{ fontSize: "20px", fontWeight: 600, color: "#ffffff" }}>Reloop</span>
					<span style={{ fontSize: "20px", fontWeight: 400, color: "rgba(255, 255, 255, 0.4)" }}>/</span>
					<span style={{ fontSize: "20px", fontWeight: 500, color: "rgba(255, 255, 255, 0.6)" }}>Resources</span>
				</div>

				<div style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "24px 0" }}>
					<span style={{ fontSize: "48px", fontWeight: 700, color: "#ffffff", letterSpacing: "-1.5px" }}>Email Glossary</span>
					<span style={{ fontSize: "18px", color: "rgba(255, 255, 255, 0.5)", lineHeight: "1.4" }}>Learn key email terminology, standards, protocols, and best practices.</span>
				</div>

				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "20px" }}>
					<span style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.3)" }}>Infrastructure for developers</span>
					<span style={{ fontSize: "16px", fontWeight: 600, color: primaryColor }}>reloop.sh</span>
				</div>
			</div>

			{/* Right Bento Cards (40%) */}
			<div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "420px", height: "100%" }}>
				{([
    {
        "title": "SPF (Sender Policy)",
        "desc": "Specifies which mail servers are authorized to send email."
    },
    {
        "title": "DKIM Signatures",
        "desc": "Cryptographic signature verifying email authenticity."
    },
    {
        "title": "DMARC Policies",
        "desc": "Instructs providers how to handle emails failing SPF/DKIM."
    }
]).map((item, idx) => (
					<div
						key={idx}
						style={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "center",
							backgroundColor: "rgba(255, 255, 255, 0.02)",
							border: "1px solid rgba(255, 255, 255, 0.08)",
							borderRadius: "20px",
							padding: "24px 30px",
							height: "164px",
						}}
					>
						<span style={{ fontSize: "18px", fontWeight: 600, color: "#ffffff" }}>{item.title}</span>
						<span style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.4)", marginTop: "6px", lineHeight: "1.4" }}>{item.desc}</span>
					</div>
				))}
			</div>
		</div>,
		{
			...size,
		},
	);
}
