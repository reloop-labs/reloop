import { ImageResponse } from "next/og";

export const alt = "why reloop? | Reloop";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
	const [interMediumFont, interSemiBoldFont] = await Promise.all([
		fetch(
			new URL(
				"https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-500-normal.woff",
			),
		).then((res) => res.arrayBuffer()),
		fetch(
			new URL(
				"https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.woff",
			),
		).then((res) => res.arrayBuffer()),
	]);

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "row",
				backgroundColor: "#ffffff",
				padding: "56px 64px",
				fontFamily: "Inter, sans-serif",
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
					}}
				>
					<svg
						width="60"
						height="60"
						viewBox="0 0 200 200"
						fill="none"
					>
						<rect x="55" y="51" width="83" height="8" fill="#2C2C2C" />
						<rect
							x="55"
							y="59"
							width="75"
							height="8"
							transform="rotate(90 55 59)"
							fill="#2C2C2C"
						/>
						<rect
							x="146"
							y="59"
							width="46"
							height="8"
							transform="rotate(90 146 59)"
							fill="#2C2C2C"
						/>
						<rect
							x="154"
							y="69"
							width="44"
							height="8"
							transform="rotate(90 154 69)"
							fill="#2C2C2C"
						/>
						<rect
							x="138"
							y="59"
							width="46"
							height="8"
							transform="rotate(90 138 59)"
							fill="#4D4D4D"
						/>
						<rect
							x="130"
							y="59"
							width="46"
							height="8"
							transform="rotate(90 130 59)"
							fill="#4D4D4D"
						/>
						<rect
							x="90"
							y="105"
							width="29"
							height="8"
							transform="rotate(90 90 105)"
							fill="#4D4D4D"
						/>
						<rect
							x="82"
							y="105"
							width="29"
							height="8"
							transform="rotate(90 82 105)"
							fill="#4D4D4D"
						/>
						<rect
							x="138"
							y="105"
							width="8"
							height="8"
							transform="rotate(90 138 105)"
							fill="#2C2C2C"
						/>
						<rect
							x="146"
							y="105"
							width="8"
							height="8"
							transform="rotate(90 146 105)"
							fill="#2C2C2C"
						/>
						<rect
							x="146"
							y="134"
							width="8"
							height="8"
							transform="rotate(90 146 134)"
							fill="#2C2C2C"
						/>
						<rect
							x="130"
							y="105"
							width="8"
							height="8"
							transform="rotate(90 130 105)"
							fill="#4D4D4D"
						/>
						<rect
							x="122"
							y="105"
							width="8"
							height="8"
							transform="rotate(90 122 105)"
							fill="#4D4D4D"
						/>
						<rect
							x="98"
							y="77"
							width="10"
							height="8"
							transform="rotate(90 98 77)"
							fill="#2C2C2C"
						/>
						<rect
							x="90"
							y="77"
							width="10"
							height="8"
							transform="rotate(90 90 77)"
							fill="#4D4D4D"
						/>
						<rect
							x="82"
							y="77"
							width="10"
							height="8"
							transform="rotate(90 82 77)"
							fill="#4D4D4D"
						/>
						<rect
							x="146"
							y="113"
							width="21"
							height="8"
							transform="rotate(90 146 113)"
							fill="#2C2C2C"
						/>
						<rect
							x="154"
							y="122"
							width="20"
							height="8"
							transform="rotate(90 154 122)"
							fill="#2C2C2C"
						/>
						<rect
							x="138"
							y="113"
							width="21"
							height="8"
							transform="rotate(90 138 113)"
							fill="#4D4D4D"
						/>
						<rect
							x="130"
							y="113"
							width="21"
							height="8"
							transform="rotate(90 130 113)"
							fill="#4D4D4D"
						/>
						<rect
							x="98"
							y="113"
							width="21"
							height="8"
							transform="rotate(90 98 113)"
							fill="#2C2C2C"
						/>
						<rect x="55" y="134" width="83" height="8" fill="#2C2C2C" />
						<rect x="63" y="142" width="83" height="8" fill="#2C2C2C" />
					</svg>
				</div>

				<span
					style={{
						fontSize: "84px",
						fontWeight: 600,
						color: "#0a0a0a",
						letterSpacing: "-0.025em",
						lineHeight: 1,
						marginTop: "24px",
						textWrap: "balance",
					}}
				>
					Why Reloop?
				</span>

				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "flex-start",
						margin: "18px 0 0 0",
					}}
				>
					<span
						style={{
							fontSize: "22px",
							fontWeight: 500,
							color: "#ffffff",
							backgroundColor: "#006ffe",
							padding: "6px 12px",
							lineHeight: 1.3,
							letterSpacing: "-0.025em",
							textWrap: "balance",
						}}
					>
						Self-hosting email has a scary reputation.
					</span>
					<span
						style={{
							fontSize: "21px",
							fontWeight: 500,
							color: "#737373",
							lineHeight: 1.5,
							marginTop: "12px",
							letterSpacing: "-0.025em",
							textWrap: "balance",
						}}
					>
						IP reputation.
					</span>
					<span
						style={{
							fontSize: "21px",
							fontWeight: 500,
							color: "#737373",
							lineHeight: 1.5,
							letterSpacing: "-0.025em",
							textWrap: "balance",
						}}
					>
						Warm-up. Blocklists.
					</span>
				</div>

				<span
					style={{
						fontSize: "15px",
						fontWeight: 500,
						color: "#a3a3a3",
						letterSpacing: "-0.025em",
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
							fontWeight: 500,
							color: "#0a0a0a",
							lineHeight: 1.55,
							margin: 0,
							letterSpacing: "-0.025em",
							textWrap: "balance",
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
								fontWeight: 500,
								color: "#ffffff",
								backgroundColor: "#006ffe",
								padding: "5px 12px",
								borderRadius: "5px",
								whiteSpace: "nowrap",
								letterSpacing: "-0.025em",
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
			fonts: [
				{
					name: "Inter",
					data: interMediumFont,
					weight: 500,
					style: "normal",
				},
				{
					name: "Inter",
					data: interSemiBoldFont,
					weight: 600,
					style: "normal",
				},
			],
		},
	);
}
