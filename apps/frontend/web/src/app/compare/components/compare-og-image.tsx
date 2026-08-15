import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getCompetitorByHref } from "../competitor-brands";

export const compareOgSize = { width: 1200, height: 630 };
export const compareOgContentType = "image/png";

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
	const clean = hex.replace("#", "");
	return [
		Number.parseInt(clean.slice(0, 2), 16),
		Number.parseInt(clean.slice(2, 4), 16),
		Number.parseInt(clean.slice(4, 6), 16),
	];
}

function isDarkHex(hex: string) {
	const clean = hex.replace("#", "").toLowerCase();
	if (clean === "000" || clean === "000000") return true;
	if (clean.length !== 6) return false;
	const [r, g, b] = hexToRgb(clean);
	return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.25;
}

function glowRgb(hex: string): Rgb {
	const rgb = hexToRgb(hex);
	if (!isDarkHex(hex)) return rgb;
	const [r, g, b] = rgb;
	if (r + g + b < 24) return [212, 212, 216];
	return [
		Math.min(255, Math.round(r + (255 - r) * 0.55)),
		Math.min(255, Math.round(g + (255 - g) * 0.55)),
		Math.min(255, Math.round(b + (255 - b) * 0.55)),
	];
}

function iconFill(hex: string) {
	return isDarkHex(hex) ? "#ffffff" : `#${hex.replace("#", "")}`;
}

function CtaAtmosphere({ hex }: { hex: string }) {
	const [r, g, b] = glowRgb(hex);
	const alt: Rgb = [
		Math.min(255, Math.round(r + (255 - r) * 0.22)),
		Math.min(255, Math.round(g + (255 - g) * 0.22)),
		Math.min(255, Math.round(b + (255 - b) * 0.22)),
	];

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
					backgroundImage: `radial-gradient(ellipse 110% 160% at 82% 100%, rgba(${r}, ${g}, ${b}, 0.28) 0%, transparent 62%)`,
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
					backgroundImage: `radial-gradient(ellipse 90% 140% at 6% 0%, rgba(${alt[0]}, ${alt[1]}, ${alt[2]}, 0.18) 0%, transparent 60%)`,
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
					backgroundImage: `repeating-linear-gradient(-45deg, transparent 0, transparent 3px, rgba(${r}, ${g}, ${b}, 0.14) 3px, rgba(${r}, ${g}, ${b}, 0.14) 3.55px)`,
					maskImage:
						"radial-gradient(ellipse 85% 95% at 88% 110%, black 0%, transparent 68%), radial-gradient(ellipse 70% 90% at 4% -5%, black 0%, transparent 62%)",
				}}
			/>
		</div>
	);
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
	if (!fontDir) return [];

	const [regular, semibold] = await Promise.all([
		readFile(join(fontDir, "OpenRunde-Regular.woff")),
		readFile(join(fontDir, "OpenRunde-Semibold.woff")),
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
			data: semibold,
			weight: 600 as const,
			style: "normal" as const,
		},
	];
}

export async function createCompareOgImage(pagePath: string) {
	const brand = getCompetitorByHref(pagePath);
	const name = brand?.name ?? "the competition";
	const hex = brand?.icon.hex ?? "38BDF8";
	const path = brand?.icon.path ?? "";
	const fonts = await loadFonts();

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				backgroundColor: "#000000",
				fontFamily: fonts.length ? "OpenRunde" : "sans-serif",
				position: "relative",
				overflow: "hidden",
			}}
		>
			<CtaAtmosphere hex={hex} />

			<div
				style={{
					display: "flex",
					flex: 1,
					alignItems: "center",
					justifyContent: "center",
					width: "100%",
					position: "relative",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "flex-start",
						justifyContent: "center",
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							width: "280px",
						}}
					>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								width: "240px",
								height: "240px",
							}}
						>
							{/* Logo viewBox is padded — render larger so the mark matches. */}
							<ReloopMark sizePx={400} />
						</div>
						<span
							style={{
								marginTop: "18px",
								fontSize: "36px",
								fontWeight: 600,
								letterSpacing: "-0.04em",
								color: "#ffffff",
							}}
						>
							Reloop
						</span>
					</div>

					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							width: "120px",
							height: "240px",
							fontSize: "34px",
							fontWeight: 600,
							letterSpacing: "0.08em",
							textTransform: "uppercase",
							color: "rgba(255,255,255,0.42)",
						}}
					>
						vs
					</div>

					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							width: "280px",
						}}
					>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								width: "240px",
								height: "240px",
							}}
						>
							{path ? (
								<svg
									width="220"
									height="220"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d={path} fill={iconFill(hex)} />
								</svg>
							) : null}
						</div>
						<span
							style={{
								marginTop: "18px",
								fontSize: "36px",
								fontWeight: 600,
								letterSpacing: "-0.04em",
								color: "#ffffff",
							}}
						>
							{name}
						</span>
					</div>
				</div>
			</div>

			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					width: "100%",
					padding: "36px 48px 40px",
					borderTop: "1px solid rgba(255,255,255,0.08)",
					backgroundColor: "rgba(255,255,255,0.03)",
					position: "relative",
				}}
			>
				<span
					style={{
						fontSize: "30px",
						fontWeight: 600,
						letterSpacing: "-0.03em",
						color: "rgba(255,255,255,0.82)",
					}}
				>
					See how Reloop compares against {name}
				</span>
			</div>
		</div>,
		{ ...compareOgSize, fonts },
	);
}
