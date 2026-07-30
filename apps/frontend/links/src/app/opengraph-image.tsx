import { ImageResponse } from "next/og";

export const alt =
	"Reloop Links — Manage email preferences on link.reloop.sh";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Soft stroke matching landing --retro-line-soft (~28% ink). */
const LINE = "rgba(17, 17, 17, 0.28)";
const INK = "#111111";
const MUTED = "#5c564c";
const PAPER = "#f3efe6";
const SURFACE = "#faf7f0";

export default async function OpenGraphImage() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: PAPER,
					/* Grain: same idea as landing radial dots */
					backgroundImage:
						"radial-gradient(rgba(17,17,17,0.08) 0.8px, transparent 0.8px)",
					backgroundSize: "4px 4px",
					fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
					position: "relative",
				}}
			>
				{/* Poster plate */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						width: 920,
						height: 520,
						border: `2px dashed ${LINE}`,
						borderRadius: 28,
						backgroundColor: "rgba(250, 247, 240, 0.94)",
						padding: "40px 48px 32px",
						position: "relative",
					}}
				>
					{/* Brand row */}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							width: "100%",
						}}
					>
						<div style={{ display: "flex", alignItems: "center", gap: 14 }}>
							<LogoMark />
							<span
								style={{
									fontSize: 22,
									fontWeight: 600,
									letterSpacing: "0.08em",
									textTransform: "uppercase",
									color: INK,
								}}
							>
								Reloop
							</span>
						</div>
						<span
							style={{
								fontSize: 16,
								fontWeight: 500,
								letterSpacing: "0.16em",
								textTransform: "uppercase",
								color: MUTED,
							}}
						>
							link.reloop.sh
						</span>
					</div>

					{/* Center diagram + browser */}
					<div
						style={{
							display: "flex",
							flex: 1,
							alignItems: "center",
							justifyContent: "center",
							gap: 48,
							marginTop: 12,
						}}
					>
						{/* Left legend */}
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: 10,
								width: 180,
							}}
						>
							<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
								<BoltMark />
								<RingsMark />
							</div>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: 3,
									fontSize: 12,
									letterSpacing: "0.06em",
									textTransform: "uppercase",
									color: INK,
									fontWeight: 500,
								}}
							>
								<span>TRACKING</span>
								<span>CLICK → REDIRECT</span>
								<span>OPEN ▢</span>
								<span>EMAIL PREFS</span>
							</div>
						</div>

						{/* Browser window + Preferences pill */}
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								width: 380,
								border: `2px dashed ${LINE}`,
								backgroundColor: SURFACE,
							}}
						>
							{/* Chrome dots */}
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 8,
									padding: "12px 14px",
									borderBottom: `1.5px dashed ${LINE}`,
								}}
							>
								{[0, 1, 2].map((i) => (
									<div
										key={i}
										style={{
											width: 10,
											height: 10,
											borderRadius: 999,
											border: `1.5px solid ${LINE}`,
											display: "flex",
										}}
									/>
								))}
							</div>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									padding: "48px 32px",
								}}
							>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										padding: "18px 40px",
										border: `2px dashed ${LINE}`,
										borderRadius: 999,
										backgroundColor: SURFACE,
									}}
								>
									<span
										style={{
											fontSize: 32,
											fontWeight: 700,
											letterSpacing: "-0.02em",
											color: INK,
											fontFamily:
												"ui-sans-serif, system-ui, -apple-system, sans-serif",
										}}
									>
										Preferences
									</span>
								</div>
							</div>
						</div>

						{/* Right vertical label */}
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
								gap: 8,
								fontSize: 13,
								letterSpacing: "0.22em",
								color: INK,
								fontWeight: 500,
								height: 200,
							}}
						>
							<span>]</span>
							<span
								style={{
									writingMode: "vertical-rl",
									transform: "rotate(180deg)",
									letterSpacing: "0.28em",
								}}
							>
								RELOOP
							</span>
							<span>[</span>
						</div>
					</div>

					{/* Footer plate */}
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							width: "100%",
							marginTop: 8,
							gap: 10,
						}}
					>
						<div
							style={{
								width: "100%",
								height: 1.5,
								backgroundImage: `repeating-linear-gradient(to right, ${LINE} 0 6px, transparent 6px 12px)`,
								display: "flex",
							}}
						/>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								fontSize: 13,
								letterSpacing: "0.14em",
								textTransform: "uppercase",
								color: MUTED,
								fontWeight: 500,
							}}
						>
							<span>link.reloop.sh</span>
							<span style={{ color: INK, opacity: 0.7 }}>[ preferences ]</span>
							<span>reloop.sh</span>
						</div>
					</div>
				</div>
			</div>
		),
		{ ...size },
	);
}

function LogoMark() {
	return (
		<svg
			width="40"
			height="40"
			viewBox="0 0 200 200"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect x="55" y="51" width="83" height="8" fill={INK} />
			<rect
				x="55"
				y="59"
				width="75"
				height="8"
				transform="rotate(90 55 59)"
				fill={INK}
			/>
			<rect
				x="146"
				y="59"
				width="46"
				height="8"
				transform="rotate(90 146 59)"
				fill={INK}
			/>
			<rect
				x="154"
				y="69"
				width="44"
				height="8"
				transform="rotate(90 154 69)"
				fill={INK}
			/>
			<rect
				x="138"
				y="59"
				width="46"
				height="8"
				transform="rotate(90 138 59)"
				fill={INK}
				opacity="0.45"
			/>
			<rect
				x="130"
				y="59"
				width="46"
				height="8"
				transform="rotate(90 130 59)"
				fill={INK}
				opacity="0.45"
			/>
			<rect
				x="90"
				y="105"
				width="29"
				height="8"
				transform="rotate(90 90 105)"
				fill={INK}
				opacity="0.45"
			/>
			<rect
				x="82"
				y="105"
				width="29"
				height="8"
				transform="rotate(90 82 105)"
				fill={INK}
				opacity="0.45"
			/>
			<rect
				x="138"
				y="105"
				width="8"
				height="8"
				transform="rotate(90 138 105)"
				fill={INK}
			/>
			<rect
				x="146"
				y="105"
				width="8"
				height="8"
				transform="rotate(90 146 105)"
				fill={INK}
			/>
			<rect
				x="146"
				y="134"
				width="8"
				height="8"
				transform="rotate(90 146 134)"
				fill={INK}
			/>
			<rect
				x="130"
				y="105"
				width="8"
				height="8"
				transform="rotate(90 130 105)"
				fill={INK}
				opacity="0.45"
			/>
			<rect
				x="122"
				y="105"
				width="8"
				height="8"
				transform="rotate(90 122 105)"
				fill={INK}
				opacity="0.45"
			/>
			<rect
				x="98"
				y="77"
				width="10"
				height="8"
				transform="rotate(90 98 77)"
				fill={INK}
			/>
			<rect
				x="90"
				y="77"
				width="10"
				height="8"
				transform="rotate(90 90 77)"
				fill={INK}
				opacity="0.45"
			/>
			<rect
				x="82"
				y="77"
				width="10"
				height="8"
				transform="rotate(90 82 77)"
				fill={INK}
				opacity="0.45"
			/>
			<rect
				x="146"
				y="113"
				width="21"
				height="8"
				transform="rotate(90 146 113)"
				fill={INK}
			/>
			<rect
				x="154"
				y="122"
				width="20"
				height="8"
				transform="rotate(90 154 122)"
				fill={INK}
			/>
			<rect
				x="138"
				y="113"
				width="21"
				height="8"
				transform="rotate(90 138 113)"
				fill={INK}
				opacity="0.45"
			/>
			<rect
				x="130"
				y="113"
				width="21"
				height="8"
				transform="rotate(90 130 113)"
				fill={INK}
				opacity="0.45"
			/>
			<rect
				x="98"
				y="113"
				width="21"
				height="8"
				transform="rotate(90 98 113)"
				fill={INK}
			/>
			<rect x="55" y="134" width="83" height="8" fill={INK} />
			<rect x="63" y="142" width="83" height="8" fill={INK} />
		</svg>
	);
}

function BoltMark() {
	return (
		<svg width="28" height="28" viewBox="0 0 24 24" fill={INK}>
			<path d="M13.5 2 6 13.5h5.2L9.5 22 18 10.5h-5.2L13.5 2Z" />
		</svg>
	);
}

function RingsMark() {
	return (
		<svg
			width="36"
			height="18"
			viewBox="0 0 28 14"
			fill="none"
			stroke={INK}
			strokeWidth="1.75"
		>
			<circle cx="8" cy="7" r="5.25" />
			<circle cx="20" cy="7" r="5.25" />
		</svg>
	);
}
