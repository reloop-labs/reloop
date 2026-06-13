import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

function getFontBuffer(fontName: string): ArrayBuffer | null {
	const paths = [
		path.join(process.cwd(), "public/font/openRunde", fontName),
		path.join(process.cwd(), "apps/frontend/docs/public/font/openRunde", fontName),
		path.resolve("./public/font/openRunde", fontName),
		path.resolve("./apps/frontend/docs/public/font/openRunde", fontName),
	];
	for (const p of paths) {
		try {
			if (fs.existsSync(p)) {
				const buffer = fs.readFileSync(p);
				return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
			}
		} catch (e) {
			console.error(`Failed to read font at ${p}:`, e);
		}
	}
	return null;
}

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const title = searchParams.get("title") || "API Reference";
	const description = searchParams.get("description") || "Explore the Reloop API endpoints and schemas.";
	const rawMethod = searchParams.get("method") || "GET";
	const method = rawMethod.toUpperCase();
	const pathName = searchParams.get("path") || "";

	// Configure HTTP method colors
	let methodBg = "rgba(107, 114, 128, 0.1)";
	let methodBorder = "rgba(107, 114, 128, 0.25)";
	let methodText = "#9ca3af";

	if (method === "GET") {
		methodBg = "rgba(59, 130, 246, 0.12)";
		methodBorder = "rgba(59, 130, 246, 0.3)";
		methodText = "#60a5fa";
	} else if (method === "POST") {
		methodBg = "rgba(16, 185, 129, 0.12)";
		methodBorder = "rgba(16, 185, 129, 0.3)";
		methodText = "#34d399";
	} else if (method === "PUT") {
		methodBg = "rgba(245, 158, 11, 0.12)";
		methodBorder = "rgba(245, 158, 11, 0.3)";
		methodText = "#fbbf24";
	} else if (method === "DELETE") {
		methodBg = "rgba(239, 68, 68, 0.12)";
		methodBorder = "rgba(239, 68, 68, 0.3)";
		methodText = "#f87171";
	} else if (method === "PATCH") {
		methodBg = "rgba(139, 92, 246, 0.12)";
		methodBorder = "rgba(139, 92, 246, 0.3)";
		methodText = "#c084fc";
	}

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

	return new ImageResponse(
		(
			<div
				style={{
					width: "1200px",
					height: "630px",
					display: "flex",
					flexDirection: "column",
					backgroundColor: "#070709",
					backgroundImage:
						"radial-gradient(circle at 95% 10%, rgba(217, 119, 87, 0.12) 0%, transparent 60%), radial-gradient(circle at 5% 90%, rgba(217, 119, 87, 0.1) 0%, transparent 60%)",
					padding: "48px",
					fontFamily: fonts.length > 0 ? "OpenRunde" : "sans-serif",
					position: "relative",
				}}
			>
				{/* Inner Glow Card */}
				<div
					style={{
						width: "1104px",
						height: "534px",
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
						backgroundImage:
							"linear-gradient(135deg, rgba(18, 16, 15, 0.9) 0%, rgba(10, 9, 8, 0.95) 100%)",
						border: "1px solid rgba(217, 119, 87, 0.1)",
						borderRadius: "24px",
						padding: "48px 56px",
						position: "relative",
						overflow: "hidden",
					}}
				>
					{/* Watermark Logo */}
					<svg
						width="240"
						height="240"
						viewBox="0 0 200 200"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						style={{
							position: "absolute",
							right: "-20px",
							bottom: "-30px",
							opacity: 0.05,
						}}
					>
						<rect x="55" y="51" width="83" height="8" fill="#d97757" />
						<rect
							x="55"
							y="59"
							width="75"
							height="8"
							transform="rotate(90 55 59)"
							fill="#d97757"
						/>
						<rect
							x="146"
							y="59"
							width="46"
							height="8"
							transform="rotate(90 146 59)"
							fill="#d97757"
						/>
						<rect
							x="154"
							y="69"
							width="44"
							height="8"
							transform="rotate(90 154 69)"
							fill="#d97757"
						/>
						<rect
							x="138"
							y="59"
							width="46"
							height="8"
							transform="rotate(90 138 59)"
							fill="#d97757"
						/>
						<rect
							x="130"
							y="59"
							width="46"
							height="8"
							transform="rotate(90 130 59)"
							fill="#d97757"
						/>
						<rect
							x="90"
							y="105"
							width="29"
							height="8"
							transform="rotate(90 90 105)"
							fill="#d97757"
						/>
						<rect
							x="82"
							y="105"
							width="29"
							height="8"
							transform="rotate(90 82 105)"
							fill="#d97757"
						/>
						<rect
							x="138"
							y="105"
							width="8"
							height="8"
							transform="rotate(90 138 105)"
							fill="#d97757"
						/>
						<rect
							x="146"
							y="105"
							width="8"
							height="8"
							transform="rotate(90 146 105)"
							fill="#d97757"
						/>
						<rect
							x="146"
							y="134"
							width="8"
							height="8"
							transform="rotate(90 146 134)"
							fill="#d97757"
						/>
						<rect
							x="130"
							y="105"
							width="8"
							height="8"
							transform="rotate(90 130 105)"
							fill="#d97757"
						/>
						<rect
							x="122"
							y="105"
							width="8"
							height="8"
							transform="rotate(90 122 105)"
							fill="#d97757"
						/>
						<rect
							x="98"
							y="77"
							width="10"
							height="8"
							transform="rotate(90 98 77)"
							fill="#d97757"
						/>
						<rect
							x="90"
							y="77"
							width="10"
							height="8"
							transform="rotate(90 90 77)"
							fill="#d97757"
						/>
						<rect
							x="82"
							y="77"
							width="10"
							height="8"
							transform="rotate(90 82 77)"
							fill="#d97757"
						/>
						<rect
							x="146"
							y="113"
							width="21"
							height="8"
							transform="rotate(90 146 113)"
							fill="#d97757"
						/>
						<rect
							x="154"
							y="122"
							width="20"
							height="8"
							transform="rotate(90 154 122)"
							fill="#d97757"
						/>
						<rect
							x="138"
							y="113"
							width="21"
							height="8"
							transform="rotate(90 138 113)"
							fill="#d97757"
						/>
						<rect
							x="130"
							y="113"
							width="21"
							height="8"
							transform="rotate(90 130 113)"
							fill="#d97757"
						/>
						<rect
							x="98"
							y="113"
							width="21"
							height="8"
							transform="rotate(90 98 113)"
							fill="#d97757"
						/>
						<rect x="55" y="134" width="83" height="8" fill="#d97757" />
						<rect x="63" y="142" width="83" height="8" fill="#d97757" />
					</svg>

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
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									width: "36px",
									height: "36px",
									backgroundColor: "#0d0d11",
									border: "1px solid rgba(255, 255, 255, 0.15)",
									borderRadius: "8px",
								}}
							>
								<svg
									width="22"
									height="22"
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
										fill="#8b5cf6"
									/>
									<rect
										x="130"
										y="59"
										width="46"
										height="8"
										transform="rotate(90 130 59)"
										fill="#8b5cf6"
									/>
									<rect
										x="90"
										y="105"
										width="29"
										height="8"
										transform="rotate(90 90 105)"
										fill="#8b5cf6"
									/>
									<rect
										x="82"
										y="105"
										width="29"
										height="8"
										transform="rotate(90 82 105)"
										fill="#8b5cf6"
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
										fill="#8b5cf6"
									/>
									<rect
										x="122"
										y="105"
										width="8"
										height="8"
										transform="rotate(90 122 105)"
										fill="#8b5cf6"
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
										fill="#8b5cf6"
									/>
									<rect
										x="82"
										y="77"
										width="10"
										height="8"
										transform="rotate(90 82 77)"
										fill="#8b5cf6"
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
										fill="#8b5cf6"
									/>
									<rect
										x="130"
										y="113"
										width="21"
										height="8"
										transform="rotate(90 130 113)"
										fill="#8b5cf6"
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
							</div>
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
								API Reference
							</span>
						</div>
						<div
							style={{
								fontSize: "18px",
								fontWeight: 600,
								color: "rgba(255, 255, 255, 0.35)",
								letterSpacing: "1px",
							}}
						>
							REST API
						</div>
					</div>

					{/* Center Section: Method + Path & Title + Desc */}
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							width: "100%",
							marginTop: "24px",
						}}
					>
						{/* Method & Path */}
						{pathName && (
							<div
								style={{
									display: "flex",
									alignItems: "center",
									marginBottom: "20px",
								}}
							>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										backgroundColor: methodBg,
										border: `1px solid ${methodBorder}`,
										borderRadius: "8px",
										height: "38px",
										padding: "0 16px",
									}}
								>
									<span
										style={{
											fontSize: "16px",
											fontWeight: 700,
											color: methodText,
											letterSpacing: "0.5px",
										}}
									>
										{method}
									</span>
								</div>
								<span
									style={{
										marginLeft: "16px",
										fontSize: "26px",
										fontWeight: 400,
										color: "rgba(255, 255, 255, 0.9)",
										fontFamily: "monospace",
									}}
								>
									{pathName}
								</span>
							</div>
						)}

						{/* Title */}
						<div
							style={{
								fontSize: "52px",
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
								fontSize: "22px",
								fontWeight: 400,
								color: "rgba(255, 255, 255, 0.5)",
								lineHeight: "1.5",
								marginTop: "16px",
								maxWidth: "880px",
							}}
						>
							{description}
						</div>
					</div>

					{/* Footer */}
					<div
						style={{
							display: "flex",
							justifyContent: "flex-end",
							alignItems: "center",
							width: "100%",
							borderTop: "1px solid rgba(255, 255, 255, 0.05)",
							paddingTop: "24px",
						}}
					>
						<div
							style={{
								fontSize: "18px",
								fontWeight: 600,
								color: "#d97757",
							}}
						>
							docs.reloop.sh
						</div>
					</div>
				</div>
			</div>
		),
		{
			width: 1200,
			height: 630,
			fonts,
		},
	);
}
