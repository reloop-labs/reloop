import { ImageResponse } from "next/og";

export const alt = "Reloop — Email for AI Agents, Developers & Marketing teams";
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
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#000000",
				position: "relative",
				overflow: "hidden",
				fontFamily: "sans-serif",
			}}
		>
			{/* Dot-grid background */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					backgroundImage:
						"radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
					backgroundSize: "30px 30px",
					display: "flex",
				}}
			/>

			{/* Subtle center radial glow */}
			<div
				style={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: "800px",
					height: "600px",
					borderRadius: "50%",
					background:
						"radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 65%)",
					display: "flex",
				}}
			/>

			{/* Logo — top left */}
			<div
				style={{
					position: "absolute",
					top: "44px",
					left: "56px",
					display: "flex",
					alignItems: "center",
				}}
			>
				<svg
					width="78"
					height="78"
					viewBox="0 0 200 200"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<rect x="55" y="51" width="83" height="8" fill="#ffffff" />
					<rect
						x="55"
						y="59"
						width="75"
						height="8"
						transform="rotate(90 55 59)"
						fill="#ffffff"
					/>
					<rect
						x="146"
						y="59"
						width="46"
						height="8"
						transform="rotate(90 146 59)"
						fill="#ffffff"
					/>
					<rect
						x="154"
						y="69"
						width="44"
						height="8"
						transform="rotate(90 154 69)"
						fill="#ffffff"
					/>
					<rect
						x="138"
						y="59"
						width="46"
						height="8"
						transform="rotate(90 138 59)"
						fill="rgba(255,255,255,0.4)"
					/>
					<rect
						x="130"
						y="59"
						width="46"
						height="8"
						transform="rotate(90 130 59)"
						fill="rgba(255,255,255,0.4)"
					/>
					<rect
						x="90"
						y="105"
						width="29"
						height="8"
						transform="rotate(90 90 105)"
						fill="rgba(255,255,255,0.4)"
					/>
					<rect
						x="82"
						y="105"
						width="29"
						height="8"
						transform="rotate(90 82 105)"
						fill="rgba(255,255,255,0.4)"
					/>
					<rect
						x="138"
						y="105"
						width="8"
						height="8"
						transform="rotate(90 138 105)"
						fill="#ffffff"
					/>
					<rect
						x="146"
						y="105"
						width="8"
						height="8"
						transform="rotate(90 146 105)"
						fill="#ffffff"
					/>
					<rect
						x="146"
						y="134"
						width="8"
						height="8"
						transform="rotate(90 146 134)"
						fill="#ffffff"
					/>
					<rect
						x="130"
						y="105"
						width="8"
						height="8"
						transform="rotate(90 130 105)"
						fill="rgba(255,255,255,0.4)"
					/>
					<rect
						x="122"
						y="105"
						width="8"
						height="8"
						transform="rotate(90 122 105)"
						fill="rgba(255,255,255,0.4)"
					/>
					<rect
						x="98"
						y="77"
						width="10"
						height="8"
						transform="rotate(90 98 77)"
						fill="#ffffff"
					/>
					<rect
						x="90"
						y="77"
						width="10"
						height="8"
						transform="rotate(90 90 77)"
						fill="rgba(255,255,255,0.4)"
					/>
					<rect
						x="82"
						y="77"
						width="10"
						height="8"
						transform="rotate(90 82 77)"
						fill="rgba(255,255,255,0.4)"
					/>
					<rect
						x="146"
						y="113"
						width="21"
						height="8"
						transform="rotate(90 146 113)"
						fill="#ffffff"
					/>
					<rect
						x="154"
						y="122"
						width="20"
						height="8"
						transform="rotate(90 154 122)"
						fill="#ffffff"
					/>
					<rect
						x="138"
						y="113"
						width="21"
						height="8"
						transform="rotate(90 138 113)"
						fill="rgba(255,255,255,0.4)"
					/>
					<rect
						x="130"
						y="113"
						width="21"
						height="8"
						transform="rotate(90 130 113)"
						fill="rgba(255,255,255,0.4)"
					/>
					<rect
						x="98"
						y="113"
						width="21"
						height="8"
						transform="rotate(90 98 113)"
						fill="#ffffff"
					/>
					<rect x="55" y="134" width="83" height="8" fill="#ffffff" />
					<rect x="63" y="142" width="83" height="8" fill="#ffffff" />
				</svg>
				<span
					style={{
						fontSize: "32px",
						fontWeight: 600,
						color: "#ffffff",
						letterSpacing: "-0.2px",
					}}
				>
					Reloop
				</span>
			</div>

			{/* reloop.sh — top right */}
			<div
				style={{
					position: "absolute",
					top: "44px",
					right: "56px",
					display: "flex",
					alignItems: "center",
					height: "48px",
				}}
			>
				<span
					style={{
						fontSize: "24px",
						fontWeight: 500,
						color: "rgba(255,255,255,0.3)",
						letterSpacing: "0px",
					}}
				>
					reloop.sh
				</span>
			</div>

			{/* ── Centered main content ── */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					textAlign: "center",
					gap: "0px",
					padding: "0 80px",
				}}
			>
				{/* eyebrow */}
				<span
					style={{
						fontSize: "14px",
						fontWeight: 500,
						color: "rgba(255,255,255,0.35)",
						letterSpacing: "2px",
						marginBottom: "32px",
					}}
				>
					An open-source alternative to SendGrid, Postmark, AWS SES
				</span>

				{/* headline line 1 — solid white */}
				<span
					style={{
						fontSize: "78px",
						fontWeight: 800,
						color: "#ffffff",
						letterSpacing: "-3.5px",
						lineHeight: 1.0,
					}}
				>
					Email for AI Agents,
				</span>

				{/* headline line 2 — dim white */}
				<span
					style={{
						fontSize: "78px",
						fontWeight: 800,
						color: "#ffffff",
						letterSpacing: "-3.5px",
						lineHeight: 1.05,
					}}
				>
					Developers & Teams.
				</span>

				{/* descriptor */}
				<span
					style={{
						marginTop: "32px",
						fontSize: "18px",
						color: "rgba(255,255,255,0.4)",
						lineHeight: 1.55,
						fontWeight: 400,
						maxWidth: "620px",
					}}
				>
					High-performance, open-source email infrastructure—the same service as
					proprietary platforms. Hosted or self-hosted.
				</span>
			</div>

			{/* Bottom border line */}
			<div
				style={{
					position: "absolute",
					bottom: "56px",
					left: "56px",
					right: "56px",
					height: "1px",
					backgroundColor: "rgba(255,255,255,0.06)",
					display: "flex",
				}}
			/>
		</div>,
		{
			...size,
		},
	);
}
