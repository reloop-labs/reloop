import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt =
	"Free Email HTML Editor: Visual Email Template Editor | Reloop";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0a0a0a";

/** The editor screenshot the page hero uses, 2774x1920. */
const SCREENSHOT_PATH = "public/platform/template.png";
const SCREENSHOT_WIDTH = 760;
const SCREENSHOT_HEIGHT = Math.round((SCREENSHOT_WIDTH * 1920) / 2774);

async function loadScreenshot() {
	const candidates = [
		join(process.cwd(), SCREENSHOT_PATH),
		join(process.cwd(), "apps/frontend/web", SCREENSHOT_PATH),
	];
	for (const path of candidates) {
		try {
			const data = await readFile(path);
			return `data:image/png;base64,${data.toString("base64")}`;
		} catch {
			// try next
		}
	}
	throw new Error("Editor screenshot not found");
}

function interFont(weight: 400 | 500 | 700) {
	return fetch(
		new URL(
			`https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-${weight}-normal.woff`,
		),
	).then((res) => res.arrayBuffer());
}

export default async function OpenGraphImage() {
	const weights = [400, 500, 700] as const;
	const [screenshot, ...fontData] = await Promise.all([
		loadScreenshot(),
		...weights.map(interFont),
	]);

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				backgroundColor: "#ffffff",
				// soft blue that picks up the selection blue in the screenshot; full width so there's no seam
				backgroundImage:
					"linear-gradient(to top, #dbe7ff 0%, #eef3ff 40%, #ffffff 80%)",
				fontFamily: "Inter, sans-serif",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* the real editor, bleeding off the right and bottom edges */}
			<div
				style={{
					position: "absolute",
					top: "116px",
					left: "688px",
					width: `${SCREENSHOT_WIDTH}px`,
					height: `${SCREENSHOT_HEIGHT}px`,
					display: "flex",
					borderRadius: "16px",
					border: "1px solid rgba(10,10,10,0.12)",
					overflow: "hidden",
					boxShadow: "0 30px 60px -20px rgba(80,20,40,0.28)",
				}}
			>
				<img
					src={screenshot}
					alt=""
					width={SCREENSHOT_WIDTH}
					height={SCREENSHOT_HEIGHT}
				/>
			</div>

			{/* Left: copy */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					width: "600px",
					height: "100%",
					padding: "0px 0px 0px 72px",
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
						<rect x="55" y="51" width="83" height="8" fill="#0a0a0a" />
						<rect
							x="55"
							y="59"
							width="75"
							height="8"
							transform="rotate(90 55 59)"
							fill="#0a0a0a"
						/>
						<rect
							x="146"
							y="59"
							width="46"
							height="8"
							transform="rotate(90 146 59)"
							fill="#0a0a0a"
						/>
						<rect
							x="154"
							y="69"
							width="44"
							height="8"
							transform="rotate(90 154 69)"
							fill="#0a0a0a"
						/>
						<rect
							x="138"
							y="59"
							width="46"
							height="8"
							transform="rotate(90 138 59)"
							fill="rgba(10,10,10,0.45)"
						/>
						<rect
							x="130"
							y="59"
							width="46"
							height="8"
							transform="rotate(90 130 59)"
							fill="rgba(10,10,10,0.45)"
						/>
						<rect
							x="90"
							y="105"
							width="29"
							height="8"
							transform="rotate(90 90 105)"
							fill="rgba(10,10,10,0.45)"
						/>
						<rect
							x="82"
							y="105"
							width="29"
							height="8"
							transform="rotate(90 82 105)"
							fill="rgba(10,10,10,0.45)"
						/>
						<rect
							x="138"
							y="105"
							width="8"
							height="8"
							transform="rotate(90 138 105)"
							fill="#0a0a0a"
						/>
						<rect
							x="146"
							y="105"
							width="8"
							height="8"
							transform="rotate(90 146 105)"
							fill="#0a0a0a"
						/>
						<rect
							x="146"
							y="134"
							width="8"
							height="8"
							transform="rotate(90 146 134)"
							fill="#0a0a0a"
						/>
						<rect
							x="130"
							y="105"
							width="8"
							height="8"
							transform="rotate(90 130 105)"
							fill="rgba(10,10,10,0.45)"
						/>
						<rect
							x="122"
							y="105"
							width="8"
							height="8"
							transform="rotate(90 122 105)"
							fill="rgba(10,10,10,0.45)"
						/>
						<rect
							x="98"
							y="77"
							width="10"
							height="8"
							transform="rotate(90 98 77)"
							fill="#0a0a0a"
						/>
						<rect
							x="90"
							y="77"
							width="10"
							height="8"
							transform="rotate(90 90 77)"
							fill="rgba(10,10,10,0.45)"
						/>
						<rect
							x="82"
							y="77"
							width="10"
							height="8"
							transform="rotate(90 82 77)"
							fill="rgba(10,10,10,0.45)"
						/>
						<rect
							x="146"
							y="113"
							width="21"
							height="8"
							transform="rotate(90 146 113)"
							fill="#0a0a0a"
						/>
						<rect
							x="154"
							y="122"
							width="20"
							height="8"
							transform="rotate(90 154 122)"
							fill="#0a0a0a"
						/>
						<rect
							x="138"
							y="113"
							width="21"
							height="8"
							transform="rotate(90 138 113)"
							fill="rgba(10,10,10,0.45)"
						/>
						<rect
							x="130"
							y="113"
							width="21"
							height="8"
							transform="rotate(90 130 113)"
							fill="rgba(10,10,10,0.45)"
						/>
						<rect
							x="98"
							y="113"
							width="21"
							height="8"
							transform="rotate(90 98 113)"
							fill="#0a0a0a"
						/>
						<rect x="55" y="134" width="83" height="8" fill="#0a0a0a" />
						<rect x="63" y="142" width="83" height="8" fill="#0a0a0a" />
					</svg>
					<span
						style={{
							fontSize: "36px",
							fontWeight: 800,
							color: "#0a0a0a",
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
						flexDirection: "column",
						fontSize: "68px",
						fontWeight: 700,
						color: INK,
						letterSpacing: "-2.4px",
						lineHeight: "1.02",
						marginTop: "28px",
					}}
				>
					<span>Free Email</span>
					<span>HTML Editor</span>
				</div>

				<div
					style={{
						display: "flex",
						fontSize: "24px",
						fontWeight: 400,
						color: "#525252",
						lineHeight: "1.4",
						letterSpacing: "-0.2px",
						marginTop: "22px",
						flexDirection: "column",
					}}
				>
					<span>Edit templates on a visual canvas.</span>
					<span>The HTML stays in sync.</span>
				</div>

				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "10px",
						marginTop: "36px",
						fontSize: "18px",
						fontWeight: 500,
						color: "#737373",
					}}
				>
					<span>Free</span>
					<span style={{ color: "#d4d4d4" }}>·</span>
					<span>No signup</span>
					<span style={{ color: "#d4d4d4" }}>·</span>
					<span>Runs in your browser</span>
				</div>
			</div>
		</div>,
		{
			...size,
			fonts: weights.map((weight, i) => ({
				name: "Inter",
				data: fontData[i] as ArrayBuffer,
				weight,
				style: "normal" as const,
			})),
		},
	);
}
