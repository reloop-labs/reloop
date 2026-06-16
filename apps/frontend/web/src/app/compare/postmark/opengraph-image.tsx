import { ImageResponse } from "next/og";

export const alt = "Reloop vs Postmark";
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
				backgroundColor: "#000000",
				padding: "56px",
				fontFamily: "sans-serif",
			}}
		>
			<div style={{ display: "flex", flexDirection: "column" }}>
				<span style={{ fontSize: "22px", color: "rgba(255,255,255,0.5)" }}>
					Reloop / Compare
				</span>
				<div
					style={{
						fontSize: "52px",
						fontWeight: 700,
						color: "#fff",
						marginTop: "20px",
					}}
				>
					Reloop vs Postmark
				</div>
				<div
					style={{
						fontSize: "18px",
						color: "rgba(255,255,255,0.5)",
						marginTop: "12px",
					}}
				>
					Transactional specialists vs full-stack email.
				</div>
			</div>
			<span style={{ fontSize: "14px", fontWeight: 600, color: "#d97757" }}>
				reloop.sh
			</span>
		</div>,
		{ ...size },
	);
}
