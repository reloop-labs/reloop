import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siNpm, siPnpm, siYarn } from "simple-icons";
import { getLanguage } from "../languages";

export const alt = "Send email with Reloop";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#000000";
const TEXT = "#f5f5f4";
const MUTED = "rgba(245, 245, 244, 0.58)";
const FAINT = "rgba(245, 245, 244, 0.38)";
const LINE = "rgba(255, 255, 255, 0.10)";
const WINDOW = "#0c0c0e";
const INNER = "#09090b";
const CODE = "rgba(245, 245, 244, 0.90)";

const NODE_TABS = [
	{ id: "npm", label: "npm", icon: siNpm },
	{ id: "pnpm", label: "pnpm", icon: siPnpm },
	{ id: "yarn", label: "yarn", icon: siYarn },
	{ id: "bun", label: "bun", icon: null },
] as const;

function iconFill(hex: string): string {
	const clean = hex.replace("#", "");
	if (clean.length !== 6) return "#ffffff";
	const r = Number.parseInt(clean.slice(0, 2), 16);
	const g = Number.parseInt(clean.slice(2, 4), 16);
	const b = Number.parseInt(clean.slice(4, 6), 16);
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance < 0.35 ? "#ffffff" : `#${clean}`;
}

/** Same bloom as BlogCta — lift black marks so the glow still reads. */
function glowRgb(hex: string): [number, number, number] {
	const clean = hex.replace("#", "");
	if (clean.length !== 6) return [56, 189, 248];
	const r = Number.parseInt(clean.slice(0, 2), 16);
	const g = Number.parseInt(clean.slice(2, 4), 16);
	const b = Number.parseInt(clean.slice(4, 6), 16);
	if (
		clean.toLowerCase() === "000000" ||
		(0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.25
	) {
		return [212, 212, 216];
	}
	return [r, g, b];
}

function CtaAtmosphere({ hex }: { hex: string }) {
	const [r, g, b] = glowRgb(hex);
	return (
		<div
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				display: "flex",
			}}
		>
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					display: "flex",
					backgroundImage: `radial-gradient(ellipse 110% 160% at 82% 100%, rgba(${r}, ${g}, ${b}, 0.3) 0%, transparent 62%)`,
				}}
			/>
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					display: "flex",
					backgroundImage: `radial-gradient(ellipse 90% 140% at 6% 0%, rgba(${r}, ${g}, ${b}, 0.22) 0%, transparent 60%)`,
				}}
			/>
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					display: "flex",
					backgroundImage: `repeating-linear-gradient(-45deg, transparent 0, transparent 3px, rgba(${r}, ${g}, ${b}, 0.16) 3px, rgba(${r}, ${g}, ${b}, 0.16) 3.55px)`,
					maskImage:
						"radial-gradient(ellipse 85% 95% at 88% 110%, black 0%, transparent 68%), radial-gradient(ellipse 70% 90% at 4% -5%, black 0%, transparent 62%)",
				}}
			/>
		</div>
	);
}

async function loadFonts() {
	const candidates = [
		join(process.cwd(), "public/font/openRunde"),
		join(process.cwd(), "apps/frontend/web/public/font/openRunde"),
	];

	let fontDir: string | null = null;
	for (const dir of candidates) {
		try {
			await readFile(join(dir, "OpenRunde-Regular.woff"));
			fontDir = dir;
			break;
		} catch {
			// try next
		}
	}
	if (!fontDir) {
		throw new Error("OpenRunde fonts not found");
	}

	const [regular, medium, semibold, bold] = await Promise.all([
		readFile(join(fontDir, "OpenRunde-Regular.woff")),
		readFile(join(fontDir, "OpenRunde-Medium.woff")),
		readFile(join(fontDir, "OpenRunde-Semibold.woff")),
		readFile(join(fontDir, "OpenRunde-Bold.woff")),
	]);

	return [
		{
			name: "OpenRunde",
			data: regular,
			weight: 400 as const,
			style: "normal" as const,
		},
		{
			name: "OpenRunde",
			data: medium,
			weight: 500 as const,
			style: "normal" as const,
		},
		{
			name: "OpenRunde",
			data: semibold,
			weight: 600 as const,
			style: "normal" as const,
		},
		{
			name: "OpenRunde",
			data: bold,
			weight: 700 as const,
			style: "normal" as const,
		},
	];
}

function ReloopMark({ sizePx }: { sizePx: number }) {
	return (
		<svg
			width={sizePx}
			height={sizePx}
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
				fill="#878787"
			/>
			<rect
				x="130"
				y="59"
				width="46"
				height="8"
				transform="rotate(90 130 59)"
				fill="#878787"
			/>
			<rect
				x="90"
				y="105"
				width="29"
				height="8"
				transform="rotate(90 90 105)"
				fill="#878787"
			/>
			<rect
				x="82"
				y="105"
				width="29"
				height="8"
				transform="rotate(90 82 105)"
				fill="#878787"
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
				fill="#878787"
			/>
			<rect
				x="122"
				y="105"
				width="8"
				height="8"
				transform="rotate(90 122 105)"
				fill="#878787"
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
				fill="#878787"
			/>
			<rect
				x="82"
				y="77"
				width="10"
				height="8"
				transform="rotate(90 82 77)"
				fill="#878787"
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
				fill="#878787"
			/>
			<rect
				x="130"
				y="113"
				width="21"
				height="8"
				transform="rotate(90 130 113)"
				fill="#878787"
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
	);
}

function CopyIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect
				x="9"
				y="9"
				width="13"
				height="13"
				rx="2"
				stroke="rgba(255,255,255,0.45)"
				strokeWidth="2"
			/>
			<path
				d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
				stroke="rgba(255,255,255,0.45)"
				strokeWidth="2"
			/>
		</svg>
	);
}

export default async function Image({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const language = getLanguage(slug);
	const fonts = await loadFonts();

	const name = language?.name ?? "SDKs";
	const description =
		language?.shortDescription ??
		"Official Reloop email SDKs for your language.";
	const install = language?.installCommand ?? "npm install reloop-email";
	const packageName = language?.packageName ?? "reloop-email";
	const isNode = language?.slug === "nodejs";
	const iconPath =
		language && "path" in language.icon ? language.icon.path : "";
	const brandFill = language ? iconFill(language.icon.hex) : "#ffffff";
	const accentHex = language?.icon.hex ?? "38BDF8";

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				backgroundColor: BG,
				fontFamily: "OpenRunde",
				color: TEXT,
				position: "relative",
				overflow: "hidden",
			}}
		>
			<CtaAtmosphere hex={accentHex} />
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					width: "100%",
					height: "100%",
					padding: "44px 56px 40px",
					position: "relative",
				}}
			>
				{/* Page breadcrumb bar */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						width: "100%",
					}}
				>
					<div style={{ display: "flex", alignItems: "center" }}>
						<ReloopMark sizePx={36} />
						<span
							style={{
								marginLeft: "14px",
								fontSize: "14px",
								fontWeight: 500,
								letterSpacing: "0.14em",
								textTransform: "uppercase",
								color: FAINT,
							}}
						>
							SDKs
						</span>
						<span
							style={{
								marginLeft: "10px",
								fontSize: "14px",
								color: "rgba(255,255,255,0.22)",
							}}
						>
							/
						</span>
						<span
							style={{
								marginLeft: "10px",
								fontSize: "14px",
								fontWeight: 500,
								letterSpacing: "0.14em",
								textTransform: "uppercase",
								color: MUTED,
							}}
						>
							{name}
						</span>
					</div>
					<span
						style={{
							fontSize: "14px",
							fontWeight: 500,
							letterSpacing: "0.12em",
							textTransform: "uppercase",
							color: FAINT,
						}}
					>
						[{packageName}]
					</span>
				</div>

				{/* Header: icon left, title + description right */}
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "flex-start",
						width: "100%",
						marginTop: "36px",
					}}
				>
					{iconPath ? (
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								width: "88px",
								height: "88px",
								borderRadius: "22px",
								border: `1px solid ${LINE}`,
								backgroundColor: "#0a0a0a",
								flexShrink: 0,
								marginRight: "24px",
							}}
						>
							<svg
								width="44"
								height="44"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d={iconPath} fill={brandFill} />
							</svg>
						</div>
					) : null}
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							flex: 1,
							minWidth: 0,
						}}
					>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								height: "88px",
								fontSize: "52px",
								fontWeight: 600,
								letterSpacing: "-0.04em",
								lineHeight: 1,
							}}
						>
							{name}
						</div>
						<span
							style={{
								marginTop: "8px",
								fontSize: "20px",
								fontWeight: 400,
								color: MUTED,
								lineHeight: 1.45,
								letterSpacing: "-0.015em",
							}}
						>
							{description}
						</span>
					</div>
				</div>

				{/* Install window — same chrome as the page code UI */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						width: "100%",
						marginTop: "40px",
						backgroundColor: WINDOW,
						border: `1px solid ${LINE}`,
						borderRadius: "18px",
						overflow: "hidden",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							padding: isNode ? "0 16px 0 8px" : "12px 16px",
						}}
					>
						{isNode ? (
							<div style={{ display: "flex", alignItems: "center" }}>
								{NODE_TABS.map((tab) => {
									const active = tab.id === "npm";
									return (
										<div
											key={tab.id}
											style={{
												display: "flex",
												alignItems: "center",
												padding: "14px 16px",
												borderBottom: active
													? "2px solid #CB3837"
													: "2px solid transparent",
											}}
										>
											{tab.icon ? (
												<svg
													width="14"
													height="14"
													viewBox="0 0 24 24"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path d={tab.icon.path} fill={`#${tab.icon.hex}`} />
												</svg>
											) : (
												<div
													style={{
														width: "10px",
														height: "10px",
														borderRadius: "99px",
														backgroundColor: "#F472B6",
													}}
												/>
											)}
											<span
												style={{
													marginLeft: "8px",
													fontSize: "15px",
													fontWeight: 500,
													color: active ? TEXT : "rgba(255,255,255,0.55)",
												}}
											>
												{tab.label}
											</span>
										</div>
									);
								})}
							</div>
						) : (
							<div style={{ display: "flex", alignItems: "center" }}>
								<span
									style={{
										fontSize: "14px",
										fontWeight: 500,
										color: "rgba(255,255,255,0.5)",
										letterSpacing: "0.02em",
									}}
								>
									bash
								</span>
							</div>
						)}
						<CopyIcon />
					</div>

					<div
						style={{
							display: "flex",
							alignItems: "center",
							margin: "0 2px 2px",
							backgroundColor: INNER,
							border: "1px solid rgba(255,255,255,0.08)",
							borderRadius: "16px",
							padding: "22px 24px",
						}}
					>
						<span
							style={{
								fontSize: "22px",
								fontWeight: 500,
								color: CODE,
								letterSpacing: "-0.015em",
								whiteSpace: "pre",
							}}
						>
							{install.replaceAll(" ", "\u00A0")}
						</span>
					</div>
				</div>
			</div>
		</div>,
		{ ...size, fonts },
	);
}
