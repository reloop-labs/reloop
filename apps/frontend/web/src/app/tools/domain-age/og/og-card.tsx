import type { ReactNode } from "react";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BACKGROUND = "#000000";

export async function loadFonts() {
	const [regular, medium, bold, extraBold] = await Promise.all([
		fetch(
			"https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff",
		).then((r) => r.arrayBuffer()),
		fetch(
			"https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-500-normal.woff",
		).then((r) => r.arrayBuffer()),
		fetch(
			"https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff",
		).then((r) => r.arrayBuffer()),
		fetch(
			"https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-800-normal.woff",
		).then((r) => r.arrayBuffer()),
	]);
	return [
		{
			name: "Inter",
			data: regular,
			weight: 400 as const,
			style: "normal" as const,
		},
		{
			name: "Inter",
			data: medium,
			weight: 500 as const,
			style: "normal" as const,
		},
		{
			name: "Inter",
			data: bold,
			weight: 700 as const,
			style: "normal" as const,
		},
		{
			name: "Inter",
			data: extraBold,
			weight: 800 as const,
			style: "normal" as const,
		},
	];
}

function Logo() {
	return (
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
	);
}

function CalendarBlueprint() {
	return (
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
					W: 180.0px
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
					{["H", ":", "1", "4", "0", "p", "x"].map((ch) => (
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
				{/* calendar hangers */}
				<rect
					x="166"
					y="86"
					width="14"
					height="30"
					rx="4"
					stroke="white"
					strokeWidth="3"
				/>
				<rect
					x="240"
					y="86"
					width="14"
					height="30"
					rx="4"
					stroke="white"
					strokeWidth="3"
				/>
				{/* calendar body */}
				<rect
					x="120"
					y="106"
					width="180"
					height="140"
					rx="10"
					stroke="white"
					strokeWidth="4"
					fill="rgba(255,255,255,0.04)"
				/>
				<line
					x1="120"
					y1="142"
					x2="300"
					y2="142"
					stroke="white"
					strokeWidth="3"
				/>
				{/* month dots */}
				<g fill="white" opacity="0.85">
					<circle cx="146" cy="124" r="4" />
					<circle cx="164" cy="124" r="4" opacity="0.45" />
					<circle cx="182" cy="124" r="4" opacity="0.45" />
				</g>
				{/* day cells */}
				<g fill="white">
					<rect x="138" y="158" width="18" height="18" rx="4" opacity="0.45" />
					<rect x="164" y="158" width="18" height="18" rx="4" opacity="0.45" />
					<rect x="190" y="158" width="18" height="18" rx="4" />
					<rect x="216" y="158" width="18" height="18" rx="4" opacity="0.45" />
					<rect x="242" y="158" width="18" height="18" rx="4" opacity="0.45" />
					<rect x="138" y="184" width="18" height="18" rx="4" opacity="0.45" />
					<rect x="164" y="184" width="18" height="18" rx="4" />
					<rect x="190" y="184" width="18" height="18" rx="4" opacity="0.45" />
					<rect x="216" y="184" width="18" height="18" rx="4" opacity="0.45" />
					<rect x="242" y="184" width="18" height="18" rx="4" opacity="0.45" />
					<rect x="138" y="210" width="18" height="18" rx="4" opacity="0.45" />
					<rect x="164" y="210" width="18" height="18" rx="4" opacity="0.45" />
					<rect x="190" y="210" width="18" height="18" rx="4" opacity="0.45" />
				</g>
				{/* top width dimension bar, broken for the label */}
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
				{/* right height dimension bar, broken for the label */}
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
					<rect x="114" y="100" width="12" height="12" rx="2" />
					<rect x="294" y="100" width="12" height="12" rx="2" />
					<rect x="114" y="240" width="12" height="12" rx="2" />
					<rect x="294" y="240" width="12" height="12" rx="2" />
					<rect x="204" y="164" width="12" height="12" rx="2" />
				</g>
			</svg>
		</div>
	);
}

export type OgFeature = { title: string; icon: ReactNode };

/** Black Reloop card shared by the domain age and domain warmup share images. */
export function OgCard({
	titleLines,
	titleFontSize,
	subtitle,
	features,
}: {
	titleLines: string[];
	titleFontSize: number;
	subtitle: string;
	features: OgFeature[];
}) {
	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "space-between",
				backgroundColor: BACKGROUND,
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
				<Logo />

				<div
					style={{
						display: "flex",
						flexDirection: "column",
						marginTop: "20px",
					}}
				>
					{titleLines.map((line) => (
						<div
							key={line}
							style={{
								display: "flex",
								fontSize: titleFontSize,
								fontWeight: 700,
								color: "#ffffff",
								letterSpacing: "-1.5px",
								lineHeight: "1.06",
								whiteSpace: "nowrap",
							}}
						>
							{line}
						</div>
					))}
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
					{subtitle}
				</div>

				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "12px",
						marginTop: "22px",
					}}
				>
					{features.map((feature) => (
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

			<CalendarBlueprint />
		</div>
	);
}

export const calendarIcon = (
	<g
		stroke="white"
		strokeWidth="2"
		fill="none"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<rect x="4" y="6" width="16" height="14" rx="2" />
		<line x1="4" y1="10" x2="20" y2="10" />
		<line x1="8.5" y1="3.5" x2="8.5" y2="7" />
		<line x1="15.5" y1="3.5" x2="15.5" y2="7" />
	</g>
);
export const targetIcon = (
	<g stroke="white" strokeWidth="2" fill="none" strokeLinecap="round">
		<circle cx="12" cy="12" r="8" />
		<circle cx="12" cy="12" r="4.5" />
		<circle cx="12" cy="12" r="1.2" fill="white" />
	</g>
);
export const refreshIcon = (
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
);
export const giftIcon = (
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
);
export const clockIcon = (
	<g
		stroke="white"
		strokeWidth="2"
		fill="none"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<circle cx="12" cy="12" r="8" />
		<path d="M12 7.5V12l3 2" />
	</g>
);
export const shieldIcon = (
	<g
		stroke="white"
		strokeWidth="2"
		fill="none"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M12 3.5 5 6v5.5c0 4.2 2.9 7.4 7 9 4.1-1.6 7-4.8 7-9V6l-7-2.5z" />
		<path d="m9 12 2 2 4-4" />
	</g>
);

export function DomainAgeCard() {
	return (
		<OgCard
			titleLines={["Free Domain Age", "Calculator"]}
			titleFontSize={60}
			subtitle="Registration date, exact age & expiry date."
			features={[
				{ title: "Official registry dates", icon: calendarIcon },
				{ title: "Exact age, to the day", icon: clockIcon },
				{ title: "Expiry date & registrar", icon: refreshIcon },
				{ title: "100% Free & No sign-up", icon: giftIcon },
			]}
		/>
	);
}

export function DomainWarmupCard() {
	return (
		<OgCard
			titleLines={["Free Domain Warmup", "Checker"]}
			titleFontSize={60}
			subtitle="Is your domain ready to send email?"
			features={[
				{ title: "Too New → Established stages", icon: targetIcon },
				{ title: "SPF, DMARC & MX readiness", icon: shieldIcon },
				{ title: "Safe daily sending caps", icon: clockIcon },
				{ title: "100% Free & No sign-up", icon: giftIcon },
			]}
		/>
	);
}
