import { ImageResponse } from "next/og";

export const alt = "Contact Us | Reloop";
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
				backgroundColor: "#050506",
				padding: "64px",
				fontFamily: "sans-serif",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* SVG Background Grid */}
			<svg
				width="100%"
				height="100%"
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
				}}
			>
				<defs>
					<pattern
						id="grid"
						width="40"
						height="40"
						patternUnits="userSpaceOnUse"
					>
						<path
							d="M 40 0 L 0 0 0 40"
							fill="none"
							stroke="rgba(255, 255, 255, 0.04)"
							strokeWidth="1"
						/>
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#grid)" />
			</svg>

			{/* Header Row */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					width: "100%",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
					<svg
						width="40"
						height="40"
						viewBox="0 0 200 200"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						{/* fillClassName properties */}
						<rect x="55" y="51" width="83" height="8" fill="#FFFFFF" />
						<rect
							x="55"
							y="59"
							width="75"
							height="8"
							transform="rotate(90 55 59)"
							fill="#FFFFFF"
						/>
						<rect
							x="146"
							y="59"
							width="46"
							height="8"
							transform="rotate(90 146 59)"
							fill="#FFFFFF"
						/>
						<rect
							x="154"
							y="69"
							width="44"
							height="8"
							transform="rotate(90 154 69)"
							fill="#FFFFFF"
						/>
						<rect
							x="146"
							y="105"
							width="8"
							height="8"
							transform="rotate(90 146 105)"
							fill="#FFFFFF"
						/>
						<rect
							x="138"
							y="105"
							width="8"
							height="8"
							transform="rotate(90 138 105)"
							fill="#FFFFFF"
						/>
						<rect
							x="146"
							y="134"
							width="8"
							height="8"
							transform="rotate(90 146 134)"
							fill="#FFFFFF"
						/>
						<rect
							x="98"
							y="77"
							width="10"
							height="8"
							transform="rotate(90 98 77)"
							fill="#FFFFFF"
						/>
						<rect
							x="146"
							y="113"
							width="21"
							height="8"
							transform="rotate(90 146 113)"
							fill="#FFFFFF"
						/>
						<rect
							x="154"
							y="122"
							width="20"
							height="8"
							transform="rotate(90 154 122)"
							fill="#FFFFFF"
						/>
						<rect
							x="98"
							y="113"
							width="21"
							height="8"
							transform="rotate(90 98 113)"
							fill="#FFFFFF"
						/>
						<rect x="55" y="134" width="83" height="8" fill="#FFFFFF" />
						<rect x="63" y="142" width="83" height="8" fill="#FFFFFF" />

						{/* strokeClassName properties */}
						<rect
							x="138"
							y="59"
							width="46"
							height="8"
							transform="rotate(90 138 59)"
							fill="#A3A3A3"
						/>
						<rect
							x="130"
							y="59"
							width="46"
							height="8"
							transform="rotate(90 130 59)"
							fill="#A3A3A3"
						/>
						<rect
							x="90"
							y="105"
							width="29"
							height="8"
							transform="rotate(90 90 105)"
							fill="#A3A3A3"
						/>
						<rect
							x="82"
							y="105"
							width="29"
							height="8"
							transform="rotate(90 82 105)"
							fill="#A3A3A3"
						/>
						<rect
							x="130"
							y="105"
							width="8"
							height="8"
							transform="rotate(90 130 105)"
							fill="#A3A3A3"
						/>
						<rect
							x="122"
							y="105"
							width="8"
							height="8"
							transform="rotate(90 122 105)"
							fill="#A3A3A3"
						/>
						<rect
							x="90"
							y="77"
							width="10"
							height="8"
							transform="rotate(90 90 77)"
							fill="#A3A3A3"
						/>
						<rect
							x="82"
							y="77"
							width="10"
							height="8"
							transform="rotate(90 82 77)"
							fill="#A3A3A3"
						/>
						<rect
							x="138"
							y="113"
							width="21"
							height="8"
							transform="rotate(90 138 113)"
							fill="#A3A3A3"
						/>
						<rect
							x="130"
							y="113"
							width="21"
							height="8"
							transform="rotate(90 130 113)"
							fill="#A3A3A3"
						/>
					</svg>
					<span
						style={{
							fontSize: "28px",
							fontWeight: 800,
							color: "#ffffff",
							letterSpacing: "-0.5px",
							marginLeft: "-14px",
						}}
					>
						Reloop
					</span>
				</div>
			</div>

			{/* Main content area */}
			<div
				style={{
					display: "flex",
					margin: "auto 0",
					flexDirection: "column",
					gap: "16px",
				}}
			>
				<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
					<span
						style={{
							fontSize: "56px",
							fontWeight: 800,
							color: "#ffffff",
							letterSpacing: "-1.5px",
							lineHeight: 1.1,
						}}
					>
						Get help from the engineers who built it.
					</span>
				</div>
				<p
					style={{
						fontSize: "18px",
						color: "#71717A",
						maxWidth: "850px",
						lineHeight: 1.5,
						fontWeight: 300,
						margin: "4px 0 0 0",
					}}
				>
					Need help setting up self-hosting, optimizing deliverability, or choosing
					the right plan? We&apos;re online and typically reply in 2-3 minutes.
				</p>
			</div>

			{/* Footer Row */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					width: "100%",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "32px",
						fontSize: "18px",
						color: "#A1A1AA",
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#34D399"
							strokeWidth="3"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<polyline points="20 6 9 17 4 12" />
						</svg>
						<span>2-3 Minute Reply Time</span>
					</div>
					<div
						style={{
							width: "6px",
							height: "6px",
							borderRadius: "50%",
							backgroundColor: "#52525B",
						}}
					/>
					<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#34D399"
							strokeWidth="3"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<polyline points="20 6 9 17 4 12" />
						</svg>
						<span>Developer-First Support</span>
					</div>
				</div>
				<div
					style={{
						fontSize: "16px",
						color: "#71717A",
						fontFamily: "monospace",
						letterSpacing: "1px",
					}}
				>
					reloop.sh/contact
				</div>
			</div>
		</div>,
		{
			...size,
		},
	);
}
