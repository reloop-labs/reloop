import { ImageResponse } from "next/og";

export const alt = "Why Reloop | Open-Source Email Infrastructure";
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
					<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
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
							fontWeight: 700,
							color: "#ffffff",
							letterSpacing: "-0.5px",
						}}
					>
						reloop
					</span>
				</div>
				<div
					style={{
						display: "flex",
						padding: "6px 14px",
						borderRadius: "9999px",
						backgroundColor: "rgba(255, 255, 255, 0.04)",
						border: "1px solid rgba(255, 255, 255, 0.08)",
						fontSize: "12px",
						fontWeight: 600,
						color: "#A1A1AA",
						textTransform: "uppercase",
						letterSpacing: "1px",
					}}
				>
					Philosophy
				</div>
			</div>

			{/* Main content area */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "16px",
					marginTop: "auto",
					marginBottom: "auto",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "8px",
						padding: "4px 12px",
						borderRadius: "6px",
						backgroundColor: "rgba(139, 92, 246, 0.1)",
						border: "1px solid rgba(139, 92, 246, 0.2)",
						color: "#A78BFA",
						fontSize: "12px",
						fontWeight: 600,
						textTransform: "uppercase",
						letterSpacing: "0.5px",
						alignSelf: "flex-start",
					}}
				>
					Why Reloop?
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
					<span
						style={{
							fontSize: "64px",
							fontWeight: 800,
							color: "#ffffff",
							letterSpacing: "-1.5px",
							lineHeight: 1.1,
						}}
					>
						Proprietary-grade email.
					</span>
					<span
						style={{
							fontSize: "64px",
							fontWeight: 800,
							color: "#A1A1AA",
							letterSpacing: "-1.5px",
							lineHeight: 1.1,
						}}
					>
						Without the lock-in.
					</span>
				</div>
				<p
					style={{
						fontSize: "20px",
						color: "#71717A",
						maxWidth: "850px",
						lineHeight: 1.5,
						fontWeight: 300,
						margin: "8px 0 0 0",
					}}
				>
					Reloop is open-source, self-hostable infrastructure. Use it hosted on our
					managed cloud or deploy it directly on your own servers.
				</p>
			</div>

			{/* Footer Row */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					borderTop: "1px solid rgba(255, 255, 255, 0.06)",
					paddingTop: "24px",
					width: "100%",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "24px",
						fontSize: "14px",
						color: "#A1A1AA",
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#34D399"
							strokeWidth="3"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<polyline points="20 6 9 17 4 12" />
						</svg>
						<span>Open-Source Email Platform</span>
					</div>
					<div
						style={{
							width: "4px",
							height: "4px",
							borderRadius: "50%",
							backgroundColor: "#52525B",
						}}
					/>
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#34D399"
							strokeWidth="3"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<polyline points="20 6 9 17 4 12" />
						</svg>
						<span>Zero Vendor Lock-in</span>
					</div>
				</div>
				<div
					style={{
						fontSize: "12px",
						color: "#71717A",
						fontFamily: "monospace",
						letterSpacing: "1px",
					}}
				>
					reloop.sh/philosophy
				</div>
			</div>
		</div>,
		{
			...size,
		},
	);
}
