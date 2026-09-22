import { ImageResponse } from "next/og";

export const alt = "Apache 2.0 License — Reloop";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#000000";

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
				backgroundColor: BG,
				padding: "64px 72px",
				fontFamily: "Inter, sans-serif",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* inset white border, matching brand blueprint CTA style */}
			<div
				style={{
					position: "absolute",
					top: "12px",
					left: "12px",
					right: "12px",
					bottom: "12px",
					border: "1px solid rgba(255,255,255,0.2)",
					borderRadius: "28px",
					pointerEvents: "none",
				}}
			/>

			{/* Left: copy & value pillars */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					width: "560px",
					height: "100%",
				}}
			>
				{/* Reloop Logo & Wordmark */}
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
					Apache 2.0 License
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
					Open source, self-hostable, with fair protections for our hosted
					service.
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
							title: "100% Free & Self-Hostable",
							icon: (
								<g
									stroke="white"
									strokeWidth="2"
									fill="none"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<rect x="3" y="4.5" width="18" height="6.5" rx="2" />
									<rect x="3" y="13" width="18" height="6.5" rx="2" />
									<circle cx="6.5" cy="7.8" r="1" fill="white" />
									<circle cx="6.5" cy="16.3" r="1" fill="white" />
									<line x1="17.5" y1="7.8" x2="17.51" y2="7.8" />
									<line x1="17.5" y1="16.3" x2="17.51" y2="16.3" />
								</g>
							),
						},
						{
							title: "Personal & Organization Use",
							icon: (
								<g
									stroke="white"
									strokeWidth="2"
									fill="none"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
									<circle cx="9" cy="7" r="4" />
									<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
									<path d="M16 3.13a4 4 0 0 1 0 7.75" />
								</g>
							),
						},
						{
							title: "Apache 2.0 Base License",
							icon: (
								<g
									stroke="white"
									strokeWidth="2"
									fill="none"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
									<polyline points="14 2 14 8 20 8" />
									<line x1="16" y1="13" x2="8" y2="13" />
									<line x1="16" y1="17" x2="8" y2="17" />
									<polyline points="10 9 9 9 8 9" />
								</g>
							),
						},
						{
							title: "Hosted Service Protection",
							icon: (
								<g
									stroke="white"
									strokeWidth="2"
									fill="none"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
									<path d="M9 12l2 2 4-4" />
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

			{/* Right: License Certificate CAD / Blueprint illustration */}
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
						W: 160.0px
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
						{["H", ":", "1", "8", "0", "p", "x"].map((ch) => (
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
					<g stroke="white" strokeWidth="1" fill="none" opacity="0.2">
						<circle cx="210" cy="165" r="140" strokeDasharray="3 4" />
						<circle cx="210" cy="165" r="48" strokeDasharray="2 3" />
					</g>
					{/* diagonal construction rays */}
					<g stroke="white" strokeWidth="1" opacity="0.2">
						<line x1="60" y1="20" x2="360" y2="320" />
						<line x1="360" y1="20" x2="60" y2="320" />
						<line
							x1="30"
							y1="60"
							x2="210"
							y2="260"
							strokeDasharray="4 4"
							opacity="0.18"
						/>
						<line
							x1="390"
							y1="60"
							x2="210"
							y2="260"
							strokeDasharray="4 4"
							opacity="0.18"
						/>
					</g>
					{/* center axes */}
					<g
						stroke="white"
						strokeWidth="1"
						strokeDasharray="6 4"
						opacity="0.16"
					>
						<line x1="210" y1="8" x2="210" y2="312" />
						<line x1="16" y1="165" x2="404" y2="165" />
					</g>
					{/* construction circles */}
					<circle
						cx="210"
						cy="165"
						r="125"
						stroke="white"
						strokeWidth="1"
						opacity="0.2"
					/>
					<circle
						cx="210"
						cy="165"
						r="70"
						stroke="white"
						strokeWidth="1"
						strokeDasharray="4 4"
						opacity="0.2"
					/>

					{/* seal alignment guides */}
					<g stroke="white" strokeWidth="1" strokeDasharray="3 3" opacity="0.2">
						<circle cx="262" cy="191" r="32" />
						<line x1="262" y1="191" x2="295" y2="275" />
						<line x1="262" y1="191" x2="235" y2="275" />
					</g>

					{/* License Certificate & Seal CAD icon in the center */}
					<g transform="translate(210, 165)">
						<g transform="scale(10.5)">
							<g transform="translate(-9.5, -9.5)">
								{/* Faint filled silhouette */}
								<path
									opacity="0.2"
									d="M10.25 16.25H4.25C3.145 16.25 2.25 15.355 2.25 14.25V3.75C2.25 2.645 3.145 1.75 4.25 1.75H12.75C13.855 1.75 14.75 2.645 14.75 3.75V6.5"
									fill="white"
								/>
								<path
									opacity="0.2"
									d="M14.5 14.5C13.678 14.5 12.956 14.098 12.5 13.486V17.5C12.5 17.702 12.622 17.885 12.809 17.962C12.996 18.041 13.21 17.997 13.354 17.854L14.5 16.708L15.646 17.854C15.742 17.95 15.87 18 16 18C16.064 18 16.13 17.988 16.191 17.962C16.378 17.885 16.5 17.702 16.5 17.5V13.486C16.044 14.098 15.322 14.5 14.5 14.5Z"
									fill="white"
								/>

								{/* Ribbon tail */}
								<path
									d="M14.5 14.5C13.678 14.5 12.956 14.098 12.5 13.486V17.5C12.5 17.702 12.622 17.885 12.809 17.962C12.996 18.041 13.21 17.997 13.354 17.854L14.5 16.708L15.646 17.854C15.742 17.95 15.87 18 16 18C16.064 18 16.13 17.988 16.191 17.962C16.378 17.885 16.5 17.702 16.5 17.5V13.486C16.044 14.098 15.322 14.5 14.5 14.5Z"
									fill="rgba(255,255,255,0.1)"
									stroke="white"
									strokeWidth="0.8"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>

								{/* Document outline */}
								<path
									d="M10.25 16.25H4.25C3.145 16.25 2.25 15.355 2.25 14.25V3.75C2.25 2.645 3.145 1.75 4.25 1.75H12.75C13.855 1.75 14.75 2.645 14.75 3.75V6.5"
									stroke="white"
									strokeWidth="1.2"
									strokeLinecap="round"
									strokeLinejoin="round"
									fill="rgba(255,255,255,0.04)"
								/>

								{/* Ruled text clauses */}
								<path
									d="M5.25 5.75H11.75"
									stroke="white"
									strokeWidth="1.2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M5.25 9H8.25"
									stroke="white"
									strokeWidth="1.2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M5.25 12.25H8.25"
									stroke="white"
									strokeWidth="1.2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>

								{/* Rosette / Seal ring */}
								<path
									d="M14.5 14.5C15.881 14.5 17 13.3807 17 12C17 10.6193 15.881 9.5 14.5 9.5C13.119 9.5 12 10.6193 12 12C12 13.3807 13.119 14.5 14.5 14.5Z"
									stroke="white"
									strokeWidth="1.2"
									strokeLinecap="round"
									strokeLinejoin="round"
									fill="rgba(255,255,255,0.18)"
								/>
							</g>
						</g>
					</g>

					{/* top width dimension bar — broken for the label */}
					<g opacity="0.35">
						<line
							x1="130"
							y1="40"
							x2="168"
							y2="40"
							stroke="white"
							strokeWidth="1"
						/>
						<line
							x1="252"
							y1="40"
							x2="290"
							y2="40"
							stroke="white"
							strokeWidth="1"
						/>
						<path
							d="M 130 35 V 45 M 290 35 V 45"
							stroke="white"
							strokeWidth="1"
						/>
					</g>
					{/* right height dimension bar — broken for the label */}
					<g opacity="0.35">
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
							y2="252"
							stroke="white"
							strokeWidth="1"
						/>
						<path
							d="M 325 78 H 335 M 325 252 H 335"
							stroke="white"
							strokeWidth="1"
						/>
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
