import { ImageResponse } from "next/og";
import { getLanguage } from "../languages";

export const alt = "Send Email | Reloop";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const language = getLanguage(slug);
	const title = language ? `Send Email with ${language.name} | Reloop` : "Send Email | Reloop";
	const description = language ? language.shortDescription : "Open-source, self-hostable email infrastructure.";
	const primaryColor = "#d97757";

	const sdkInstall = language ? `SDK: ${language.name}` : "SDK Libraries";
	const codeExample = language ? `import { Reloop } from "reloop-${slug}"` : "npm install reloop-email";

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
					width: "550px",
					height: "100%",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "14px",
						width: "100%",
					}}
				>
					<svg
						width="50"
						height="50"
						viewBox="0 0 200 200"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
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
						Languages
					</span>
				</div>
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
							fontSize: "56px",
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
				<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
					<div
						style={{
							fontSize: "16px",
							color: "rgba(255, 255, 255, 0.3)",
						}}
					>
						Modern email infrastructure for developers
					</div>
					<div
						style={{
							fontSize: "16px",
							fontWeight: 600,
							color: primaryColor,
						}}
					>
						reloop.sh
					</div>
				</div>
			</div>

			{/* Right Column (Terminal Code Block style) */}
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
						padding: "28px",
						fontFamily: "monospace",
						width: "100%",
						height: "360px",
						boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
					}}
				>
					<div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
						<div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ff5f56" }} />
						<div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ffbd2e" }} />
						<div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#27c93f" }} />
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
						<span style={{ color: "#d97757", fontWeight: 600 }}>$ SDK Install</span>
						<span style={{ color: "rgba(255, 255, 255, 0.5)", paddingLeft: "16px" }}>{sdkInstall}</span>
						
						<span style={{ color: "#d97757", fontWeight: 600, marginTop: "12px" }}>$ Code Example</span>
						<span style={{ color: "#a3e635", paddingLeft: "16px" }}>{codeExample}</span>
					</div>
				</div>
			</div>
		</div>,
		{
			...size,
		},
	);
}
