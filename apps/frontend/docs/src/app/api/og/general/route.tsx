import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function getFontBuffer(fontName: string): ArrayBuffer | null {
	const paths = [
		path.join(process.cwd(), "public/font/openRunde", fontName),
		path.join(
			process.cwd(),
			"apps/frontend/docs/public/font/openRunde",
			fontName,
		),
		path.resolve("./public/font/openRunde", fontName),
		path.resolve("./apps/frontend/docs/public/font/openRunde", fontName),
	];
	for (const p of paths) {
		try {
			if (fs.existsSync(p)) {
				const buffer = fs.readFileSync(p);
				return buffer.buffer.slice(
					buffer.byteOffset,
					buffer.byteOffset + buffer.byteLength,
				);
			}
		} catch (e) {
			console.error(`Failed to read font at ${p}:`, e);
		}
	}
	return null;
}

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const title = searchParams.get("title") || "Documentation";
	const description =
		searchParams.get("description") ||
		"Reloop developer documentation and integration guides.";
	const category = searchParams.get("category") || "Documentation";

	// Prepare fonts
	const fonts = [];
	const regularFontData = getFontBuffer("OpenRunde-Regular.woff");
	const semiboldFontData = getFontBuffer("OpenRunde-Semibold.woff");
	const boldFontData = getFontBuffer("OpenRunde-Bold.woff");

	if (regularFontData) {
		fonts.push({
			name: "OpenRunde",
			data: regularFontData,
			weight: 400 as const,
			style: "normal" as const,
		});
	}
	if (semiboldFontData) {
		fonts.push({
			name: "OpenRunde",
			data: semiboldFontData,
			weight: 600 as const,
			style: "normal" as const,
		});
	}
	if (boldFontData) {
		fonts.push({
			name: "OpenRunde",
			data: boldFontData,
			weight: 700 as const,
			style: "normal" as const,
		});
	}

	const primaryColor = "#d97757";

	return new ImageResponse(
		<div
			style={{
				width: "1200px",
				height: "630px",
				display: "flex",
				flexDirection: "column",
				backgroundColor: "#000000",
				backgroundImage:
					"radial-gradient(circle at 95% 10%, rgba(217, 119, 87, 0.15) 0%, transparent 60%), radial-gradient(circle at 5% 90%, rgba(217, 119, 87, 0.15) 0%, transparent 60%)",
				padding: "48px",
				fontFamily: fonts.length > 0 ? "OpenRunde" : "sans-serif",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* Bottom Right Watermark */}
			<svg
				width="320"
				height="320"
				viewBox="0 0 200 200"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				style={{
					position: "absolute",
					right: "-50px",
					bottom: "-50px",
					opacity: 0.08,
				}}
			>
				<rect x="55" y="51" width="83" height="8" fill={primaryColor} />
				<rect
					x="55"
					y="59"
					width="75"
					height="8"
					transform="rotate(90 55 59)"
					fill={primaryColor}
				/>
				<rect
					x="146"
					y="59"
					width="46"
					height="8"
					transform="rotate(90 146 59)"
					fill={primaryColor}
				/>
				<rect
					x="154"
					y="69"
					width="44"
					height="8"
					transform="rotate(90 154 69)"
					fill={primaryColor}
				/>
				<rect
					x="138"
					y="59"
					width="46"
					height="8"
					transform="rotate(90 138 59)"
					fill={primaryColor}
				/>
				<rect
					x="130"
					y="59"
					width="46"
					height="8"
					transform="rotate(90 130 59)"
					fill={primaryColor}
				/>
				<rect
					x="90"
					y="105"
					width="29"
					height="8"
					transform="rotate(90 90 105)"
					fill={primaryColor}
				/>
				<rect
					x="82"
					y="105"
					width="29"
					height="8"
					transform="rotate(90 82 105)"
					fill={primaryColor}
				/>
				<rect
					x="138"
					y="105"
					width="8"
					height="8"
					transform="rotate(90 138 105)"
					fill={primaryColor}
				/>
				<rect
					x="146"
					y="105"
					width="8"
					height="8"
					transform="rotate(90 146 105)"
					fill={primaryColor}
				/>
				<rect
					x="146"
					y="134"
					width="8"
					height="8"
					transform="rotate(90 146 134)"
					fill={primaryColor}
				/>
				<rect
					x="130"
					y="105"
					width="8"
					height="8"
					transform="rotate(90 130 105)"
					fill={primaryColor}
				/>
				<rect
					x="122"
					y="105"
					width="8"
					height="8"
					transform="rotate(90 122 105)"
					fill={primaryColor}
				/>
				<rect
					x="98"
					y="77"
					width="10"
					height="8"
					transform="rotate(90 98 77)"
					fill={primaryColor}
				/>
				<rect
					x="90"
					y="77"
					width="10"
					height="8"
					transform="rotate(90 90 77)"
					fill={primaryColor}
				/>
				<rect
					x="82"
					y="77"
					width="10"
					height="8"
					transform="rotate(90 82 77)"
					fill={primaryColor}
				/>
				<rect
					x="146"
					y="113"
					width="21"
					height="8"
					transform="rotate(90 146 113)"
					fill={primaryColor}
				/>
				<rect
					x="154"
					y="122"
					width="20"
					height="8"
					transform="rotate(90 154 122)"
					fill={primaryColor}
				/>
				<rect
					x="138"
					y="113"
					width="21"
					height="8"
					transform="rotate(90 138 113)"
					fill={primaryColor}
				/>
				<rect
					x="130"
					y="113"
					width="21"
					height="8"
					transform="rotate(90 130 113)"
					fill={primaryColor}
				/>
				<rect
					x="98"
					y="113"
					width="21"
					height="8"
					transform="rotate(90 98 113)"
					fill={primaryColor}
				/>
				<rect x="55" y="134" width="83" height="8" fill={primaryColor} />
				<rect x="63" y="142" width="83" height="8" fill={primaryColor} />
			</svg>

			{/* Layout Container */}
			<div
				style={{
					width: "1104px",
					height: "534px",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					backgroundColor: "transparent",
					border: "none",
					borderRadius: "24px",
					padding: "48px 56px",
				}}
			>
				{/* Header */}
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						width: "100%",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "14px",
						}}
					>
						<svg
							width="58"
							height="58"
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
						<span
							style={{
								fontSize: "24px",
								fontWeight: 600,
								color: "#ffffff",
								letterSpacing: "-0.5px",
								marginLeft: "8px",
							}}
						>
							Reloop
						</span>
						<span
							style={{
								fontSize: "24px",
								fontWeight: 400,
								color: "rgba(255, 255, 255, 0.4)",
								letterSpacing: "-0.5px",
								marginLeft: "8px",
							}}
						>
							/
						</span>
						<span
							style={{
								fontSize: "24px",
								fontWeight: 500,
								color: "rgba(255, 255, 255, 0.6)",
								letterSpacing: "-0.5px",
								marginLeft: "8px",
							}}
						>
							{category}
						</span>
					</div>
					<div
						style={{
							display: "flex",
							fontSize: "18px",
							fontWeight: 600,
							color: "rgba(255, 255, 255, 0.35)",
							letterSpacing: "1px",
						}}
					>
						DOCS
					</div>
				</div>

				{/* Center Section: Title & Description */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						width: "100%",
						marginTop: "48px",
					}}
				>
					{/* Title */}
					<div
						style={{
							display: "flex",
							fontSize: "64px",
							fontWeight: 700,
							color: "#ffffff",
							letterSpacing: "-1.5px",
							lineHeight: "1.1",
						}}
					>
						{title}
					</div>

					{/* Description */}
					<div
						style={{
							display: "flex",
							fontSize: "24px",
							fontWeight: 400,
							color: "rgba(255, 255, 255, 0.55)",
							lineHeight: "1.5",
							marginTop: "20px",
							maxWidth: "920px",
						}}
					>
						{description}
					</div>
				</div>

				{/* Footer */}
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						width: "100%",
						paddingTop: "24px",
					}}
				>
					<div
						style={{
							fontSize: "18px",
							fontWeight: 500,
							color: "rgba(255, 255, 255, 0.3)",
						}}
					>
						Modern email infrastructure for developers
					</div>
					<div
						style={{
							fontSize: "18px",
							fontWeight: 600,
							color: primaryColor,
						}}
					>
						reloop.sh/docs
					</div>
				</div>
			</div>
		</div>,
		{
			width: 1200,
			height: 630,
			fonts,
		},
	);
}
