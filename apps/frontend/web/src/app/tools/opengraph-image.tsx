import { ImageResponse } from "next/og";
import { createElement } from "react";
import { ALL_TOOLS, CATEGORIES } from "./components/tools-grid";

export const alt = "Free Email & Developer Tools | Reloop";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0a0a0a";
const LINE = "#ececee";

/** Tools that count as tools on the index (not the API docs or the suggestion link). */
const TOOLS = ALL_TOOLS.filter((tool) => tool.category);

/** The first two categories, shown as a crop of the /tools list. */
const PREVIEW = CATEGORIES.slice(0, 2).map((category) => ({
	title: category.title,
	tools: TOOLS.filter((tool) => tool.category === category.id),
}));

/**
 * Icon shapes for the tools in the preview, copied from each tool's lucide icon
 * (and the temp email timer). lucide-react's components are client-only, so the
 * server-side image renderer can't call them.
 */
const ICON_SHAPES: Record<string, [string, Record<string, string>][]> = {
	"/tools/email-validator": [
		[
			"path",
			{ d: "M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" },
		],
		["path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" }],
		["path", { d: "m16 19 2 2 4-4" }],
	],
	"/tools/deliverability-tester": [
		[
			"path",
			{
				d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
			},
		],
		["path", { d: "m21.854 2.147-10.94 10.939" }],
	],
	"/tools/blocklist-checker": [
		["circle", { cx: "12", cy: "12", r: "10" }],
		["path", { d: "M4.929 4.929 19.07 19.071" }],
	],
	"/tools/temp-email-checker": [
		["rect", { x: "9.5", y: "1.5", width: "5", height: "2.4", rx: "0.8" }],
		["line", { x1: "12", y1: "3.9", x2: "12", y2: "5.4" }],
		["circle", { cx: "12", cy: "13.4", r: "8" }],
		["line", { x1: "12", y1: "13.4", x2: "12", y2: "9" }],
		["line", { x1: "12", y1: "13.4", x2: "15.4", y2: "15" }],
	],
	"/tools/spoof-checker": [
		[
			"path",
			{
				d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
			},
		],
		["path", { d: "M12 8v4" }],
		["path", { d: "M12 16h.01" }],
	],
	"/tools/dns-lookup": [
		["circle", { cx: "12", cy: "12", r: "10" }],
		["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" }],
		["path", { d: "M2 12h20" }],
	],
	"/tools/auth-checker": [
		[
			"path",
			{
				d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
			},
		],
		["path", { d: "m9 12 2 2 4-4" }],
	],
	"/tools/bimi-checker": [
		[
			"path",
			{
				d: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z",
			},
		],
		["path", { d: "m9 12 2 2 4-4" }],
	],
};

function ToolIcon({ path }: { path: string }) {
	const shapes = ICON_SHAPES[path];
	if (!shapes) return null;
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="#52525b"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
			xmlns="http://www.w3.org/2000/svg"
		>
			{shapes.map(([tag, attrs]) =>
				createElement(tag, { key: JSON.stringify(attrs), ...attrs }),
			)}
		</svg>
	);
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
	const fontData = await Promise.all(weights.map(interFont));

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				backgroundColor: "#ffffff",
				// same soft blue as the email HTML editor card; full width so there's no seam
				backgroundImage:
					"linear-gradient(to top, #dbe7ff 0%, #eef3ff 40%, #ffffff 80%)",
				fontFamily: "Inter, sans-serif",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* the /tools list, bleeding off the right and bottom edges */}
			<div
				style={{
					position: "absolute",
					top: "112px",
					left: "668px",
					width: "600px",
					display: "flex",
					flexDirection: "column",
					backgroundColor: "#ffffff",
					border: "1px solid rgba(10,10,10,0.1)",
					borderRadius: "16px",
					overflow: "hidden",
					boxShadow: "0 30px 60px -20px rgba(20,40,90,0.25)",
				}}
			>
				{PREVIEW.map((category) => (
					<div
						key={category.title}
						style={{ display: "flex", flexDirection: "column" }}
					>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								padding: "16px 24px",
								backgroundColor: "#fafafa",
								borderBottom: `1px solid ${LINE}`,
							}}
						>
							<div
								style={{
									display: "flex",
									fontSize: "16px",
									fontWeight: 500,
									color: INK,
									letterSpacing: "-0.2px",
								}}
							>
								{category.title}
							</div>
						</div>
						{category.tools.map((tool) => {
							return (
								<div
									key={tool.path}
									style={{
										display: "flex",
										alignItems: "center",
										gap: "14px",
										padding: "14px 24px",
										borderBottom: `1px solid ${LINE}`,
									}}
								>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											width: "36px",
											height: "36px",
											borderRadius: "10px",
											border: "1px solid #e4e4e7",
											color: "#52525b",
										}}
									>
										<ToolIcon path={tool.path} />
									</div>
									<div
										style={{
											display: "flex",
											fontSize: "17px",
											fontWeight: 500,
											color: INK,
											letterSpacing: "-0.2px",
										}}
									>
										{tool.title}
									</div>
								</div>
							);
						})}
					</div>
				))}
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
					<span>Free email tools</span>
					<span>by Reloop</span>
				</div>

				<div
					style={{
						display: "flex",
						flexDirection: "column",
						fontSize: "24px",
						fontWeight: 400,
						color: "#525252",
						lineHeight: "1.4",
						letterSpacing: "-0.2px",
						marginTop: "22px",
					}}
				>
					<span>Validate addresses, check DNS and</span>
					<span>authentication, and design templates.</span>
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
					<span>{TOOLS.length} tools</span>
					<span style={{ color: "#d4d4d4" }}>·</span>
					<span>No signup</span>
					<span style={{ color: "#d4d4d4" }}>·</span>
					<span>Free forever</span>
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
