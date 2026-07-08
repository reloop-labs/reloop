import { ImageResponse } from "next/og";

export const alt = "Reloop — Email for AI Agents, Developers & Marketing teams";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ─── Brand tokens ───────────────────────────────────────────────────────────
const BG = "#000000";
const ACCENT = "#d97757"; // warm amber-orange
const WHITE = "#ffffff";
const MUTED = "#888888";
const BORDER = "rgba(255,255,255,0.08)";

export default function OpenGraphImage() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					backgroundColor: BG,
					position: "relative",
					overflow: "hidden",
					fontFamily: "sans-serif",
				}}
			>
				{/* ── Dot-grid background ── */}
				<div
					style={{
						position: "absolute",
						inset: 0,
						backgroundImage:
							"radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
						backgroundSize: "28px 28px",
						display: "flex",
					}}
				/>

				{/* ── Radial amber glow — bottom-right ── */}
				<div
					style={{
						position: "absolute",
						right: "-120px",
						bottom: "-180px",
						width: "680px",
						height: "680px",
						borderRadius: "50%",
						background:
							"radial-gradient(circle, rgba(217,119,87,0.22) 0%, rgba(217,119,87,0.06) 45%, transparent 70%)",
						display: "flex",
					}}
				/>

				{/* ── Softer secondary glow — center-left ── */}
				<div
					style={{
						position: "absolute",
						left: "-80px",
						top: "180px",
						width: "500px",
						height: "500px",
						borderRadius: "50%",
						background:
							"radial-gradient(circle, rgba(217,119,87,0.07) 0%, transparent 65%)",
						display: "flex",
					}}
				/>

				{/* ── Top bar: logo left · pill right ── */}
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						padding: "48px 56px",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					{/* Logo wordmark */}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "10px",
						}}
					>
						{/* Reloop pixel-loop icon */}
						<svg
							width="28"
							height="28"
							viewBox="0 0 200 200"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<rect x="55" y="51" width="83" height="8" fill={WHITE} />
							<rect
								x="55"
								y="59"
								width="75"
								height="8"
								transform="rotate(90 55 59)"
								fill={WHITE}
							/>
							<rect
								x="146"
								y="59"
								width="46"
								height="8"
								transform="rotate(90 146 59)"
								fill={WHITE}
							/>
							<rect
								x="154"
								y="69"
								width="44"
								height="8"
								transform="rotate(90 154 69)"
								fill={WHITE}
							/>
							<rect
								x="138"
								y="59"
								width="46"
								height="8"
								transform="rotate(90 138 59)"
								fill={MUTED}
							/>
							<rect
								x="130"
								y="59"
								width="46"
								height="8"
								transform="rotate(90 130 59)"
								fill={MUTED}
							/>
							<rect
								x="90"
								y="105"
								width="29"
								height="8"
								transform="rotate(90 90 105)"
								fill={MUTED}
							/>
							<rect
								x="82"
								y="105"
								width="29"
								height="8"
								transform="rotate(90 82 105)"
								fill={MUTED}
							/>
							<rect
								x="138"
								y="105"
								width="8"
								height="8"
								transform="rotate(90 138 105)"
								fill={WHITE}
							/>
							<rect
								x="146"
								y="105"
								width="8"
								height="8"
								transform="rotate(90 146 105)"
								fill={WHITE}
							/>
							<rect
								x="146"
								y="134"
								width="8"
								height="8"
								transform="rotate(90 146 134)"
								fill={WHITE}
							/>
							<rect
								x="130"
								y="105"
								width="8"
								height="8"
								transform="rotate(90 130 105)"
								fill={MUTED}
							/>
							<rect
								x="122"
								y="105"
								width="8"
								height="8"
								transform="rotate(90 122 105)"
								fill={MUTED}
							/>
							<rect
								x="98"
								y="77"
								width="10"
								height="8"
								transform="rotate(90 98 77)"
								fill={WHITE}
							/>
							<rect
								x="90"
								y="77"
								width="10"
								height="8"
								transform="rotate(90 90 77)"
								fill={MUTED}
							/>
							<rect
								x="82"
								y="77"
								width="10"
								height="8"
								transform="rotate(90 82 77)"
								fill={MUTED}
							/>
							<rect
								x="146"
								y="113"
								width="21"
								height="8"
								transform="rotate(90 146 113)"
								fill={WHITE}
							/>
							<rect
								x="154"
								y="122"
								width="20"
								height="8"
								transform="rotate(90 154 122)"
								fill={WHITE}
							/>
							<rect
								x="138"
								y="113"
								width="21"
								height="8"
								transform="rotate(90 138 113)"
								fill={MUTED}
							/>
							<rect
								x="130"
								y="113"
								width="21"
								height="8"
								transform="rotate(90 130 113)"
								fill={MUTED}
							/>
							<rect
								x="98"
								y="113"
								width="21"
								height="8"
								transform="rotate(90 98 113)"
								fill={WHITE}
							/>
							<rect x="55" y="134" width="83" height="8" fill={WHITE} />
							<rect x="63" y="142" width="83" height="8" fill={WHITE} />
						</svg>

						<span
							style={{
								fontSize: "19px",
								fontWeight: 600,
								color: WHITE,
								letterSpacing: "-0.3px",
							}}
						>
							Reloop
						</span>
					</div>

					{/* "open source" pill */}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							border: `1px solid ${BORDER}`,
							borderRadius: "999px",
							padding: "6px 16px",
							backgroundColor: "rgba(255,255,255,0.04)",
						}}
					>
						{/* green dot */}
						<div
							style={{
								width: "6px",
								height: "6px",
								borderRadius: "50%",
								backgroundColor: "#4ade80",
								marginRight: "8px",
								display: "flex",
							}}
						/>
						<span
							style={{
								fontSize: "13px",
								fontWeight: 500,
								color: "rgba(255,255,255,0.55)",
								letterSpacing: "0.2px",
							}}
						>
							open source
						</span>
					</div>
				</div>

				{/* ── Main content — vertically centered ── */}
				<div
					style={{
						position: "absolute",
						inset: 0,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						padding: "0 56px",
						paddingTop: "32px",
					}}
				>
					{/* Category label */}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							marginBottom: "28px",
						}}
					>
						<div
							style={{
								width: "20px",
								height: "1px",
								backgroundColor: ACCENT,
								display: "flex",
							}}
						/>
						<span
							style={{
								fontSize: "13px",
								fontWeight: 500,
								color: ACCENT,
								letterSpacing: "0.8px",
								textTransform: "uppercase",
							}}
						>
							An open-source alternative
						</span>
					</div>

					{/* Big headline */}
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "0px",
						}}
					>
						<span
							style={{
								fontSize: "72px",
								fontWeight: 800,
								color: WHITE,
								letterSpacing: "-3px",
								lineHeight: 1.05,
							}}
						>
							Email for AI Agents,
						</span>
						<span
							style={{
								fontSize: "72px",
								fontWeight: 800,
								color: "rgba(255,255,255,0.35)",
								letterSpacing: "-3px",
								lineHeight: 1.05,
							}}
						>
							Developers & Marketing teams.
						</span>
					</div>

					{/* Descriptor */}
					<p
						style={{
							marginTop: "28px",
							fontSize: "19px",
							color: MUTED,
							lineHeight: 1.5,
							fontWeight: 400,
							maxWidth: "640px",
						}}
					>
						High-performance, open-source email infrastructure—the same
						service as proprietary platforms. Use Reloop hosted or deploy it yourself.
					</p>
				</div>

				{/* ── Bottom bar ── */}
				<div
					style={{
						position: "absolute",
						bottom: 0,
						left: 0,
						right: 0,
						padding: "0 56px 44px",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						borderTop: "1px solid rgba(255,255,255,0.05)",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "24px",
						}}
					>
						<span
							style={{
								fontSize: "14px",
								fontWeight: 600,
								color: ACCENT,
								letterSpacing: "-0.2px",
							}}
						>
							reloop.sh
						</span>
						<span
							style={{ width: "1px", height: "12px", backgroundColor: BORDER, display: "flex" }}
						/>
						<span style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)" }}>
							Transactional · Campaigns · SMTP · Webhooks
						</span>
					</div>

					{/* Stars badge */}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "6px",
						}}
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="rgba(255,255,255,0.3)"
						>
							<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
						</svg>
						<span
							style={{
								fontSize: "13px",
								color: "rgba(255,255,255,0.3)",
							}}
						>
							github.com/reloop-labs/reloop
						</span>
					</div>
				</div>
			</div>
		),
		{
			...size,
		},
	);
}
