import { ImageResponse } from "next/og";

export const alt = "Reloop License — Apache 2.0 with Reloop Labs Terms";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CheckIcon = () => (
	<svg
		width="14"
		height="10"
		viewBox="0 0 14 10"
		fill="none"
		style={{ display: "flex" }}
	>
		<path
			d="M1 5L4.5 8.5L13 1"
			stroke="#4ade80"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const CrossIcon = () => (
	<svg
		width="10"
		height="10"
		viewBox="0 0 10 10"
		fill="none"
		style={{ display: "flex" }}
	>
		<path
			d="M1 1L9 9M9 1L1 9"
			stroke="#f87171"
			strokeWidth="2.5"
			strokeLinecap="round"
		/>
	</svg>
);

export default function LicenseOpenGraphImage() {
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
			{/* Top Header */}
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
				<span>LICENSE</span>
			</div>

			{/* Main Content Area */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: 48,
				}}
			>
				{/* Left side text info */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						maxWidth: 580,
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							fontSize: 64,
							lineHeight: 1.05,
							fontWeight: 600,
							color: "#ffffff",
							fontFamily: "Georgia, serif",
							letterSpacing: "-0.03em",
						}}
					>
						Apache 2.0
						<span style={{ color: "#d97757", marginTop: 4 }}>
							License Terms
						</span>
					</div>
					<div
						style={{
							marginTop: 24,
							fontSize: 26,
							lineHeight: 1.45,
							color: "rgba(255,255,255,0.55)",
						}}
					>
						Reloop is open-source and self-hostable with additional terms from
						Reloop Labs for commercial hosting.
					</div>
					<div
						style={{
							display: "flex",
							marginTop: 32,
							gap: 16,
							fontSize: 20,
							color: "rgba(255,255,255,0.38)",
						}}
					>
						<span>Self-Hostable</span>
						<span>·</span>
						<span>Hosted Service</span>
						<span>·</span>
						<span>Apache 2.0</span>
					</div>
				</div>

				{/* Right side bento preview */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						width: 440,
						borderRadius: 24,
						border: "1px solid rgba(255, 255, 255, 0.08)",
						background: "rgba(255, 255, 255, 0.02)",
						padding: 32,
						gap: 20,
					}}
				>
					<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
						<div
							style={{
								fontSize: 13,
								fontWeight: 700,
								color: "#d97757",
								letterSpacing: "0.1em",
							}}
						>
							PERMITTED
						</div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 14,
								fontSize: 18,
								color: "rgba(255,255,255,0.85)",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									width: 24,
									height: 24,
									borderRadius: "50%",
									background: "rgba(34, 197, 94, 0.15)",
								}}
							>
								<CheckIcon />
							</div>
							<span>Personal Projects & Learning</span>
						</div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 14,
								fontSize: 18,
								color: "rgba(255,255,255,0.85)",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									width: 24,
									height: 24,
									borderRadius: "50%",
									background: "rgba(34, 197, 94, 0.15)",
								}}
							>
								<CheckIcon />
							</div>
							<span>Internal Organization Use</span>
						</div>
					</div>

					<div style={{ height: 1, background: "rgba(255, 255, 255, 0.08)" }} />

					<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
						<div
							style={{
								fontSize: 13,
								fontWeight: 700,
								color: "rgba(255,255,255,0.4)",
								letterSpacing: "0.1em",
							}}
						>
							RESTRICTED
						</div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 14,
								fontSize: 18,
								color: "rgba(255,255,255,0.65)",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									width: 24,
									height: 24,
									borderRadius: "50%",
									background: "rgba(239, 68, 68, 0.15)",
								}}
							>
								<CrossIcon />
							</div>
							<span>Commercial SaaS / PaaS hosting</span>
						</div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 14,
								fontSize: 18,
								color: "rgba(255,255,255,0.65)",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									width: 24,
									height: 24,
									borderRadius: "50%",
									background: "rgba(239, 68, 68, 0.15)",
								}}
							>
								<CrossIcon />
							</div>
							<span>Compete commercially with Reloop</span>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Footer */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					color: "rgba(255,255,255,0.35)",
					fontSize: 24,
				}}
			>
				<span>Apache 2.0 with custom restrictions.</span>
				<span>reloop.sh/company/license</span>
			</div>
		</div>,
		{ ...size },
	);
}
