import { ImageResponse } from "next/og";

export const alt =
	"Why Open Source — Open-Source Email Infrastructure | Reloop";
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
					Why Open Source
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
					Closed email tools sell trust. We sell a repo you can verify.
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
							title: "100% Free & Apache 2.0",
							icon: (
								<g
									stroke="white"
									strokeWidth="2"
									fill="none"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M16 18l2-2-2-2M8 14l-2 2 2 2" />
									<path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10l-6-6z" />
									<path d="M14 4v6h6" />
								</g>
							),
						},
						{
							title: "Verify Every Line of Code",
							icon: (
								<g
									stroke="white"
									strokeWidth="2"
									fill="none"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<circle cx="11" cy="11" r="7.5" />
									<line x1="21" y1="21" x2="16.5" y2="16.5" />
									<path d="M8 11l2 2 4-4" />
								</g>
							),
						},
						{
							title: "Hosted or Self-Hosted",
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
							title: "Zero Vendor Lock-in",
							icon: (
								<g
									stroke="white"
									strokeWidth="2"
									fill="none"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<rect x="5" y="11" width="14" height="10" rx="2" />
									<path d="M8 11V7a4 4 0 0 1 8 0" />
									<circle cx="12" cy="16" r="1.5" fill="white" />
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

			{/* Right: Open Source CAD / Blueprint illustration */}
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
					<g stroke="white" strokeWidth="1" fill="none" opacity="0.2">
						<circle cx="210" cy="170" r="140" strokeDasharray="3 4" />
						<circle cx="210" cy="170" r="48" strokeDasharray="2 3" />
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
						<line x1="16" y1="170" x2="404" y2="170" />
					</g>
					{/* construction circles */}
					<circle
						cx="210"
						cy="170"
						r="125"
						stroke="white"
						strokeWidth="1"
						opacity="0.2"
					/>
					<circle
						cx="210"
						cy="170"
						r="70"
						stroke="white"
						strokeWidth="1"
						strokeDasharray="4 4"
						opacity="0.2"
					/>

					{/* open source aperture guidelines */}
					<g stroke="white" strokeWidth="1" strokeDasharray="3 3" opacity="0.2">
						<line x1="210" y1="170" x2="160" y2="300" />
						<line x1="210" y1="170" x2="260" y2="300" />
					</g>

					{/* Open Source Icon in the center */}
					<g transform="translate(210, 170)">
						<g transform="scale(5.75)">
							<g transform="translate(-16, -16)">
								<path
									opacity="0.2"
									d="M-0.136 16.708c0.152-8.765 6.287-15.005 13.797-16.015 8.959-1.199 16.495 4.895 17.943 12.979 1.375 7.667-2.839 14.844-9.787 17.688-0.599 0.244-0.927 0.109-1.156-0.5l-3.453-8.969c-0.197-0.527-0.063-0.855 0.453-1.088 1.563-0.709 2.536-1.896 2.797-3.6 0.411-2.64-1.5-5.077-4.161-5.307-2.423-0.235-4.609 1.453-5 3.853-0.339 2.131 0.713 4.115 2.697 5.016 0.62 0.281 0.745 0.557 0.505 1.188l-3.469 9.031c-0.167 0.443-0.531 0.6-1 0.417-3.661-1.432-6.667-4.167-8.437-7.677-1.609-3.177-1.624-5.661-1.729-7.021z"
									fill="white"
								/>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M1.213 16.584c0.027 0.427 0.041 0.921 0.084 1.427 0.405 4.64 3.197 9.26 8.452 11.817 0.209 0.093 0.287 0.052 0.365-0.145 0.959-2.527 1.927-5.052 2.901-7.579 0.083-0.208 0.041-0.307-0.152-0.427-2.041-1.287-3.057-3.131-2.943-5.552 0.063-1.391 0.6-2.615 1.537-3.636 1.932-2.109 4.968-2.568 7.453-1.135 2.052 1.187 3.197 3.484 2.916 5.839-0.235 1.968-1.244 3.479-2.953 4.5-0.172 0.104-0.224 0.187-0.145 0.389 0.979 2.532 1.953 5.063 2.916 7.595 0.079 0.203 0.157 0.244 0.36 0.145 2.297-1.068 4.208-2.599 5.688-4.64 2.244-3.115 3.171-6.579 2.728-10.391-0.88-7.584-7.703-13.865-16.489-12.781-6.844 0.839-12.604 6.615-12.719 14.573z"
									stroke="white"
									strokeWidth="0.85"
									strokeLinecap="round"
									strokeLinejoin="round"
									fill="rgba(255,255,255,0.05)"
								/>
							</g>
						</g>
					</g>

					{/* top width dimension bar — broken for the label */}
					<g opacity="0.35">
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
