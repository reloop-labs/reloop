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
				{/* Logo */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						marginLeft: "-12px",
					}}
				>
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

				<div
					style={{
						display: "flex",
						fontSize: "60px",
						fontWeight: 700,
						color: "#ffffff",
						letterSpacing: "-1.5px",
						lineHeight: "1.06",
						marginTop: "20px",
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
					It checks disposable Emails, role addresses, and MX records.
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

			{/* Right: timer blueprint mark — temp email = temporary, with CTA-style measurements */}
			<div style={{ position: "relative", display: "flex", width: "400px" }}>
				<div
					style={{
						position: "absolute",
						top: "28px",
						left: "0px",
						right: "0px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<div
						style={{
							display: "flex",
							color: "#ffffff",
							fontSize: "12px",
							fontWeight: 500,
							letterSpacing: "0.5px",
						}}
					>
						W: 184.0px
					</div>
				</div>
				<div
					style={{
						position: "absolute",
						top: "120px",
						left: "310px",
						display: "flex",
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							color: "#ffffff",
							fontSize: "12px",
							fontWeight: 500,
							letterSpacing: "0.5px",
							lineHeight: ".9",
						}}
					>
						{["H", ":", "1", "8", "4", "p", "x"].map((ch) => (
							<div
								key={ch}
								style={{
									display: "flex",
									transform: "rotate(90deg)",
								}}
							>
								{ch}
							</div>
						))}
					</div>
				</div>
				<svg
					width="400"
					height="330"
					viewBox="0 0 420 340"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					{/* faint grid */}
					<g stroke="white" strokeWidth="1" opacity="0.2">
						<line x1="10" y1="20" x2="10" y2="320" />
						<line x1="50" y1="20" x2="50" y2="320" />
						<line x1="90" y1="20" x2="90" y2="320" />
						<line x1="130" y1="20" x2="130" y2="320" />
						<line x1="170" y1="20" x2="170" y2="320" />
						<line x1="250" y1="20" x2="250" y2="320" />
						<line x1="290" y1="20" x2="290" y2="320" />
						<line x1="330" y1="20" x2="330" y2="320" />
						<line x1="370" y1="20" x2="370" y2="320" />
						<line x1="410" y1="20" x2="410" y2="320" />
						<line x1="0" y1="50" x2="420" y2="50" />
						<line x1="0" y1="90" x2="420" y2="90" />
						<line x1="0" y1="130" x2="420" y2="130" />
						<line x1="0" y1="210" x2="420" y2="210" />
						<line x1="0" y1="250" x2="420" y2="250" />
						<line x1="0" y1="290" x2="420" y2="290" />
					</g>
					{/* dotted drafting guides */}
					<g stroke="white" strokeWidth="1" fill="none" opacity="0.25">
						<circle cx="210" cy="170" r="140" strokeDasharray="3 4" />
						<circle cx="210" cy="170" r="48" strokeDasharray="2 3" />
					</g>
					{/* diagonal construction rays */}
					<g stroke="white" strokeWidth="1" opacity="0.16">
						<line x1="60" y1="20" x2="360" y2="320" />
						<line x1="360" y1="20" x2="60" y2="320" />
						<line
							x1="30"
							y1="60"
							x2="210"
							y2="260"
							strokeDasharray="4 4"
							opacity="0.7"
						/>
						<line
							x1="390"
							y1="60"
							x2="210"
							y2="260"
							strokeDasharray="4 4"
							opacity="0.7"
						/>
					</g>
					{/* center axes */}
					<g stroke="white" strokeWidth="1" strokeDasharray="6 4" opacity="0.4">
						<line x1="210" y1="8" x2="210" y2="312" />
						<line x1="16" y1="170" x2="404" y2="170" />
					</g>
					{/* construction circles */}
					<circle
						cx="210"
						cy="170"
						r="125"
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
					{/* topper button */}
					<rect
						x="196"
						y="52"
						width="28"
						height="12"
						rx="3"
						stroke="white"
						strokeWidth="3"
					/>
					<line
						x1="210"
						y1="64"
						x2="210"
						y2="78"
						stroke="white"
						strokeWidth="3"
					/>
					{/* clock face */}
					<circle
						cx="210"
						cy="170"
						r="92"
						stroke="white"
						strokeWidth="4"
						fill="rgba(255,255,255,0.04)"
					/>
					{/* 12 tick marks */}
					<g stroke="white" strokeWidth="3" strokeLinecap="round">
						<line x1="210" y1="86" x2="210" y2="98" />
						<line x1="252" y1="97" x2="246" y2="107" />
						<line x1="282" y1="128" x2="272" y2="134" />
						<line x1="294" y1="170" x2="282" y2="170" />
						<line x1="282" y1="212" x2="272" y2="206" />
						<line x1="252" y1="243" x2="246" y2="233" />
						<line x1="210" y1="254" x2="210" y2="242" />
						<line x1="168" y1="243" x2="174" y2="233" />
						<line x1="138" y1="212" x2="148" y2="206" />
						<line x1="126" y1="170" x2="138" y2="170" />
						<line x1="138" y1="128" x2="148" y2="134" />
						<line x1="168" y1="97" x2="174" y2="107" />
					</g>
					{/* hands — running out of time */}
					<line
						x1="210"
						y1="170"
						x2="210"
						y2="112"
						stroke="white"
						strokeWidth="5"
						strokeLinecap="round"
					/>
					<line
						x1="210"
						y1="170"
						x2="252"
						y2="190"
						stroke="white"
						strokeWidth="5"
						strokeLinecap="round"
					/>
					<circle cx="210" cy="170" r="7" fill="white" />
					{/* top width dimension bar — broken for the label */}
					<g opacity="0.75">
						<line
							x1="118"
							y1="40"
							x2="168"
							y2="40"
							stroke="white"
							strokeWidth="1"
						/>
						<line
							x1="252"
							y1="40"
							x2="302"
							y2="40"
							stroke="white"
							strokeWidth="1"
						/>
						<path
							d="M 118 35 V 45 M 302 35 V 45"
							stroke="white"
							strokeWidth="1"
						/>
					</g>
					{/* right height dimension bar — broken for the label */}
					<g opacity="0.75">
						<line
							x1="330"
							y1="78"
							x2="330"
							y2="114"
							stroke="white"
							strokeWidth="1"
						/>
						<line
							x1="330"
							y1="216"
							x2="330"
							y2="262"
							stroke="white"
							strokeWidth="1"
						/>
						<path
							d="M 325 78 H 335 M 325 262 H 335"
							stroke="white"
							strokeWidth="1"
						/>
					</g>
					{/* CAD anchor nodes */}
					<g fill="white">
						<rect x="204" y="72" width="12" height="12" rx="2" />
						<rect x="296" y="164" width="12" height="12" rx="2" />
						<rect x="204" y="256" width="12" height="12" rx="2" />
						<rect x="112" y="164" width="12" height="12" rx="2" />
						<rect x="204" y="164" width="12" height="12" rx="2" />
					</g>
				</svg>
			</div>
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
