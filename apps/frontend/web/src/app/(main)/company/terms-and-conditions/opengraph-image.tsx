import { ImageResponse } from "next/og";

export const alt = "Terms of Service | Reloop";
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
				flexDirection: "column",
				justifyContent: "space-between",
				backgroundColor: "#000000",
				padding: "56px",
				fontFamily: "sans-serif",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* Top Part */}
			<div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
				{/* Logo / Header */}
				<div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
					<svg width="45" height="45" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
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
					<span style={{ fontSize: "22px", fontWeight: 600, color: "#ffffff", letterSpacing: "-0.5px", marginLeft: "8px" }}>Reloop</span>
					<span style={{ fontSize: "22px", fontWeight: 400, color: "rgba(255, 255, 255, 0.4)", letterSpacing: "-0.5px", marginLeft: "8px" }}>/</span>
					<span style={{ fontSize: "22px", fontWeight: 500, color: "rgba(255, 255, 255, 0.6)", letterSpacing: "-0.5px", marginLeft: "8px" }}>Company</span>
				</div>

				<div style={{ display: "flex", flexDirection: "column", marginTop: "24px" }}>
					<span style={{ fontSize: "52px", fontWeight: 700, color: "#ffffff", letterSpacing: "-1.5px" }}>Terms of Service</span>
					<span style={{ fontSize: "18px", color: "rgba(255, 255, 255, 0.5)", marginTop: "10px", maxWidth: "900px" }}>Terms governing usage of reloop.sh and the hosted email infrastructure of Reloop Labs.</span>
				</div>
			</div>

			{/* Bottom Row of Cards */}
			<div style={{ display: "flex", flexDirection: "row", gap: "16px", marginTop: "32px", width: "100%" }}>
				{([
    {
        "title": "Hosted Service Terms",
        "desc": "Guidelines for sending emails via Reloop Labs servers."
    },
    {
        "title": "Fair Usage Policy",
        "desc": "Ensuring quality of service and preventing platform abuse."
    },
    {
        "title": "Apache 2.0 Codebase",
        "desc": "Open source files subject to Apache 2.0 with use clauses."
    }
]).map((item, idx) => (
					<div
						key={idx}
						style={{
							display: "flex",
							flexDirection: "column",
							flex: 1,
							backgroundColor: "rgba(255, 255, 255, 0.02)",
							border: "1px solid rgba(255, 255, 255, 0.08)",
							borderRadius: "16px",
							padding: "20px 24px",
							height: "150px",
						}}
					>
						<span style={{ fontSize: "16px", fontWeight: 600, color: "#ffffff" }}>{item.title}</span>
						<span style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.4)", marginTop: "6px", lineHeight: "1.4" }}>{item.desc}</span>
					</div>
				))}
			</div>

			{/* Small Footer bar */}
			<div style={{ display: "flex", justifyContent: "space-between", width: "100%", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "16px", marginTop: "16px" }}>
				<span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.3)" }}>Modern email infrastructure for developers</span>
				<span style={{ fontSize: "14px", fontWeight: 600, color: primaryColor }}>reloop.sh</span>
			</div>
		</div>,
		{
			...size,
		},
	);
}
