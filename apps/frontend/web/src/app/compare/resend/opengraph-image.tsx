import { ImageResponse } from "next/og";

export const alt = "Reloop vs Resend";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				backgroundColor: "#f7f7f5",
				padding: "56px",
				fontFamily: "Georgia, serif",
			}}
		>
			<div style={{ display: "flex", flexDirection: "column" }}>
				<span
					style={{
						fontSize: "14px",
						letterSpacing: "0.14em",
						textTransform: "uppercase",
						color: "rgba(0,0,0,0.45)",
						fontFamily: "sans-serif",
					}}
				>
					Compare
				</span>
				<div
					style={{
						fontSize: "58px",
						fontWeight: 700,
						color: "#111",
						marginTop: "18px",
						letterSpacing: "-0.04em",
						lineHeight: 1.05,
					}}
				>
					Reloop vs Resend
				</div>
				<div
					style={{
						fontSize: "22px",
						color: "rgba(0,0,0,0.5)",
						marginTop: "18px",
						fontFamily: "sans-serif",
						maxWidth: "820px",
						lineHeight: 1.4,
					}}
				>
					Own MTA vs Amazon SES. Self-hosting, agent inbox, and developer
					email—compared honestly.
				</div>
			</div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-end",
					fontFamily: "sans-serif",
				}}
			>
				<span style={{ fontSize: "16px", color: "rgba(0,0,0,0.4)" }}>
					reloop.sh/compare/resend
				</span>
				<span
					style={{
						fontSize: "14px",
						fontWeight: 600,
						color: "#d97757",
						letterSpacing: "0.04em",
					}}
				>
					RELOOP
				</span>
			</div>
		</div>,
		{ ...size },
	);
}
