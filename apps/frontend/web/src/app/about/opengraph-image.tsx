import { ImageResponse } from "next/og";

export const alt = "why reloop? | Reloop";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "row",
				backgroundColor: "#ffffff",
				padding: "56px 64px",
				fontFamily: "sans-serif",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* faint side rules echoing the page frame */}
			<div
				style={{
					position: "absolute",
					top: 0,
					bottom: 0,
					left: "48px",
					width: "1px",
					backgroundColor: "#e7e7e7",
				}}
			/>
			<div
				style={{
					position: "absolute",
					top: 0,
					bottom: 0,
					right: "48px",
					width: "1px",
					backgroundColor: "#e7e7e7",
				}}
			/>

			{/* left — essay */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					flex: "1.15",
					paddingRight: "40px",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "10px",
					}}
				>
					<div
						style={{
							width: "26px",
							height: "26px",
							borderRadius: "7px",
							backgroundColor: "#0a0a0a",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "#ffffff",
							fontSize: "16px",
							fontWeight: 800,
						}}
					>
						R
					</div>
					<span
						style={{
							fontSize: "20px",
							fontWeight: 700,
							color: "#0a0a0a",
							letterSpacing: "-0.3px",
						}}
					>
						Reloop
					</span>
					<span
						style={{
							fontSize: "13px",
							fontFamily: "monospace",
							color: "#a3a3a3",
							letterSpacing: "2px",
							marginLeft: "8px",
						}}
					>
						ABOUT
					</span>
				</div>

				<span
					style={{
						fontSize: "84px",
						fontWeight: 800,
						color: "#0a0a0a",
						letterSpacing: "-3px",
						lineHeight: 1,
						marginTop: "24px",
					}}
				>
					why reloop?
				</span>

				<p
					style={{
						fontSize: "21px",
						color: "#525252",
						lineHeight: 1.5,
						margin: "18px 0 0 0",
					}}
				>
					Self-hosting email has a scary reputation.
					<br />
					IP reputation. Warm-up. Blocklists.
				</p>

				<div style={{ display: "flex", marginTop: "20px" }}>
					<span
						style={{
							fontSize: "20px",
							fontWeight: 600,
							color: "#ffffff",
							backgroundColor: "#006ffe",
							padding: "6px 12px",
							lineHeight: 1.3,
						}}
					>
						Inbox comes from owning the whole loop.
					</span>
				</div>

				<span
					style={{
						fontSize: "15px",
						color: "#a3a3a3",
						fontFamily: "monospace",
						letterSpacing: "1px",
						marginTop: "28px",
					}}
				>
					reloop.sh/about
				</span>
			</div>

			{/* right — selection frame card */}
			<div
				style={{
					display: "flex",
					flex: "1",
					alignItems: "center",
					justifyContent: "center",
					position: "relative",
				}}
			>
				{/* faint doodle */}
				<svg
					width="200"
					height="120"
					viewBox="0 0 230 140"
					fill="none"
					style={{ position: "absolute", top: "30px", opacity: 0.35 }}
				>
					<g stroke="#d4d4d4" strokeWidth="2" strokeLinecap="round">
						<path d="M8 10 L88 6 L86 78 L6 82 Z" />
						<path d="M84 48 L218 60 L212 130 L78 122 Z" />
						<path d="M96 78 L142 76 L140 110 L94 110 Z M96 78 L118 92 L142 76" />
					</g>
				</svg>

				<div
					style={{
						position: "relative",
						display: "flex",
						flexDirection: "column",
						border: "2px solid #006ffe",
						backgroundColor: "#ffffff",
						padding: "30px 28px 34px 28px",
						transform: "rotate(1.5deg)",
						width: "100%",
					}}
				>
					{/* corner handles */}
					<div
						style={{
							position: "absolute",
							top: "-7px",
							left: "-7px",
							width: "12px",
							height: "12px",
							border: "2px solid #006ffe",
							backgroundColor: "#ffffff",
						}}
					/>
					<div
						style={{
							position: "absolute",
							top: "-7px",
							right: "-7px",
							width: "12px",
							height: "12px",
							border: "2px solid #006ffe",
							backgroundColor: "#ffffff",
						}}
					/>
					<div
						style={{
							position: "absolute",
							bottom: "-7px",
							left: "-7px",
							width: "12px",
							height: "12px",
							border: "2px solid #006ffe",
							backgroundColor: "#ffffff",
						}}
					/>
					<div
						style={{
							position: "absolute",
							bottom: "-7px",
							right: "-7px",
							width: "12px",
							height: "12px",
							border: "2px solid #006ffe",
							backgroundColor: "#ffffff",
						}}
					/>

					<p
						style={{
							fontSize: "21px",
							color: "#0a0a0a",
							lineHeight: 1.55,
							margin: 0,
						}}
					>
						The Reloop Engine. Automated warmup, smart retries,
						suppression — in the open. Nothing to babysit.
					</p>

					<div
						style={{
							position: "absolute",
							bottom: "-16px",
							left: "50%",
							transform: "translateX(-50%)",
							display: "flex",
						}}
					>
						<span
							style={{
								fontSize: "14px",
								fontFamily: "monospace",
								color: "#ffffff",
								backgroundColor: "#006ffe",
								padding: "5px 12px",
								borderRadius: "5px",
								whiteSpace: "nowrap",
							}}
						>
							warmup × retries × reputation
						</span>
					</div>
				</div>
			</div>
		</div>,
		{
			...size,
		},
	);
}
