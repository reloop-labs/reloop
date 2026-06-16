import { ImageResponse } from "next/og";

export const alt = "Join the Reloop Community — Discord, GitHub, and X";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function PlatformTile({
	label,
	color,
	textColor = "#ffffff",
	offsetY = 0,
}: {
	label: string;
	color: string;
	textColor?: string;
	offsetY?: number;
}) {
	return (
		<div
			style={{
				display: "flex",
				width: 88,
				height: 88,
				alignItems: "center",
				justifyContent: "center",
				borderRadius: 20,
				border: "1px solid rgba(255,255,255,0.12)",
				background: color,
				color: textColor,
				fontSize: 28,
				fontWeight: 700,
				marginTop: offsetY,
			}}
		>
			{label}
		</div>
	);
}

export default function CommunityOpenGraphImage() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				backgroundColor: "#000000",
				padding: "56px 72px",
			}}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					color: "rgba(255,255,255,0.45)",
					fontSize: 22,
					fontWeight: 600,
					letterSpacing: "0.18em",
				}}
			>
				<span>RELOOP</span>
				<span>COMMUNITY</span>
			</div>

			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: 48,
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						maxWidth: 620,
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							fontSize: 64,
							lineHeight: 1.02,
							fontWeight: 600,
							color: "#ffffff",
							fontFamily: "Georgia, serif",
							letterSpacing: "-0.03em",
						}}
					>
						Join the Reloop
						<br />
						Community
					</div>
					<div
						style={{
							marginTop: 24,
							fontSize: 28,
							lineHeight: 1.45,
							color: "rgba(255,255,255,0.55)",
						}}
					>
						Open-source email infrastructure. Connect on Discord, GitHub, and X.
					</div>
					<div
						style={{
							display: "flex",
							marginTop: 32,
							gap: 16,
							fontSize: 22,
							color: "rgba(255,255,255,0.38)",
						}}
					>
						<span>Discord</span>
						<span>·</span>
						<span>GitHub</span>
						<span>·</span>
						<span>X</span>
					</div>
				</div>

				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 18,
						paddingRight: 12,
					}}
				>
					<PlatformTile label="GH" color="#181717" offsetY={28} />
					<PlatformTile label="D" color="#5865F2" offsetY={-12} />
					<PlatformTile
						label="X"
						color="#ffffff"
						textColor="#0a0a0a"
						offsetY={36}
					/>
				</div>
			</div>

			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					color: "rgba(255,255,255,0.35)",
					fontSize: 24,
				}}
			>
				<span>We&apos;d love to meet you.</span>
				<span>reloop.sh/resources/community</span>
			</div>
		</div>,
		{ ...size },
	);
}
