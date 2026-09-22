import { ImageResponse } from "next/og";

export const alt =
	"Free Temp Email Checker — Disposable Email Detector | Reloop";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BLUE = "#246BF5";

export default async function OpenGraphImage() {
	const [interRegularFont, interMediumFont, interBoldFont, interExtraBoldFont] =
		await Promise.all([
			fetch(
				new URL(
					"https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff",
				),
			).then((res) => res.arrayBuffer()),
			fetch(
				new URL(
					"https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-500-normal.woff",
				),
			).then((res) => res.arrayBuffer()),
			fetch(
				new URL(
					"https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff",
				),
			).then((res) => res.arrayBuffer()),
			fetch(
				new URL(
					"https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-800-normal.woff",
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
				alignItems: "center",
				justifyContent: "space-between",
				backgroundColor: BLUE,
				padding: "64px 72px",
				fontFamily: "Inter, sans-serif",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* inset white border, like the CTA card */}
			<div
				style={{
					position: "absolute",
					top: "12px",
					left: "12px",
					right: "12px",
					bottom: "12px",
					border: "1px solid rgba(255,255,255,0.35)",
					borderRadius: "28px",
					pointerEvents: "none",
				}}
			/>

			{/* Logo — absolute top-left, aligned with the content edge */}
			<div
				style={{
					position: "absolute",
					top: "45px",
					left: "65px",
					display: "flex",
					alignItems: "center",
				}}
			>
				{" "}
				<svg
					width="68"
					height="68"
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
						fill="rgba(255,255,255,0.55)"
					/>
					<rect
						x="130"
						y="59"
						width="46"
						height="8"
						transform="rotate(90 130 59)"
						fill="rgba(255,255,255,0.55)"
					/>
					<rect
						x="90"
						y="105"
						width="29"
						height="8"
						transform="rotate(90 90 105)"
						fill="rgba(255,255,255,0.55)"
					/>
					<rect
						x="82"
						y="105"
						width="29"
						height="8"
						transform="rotate(90 82 105)"
						fill="rgba(255,255,255,0.55)"
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
						fill="rgba(255,255,255,0.55)"
					/>
					<rect
						x="122"
						y="105"
						width="8"
						height="8"
						transform="rotate(90 122 105)"
						fill="rgba(255,255,255,0.55)"
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
						fill="rgba(255,255,255,0.55)"
					/>
					<rect
						x="82"
						y="77"
						width="10"
						height="8"
						transform="rotate(90 82 77)"
						fill="rgba(255,255,255,0.55)"
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
						fill="rgba(255,255,255,0.55)"
					/>
					<rect
						x="130"
						y="113"
						width="21"
						height="8"
						transform="rotate(90 130 113)"
						fill="rgba(255,255,255,0.55)"
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
						fontSize: "36px",
						fontWeight: 800,
						color: "#ffffff",
						letterSpacing: "-0.5px",
						marginLeft: "-4px",
					}}
				>
					Reloop
				</span>
			</div>

			{/* Left: copy, vertically centered */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					width: "560px",
					height: "100%",
				}}
			>
				<div
					style={{
						display: "flex",
						fontSize: "60px",
						fontWeight: 700,
						color: "#ffffff",
						letterSpacing: "-1.5px",
						lineHeight: "1.06",
					}}
				>
					Free Temp Email Checker
				</div>

				<div
					style={{
						display: "flex",
						fontSize: "22px",
						fontWeight: 400,
						color: "rgba(255,255,255,0.85)",
						lineHeight: "1.45",
						marginTop: "16px",
					}}
				>
					It checks disposable Email, role addresses, and MX records
				</div>

				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "12px",
						marginTop: "22px",
					}}
				>
					{[
						{
							title: "100% Free & No limits",
							icon: (
								<g
									stroke="white"
									strokeWidth="2"
									fill="none"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<rect x="5" y="8" width="14" height="4" rx="1" />
									<path d="M6.5 12v7.5h11V12" />
									<line x1="12" y1="8" x2="12" y2="19.5" />
									<path d="M12 8C10 8 8 7 8 5.5 8 4.5 9 4 9.8 4.6L12 8zm0 0c2 0 4-1 4-2.5 0-1-1-1.5-1.8-.9L12 8z" />
								</g>
							),
						},
						{
							title: "99.9% accuracy",
							icon: (
								<g
									stroke="white"
									strokeWidth="2"
									fill="none"
									strokeLinecap="round"
								>
									<circle cx="12" cy="12" r="8" />
									<circle cx="12" cy="12" r="4.5" />
									<circle cx="12" cy="12" r="1.2" fill="white" />
								</g>
							),
						},
						{
							title: "No Account Needed",
							icon: (
								<g
									stroke="white"
									strokeWidth="2"
									fill="none"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<rect x="6" y="10.5" width="12" height="9" rx="2" />
									<path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7" />
								</g>
							),
						},
						{
							title: "Real-time sync every 24 hrs",
							icon: (
								<g
									stroke="white"
									strokeWidth="2"
									fill="none"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M19 12a7 7 0 1 1-2-4.9" />
									<path d="M19 3.5V8h-4.5" />
								</g>
							),
						},
					].map((feature) => (
						<div
							key={feature.title}
							style={{ display: "flex", alignItems: "center", gap: "12px" }}
						>
							<svg
								width="26"
								height="26"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								{feature.icon}
							</svg>
							<div
								style={{
									display: "flex",
									fontSize: "20px",
									fontWeight: 600,
									color: "#ffffff",
									letterSpacing: "-0.2px",
								}}
							>
								{feature.title}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Right: envelope blueprint mark */}
			<svg
				width="400"
				height="330"
				viewBox="0 0 420 340"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g stroke="white" strokeWidth="1" opacity="0.22">
					<line x1="30" y1="40" x2="30" y2="300" />
					<line x1="90" y1="40" x2="90" y2="300" />
					<line x1="150" y1="40" x2="150" y2="300" />
					<line x1="270" y1="40" x2="270" y2="300" />
					<line x1="330" y1="40" x2="330" y2="300" />
					<line x1="390" y1="40" x2="390" y2="300" />
					<line x1="10" y1="90" x2="410" y2="90" />
					<line x1="10" y1="170" x2="410" y2="170" />
					<line x1="10" y1="250" x2="410" y2="250" />
				</g>
				<circle
					cx="210"
					cy="170"
					r="110"
					stroke="white"
					strokeWidth="1"
					opacity="0.25"
				/>
				<circle
					cx="210"
					cy="170"
					r="70"
					stroke="white"
					strokeWidth="1"
					strokeDasharray="4 4"
					opacity="0.25"
				/>
				<rect
					x="70"
					y="100"
					width="280"
					height="160"
					rx="18"
					stroke="white"
					strokeWidth="4"
					fill="rgba(255,255,255,0.04)"
				/>
				<path
					d="M 74 104 L 200 186 L 220 186 L 346 104"
					stroke="white"
					strokeWidth="4"
					strokeLinecap="round"
					strokeLinejoin="round"
					fill="none"
				/>
				<g fill="white">
					<rect x="62" y="92" width="12" height="12" rx="2" />
					<rect x="346" y="92" width="12" height="12" rx="2" />
					<rect x="62" y="256" width="12" height="12" rx="2" />
					<rect x="346" y="256" width="12" height="12" rx="2" />
				</g>
			</svg>
		</div>,
		{
			...size,
			fonts: [
				{
					name: "Inter",
					data: interRegularFont,
					weight: 400,
					style: "normal",
				},
				{
					name: "Inter",
					data: interMediumFont,
					weight: 500,
					style: "normal",
				},
				{
					name: "Inter",
					data: interBoldFont,
					weight: 700,
					style: "normal",
				},
				{
					name: "Inter",
					data: interExtraBoldFont,
					weight: 800,
					style: "normal",
				},
			],
		},
	);
}
