import { ImageResponse } from "next/og";
import type { ReactNode } from "react";

export const alt = "Free Email & Developer Tools | Reloop";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Deterministic PRNG so the blast field is stable across renders. */
function mulberry32(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * Static SVG stand-in for the PixelBlast hero background (square variant).
 * Scatters small squares around a cluster center, fading with distance —
 * same side-weighted feel as the hero's masked blast, without WebGL.
 */
function BlastField({
	seed,
	x,
	y,
	width,
	height,
	color,
	count = 300,
	maxOpacity = 0.38,
}: {
	seed: number;
	x: number;
	y: number;
	width: number;
	height: number;
	color: string;
	count?: number;
	maxOpacity?: number;
}) {
	const rand = mulberry32(seed);
	const cx = x + width / 2;
	const cy = y + height / 2;
	const maxDist = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2);
	const dots: ReactNode[] = [];

	for (let i = 0; i < count; i++) {
		const dx = (rand() - 0.5) * width;
		const dy = (rand() - 0.5) * height;
		const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;
		const alpha = maxOpacity * (1 - dist);
		if (alpha < 0.03) continue;
		const s = 3 + Math.floor(rand() * 3);
		dots.push(
			<rect
				key={i}
				x={Math.round(cx + dx)}
				y={Math.round(cy + dy)}
				width={s}
				height={s}
				fill={color}
				opacity={Number(alpha.toFixed(2))}
			/>,
		);
	}

	return (
		<svg
			width="1200"
			height="630"
			viewBox="0 0 1200 630"
			fill="none"
			style={{ position: "absolute", inset: 0 }}
		>
			{dots}
		</svg>
	);
}

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
			{/* pixel-blast fields — side-weighted like the hero, center kept clear */}
			<BlastField
				seed={7}
				x={760}
				y={-60}
				width={520}
				height={380}
				color="#10b981"
			/>
			<BlastField
				seed={42}
				x={-80}
				y={330}
				width={520}
				height={360}
				color="#10b981"
			/>
			{/* faint frame rules echoing the page frame */}
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
			<div
				style={{
					position: "absolute",
					top: "48px",
					left: 0,
					right: 0,
					height: "1px",
					backgroundColor: "#e7e7e7",
				}}
			/>
			<div
				style={{
					position: "absolute",
					bottom: "48px",
					left: 0,
					right: 0,
					height: "1px",
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
					<svg width="60" height="60" viewBox="0 0 200 200" fill="none">
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
						fontSize: "76px",
						fontWeight: 600,
						color: "#0a0a0a",
						letterSpacing: "-0.025em",
						lineHeight: 1,
						marginTop: "24px",
						textWrap: "balance",
					}}
				>
					Free Email Tools
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
							backgroundColor: "#10b981",
							padding: "6px 12px",
							lineHeight: 1.3,
							letterSpacing: "-0.025em",
							textWrap: "balance",
						}}
					>
						Zero signup. Zero setup.
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
						Validate addresses. Inspect DNS.
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
						Score deliverability.
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
					reloop.sh/tools
				</span>
			</div>

			{/* right — note frame card */}
			<div
				style={{
					display: "flex",
					flex: "1",
					alignItems: "center",
					justifyContent: "center",
					position: "relative",
				}}
			>
				<div
					style={{
						position: "relative",
						display: "flex",
						flexDirection: "column",
						border: "2px solid #10b981",
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
							border: "2px solid #10b981",
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
							border: "2px solid #10b981",
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
							border: "2px solid #10b981",
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
							border: "2px solid #10b981",
							backgroundColor: "#ffffff",
						}}
					/>

					<span
						style={{
							fontSize: "13px",
							fontWeight: 500,
							color: "#737373",
							letterSpacing: "-0.025em",
						}}
					>
						INCLUDED FREE
					</span>
					<p
						style={{
							fontSize: "26px",
							fontWeight: 500,
							color: "#0a0a0a",
							lineHeight: 1.3,
							margin: "10px 0 0 0",
							letterSpacing: "-0.025em",
							textWrap: "balance",
						}}
					>
						Validators, DNS lookups &amp; deliverability checks.
					</p>
					<p
						style={{
							fontSize: "19px",
							fontWeight: 500,
							color: "#737373",
							lineHeight: 1.55,
							margin: "12px 0 0 0",
							letterSpacing: "-0.025em",
							textWrap: "balance",
						}}
					>
						No account. No API key. Just open and run.
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
								backgroundColor: "#10b981",
								padding: "5px 12px",
								borderRadius: "5px",
								whiteSpace: "nowrap",
								letterSpacing: "-0.025em",
							}}
						>
							free forever × zero signup
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
