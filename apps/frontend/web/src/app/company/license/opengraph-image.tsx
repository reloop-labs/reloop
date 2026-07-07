import { ImageResponse } from "next/og";

export const alt = "Reloop License — Apache 2.0 with Reloop Labs Terms";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CheckIcon = () => (
	<svg
		width="14"
		height="10"
		viewBox="0 0 14 10"
		fill="none"
		style={{ display: "flex" }}
	>
		<path
			d="M1 5L4.5 8.5L13 1"
			stroke="#4ade80"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const CrossIcon = () => (
	<svg
		width="10"
		height="10"
		viewBox="0 0 10 10"
		fill="none"
		style={{ display: "flex" }}
	>
		<path
			d="M1 1L9 9M9 1L1 9"
			stroke="#f87171"
			strokeWidth="2.5"
			strokeLinecap="round"
		/>
	</svg>
);

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

			{/* Top Header */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					width: "100%",
					zIndex: 10,
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

			{/* Main Content Area */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: 48,
					width: "100%",
					zIndex: 10,
				}}
			>
				{/* Left side text info */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						maxWidth: 580,
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							fontSize: 64,
							lineHeight: 1.05,
							fontWeight: 600,
							color: "#ffffff",
							fontFamily: "Georgia, serif",
							letterSpacing: "-0.03em",
						}}
					>
						Apache 2.0
						<span style={{ color: "#ffffff", marginTop: 4 }}>
							License Terms
						</span>
					</div>
					<div
						style={{
							marginTop: 24,
							fontSize: 26,
							lineHeight: 1.45,
							color: "rgba(255,255,255,0.55)",
						}}
					>
						Reloop is open-source and self-hostable with additional terms from
						Reloop Labs for commercial hosting.
					</div>
					<div
						style={{
							display: "flex",
							marginTop: 32,
							gap: 16,
							fontSize: 20,
							color: "rgba(255,255,255,0.38)",
						}}
					>
						<span>Self-Hostable</span>
						<span>·</span>
						<span>Hosted Service</span>
						<span>·</span>
						<span>Apache 2.0</span>
					</div>
				</div>

				{/* Right side bento preview */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						width: 440,
						borderRadius: 24,
						border: "1px solid rgba(255, 255, 255, 0.08)",
						background: "rgba(255, 255, 255, 0.02)",
						padding: 32,
						gap: 20,
					}}
				>
					<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
						<div
							style={{
								fontSize: 13,
								fontWeight: 700,
								color: "#ffffff",
								letterSpacing: "0.1em",
							}}
						>
							PERMITTED
						</div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 14,
								fontSize: 18,
								color: "rgba(255,255,255,0.85)",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									width: 24,
									height: 24,
									borderRadius: "50%",
									background: "rgba(34, 197, 94, 0.15)",
								}}
							>
								<CheckIcon />
							</div>
							<span>Personal Projects & Learning</span>
						</div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 14,
								fontSize: 18,
								color: "rgba(255,255,255,0.85)",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									width: 24,
									height: 24,
									borderRadius: "50%",
									background: "rgba(34, 197, 94, 0.15)",
								}}
							>
								<CheckIcon />
							</div>
							<span>Internal Organization Use</span>
						</div>
					</div>

					<div style={{ height: 1, background: "rgba(255, 255, 255, 0.08)" }} />

					<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
						<div
							style={{
								fontSize: 13,
								fontWeight: 700,
								color: "#ffffff",
								letterSpacing: "0.1em",
							}}
						>
							RESTRICTED
						</div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 14,
								fontSize: 18,
								color: "rgba(255,255,255,0.65)",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									width: 24,
									height: 24,
									borderRadius: "50%",
									background: "rgba(239, 68, 68, 0.15)",
								}}
							>
								<CrossIcon />
							</div>
							<span>Commercial SaaS / PaaS hosting</span>
						</div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 14,
								fontSize: 18,
								color: "rgba(255,255,255,0.65)",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									width: 24,
									height: 24,
									borderRadius: "50%",
									background: "rgba(239, 68, 68, 0.15)",
								}}
							>
								<CrossIcon />
							</div>
							<span>Compete commercially with Reloop</span>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Footer */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					width: "100%",
					zIndex: 10,
				}}
			>
				<span
					style={{
						fontSize: "16px",
						color: "rgba(255,255,255,0.35)",
						fontFamily: "sans-serif",
					}}
				>
					Apache 2.0 with custom restrictions.
				</span>
				<span
					style={{
						fontSize: "16px",
						color: "#71717A",
						fontFamily: "monospace",
						letterSpacing: "1px",
					}}
				>
					reloop.sh/company/license
				</span>
			</div>
		</div>,
		{ ...size },
	);
}
