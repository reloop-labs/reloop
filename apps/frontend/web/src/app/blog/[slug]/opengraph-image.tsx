import { getPost } from "@reloop/web/lib/landing/blog/source";
import { ImageResponse } from "next/og";

export const alt = "Reloop Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
	params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: Props) {
	const { slug } = await params;
	const post = getPost(slug);
	const primaryColor = "#d97757";
	const title = post?.title ?? "Reloop Blog";
	const category = post?.category ?? "Blog";

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
				<span
					style={{
						fontSize: "18px",
						color: primaryColor,
						fontWeight: 600,
						marginBottom: "16px",
					}}
				>
					{category}
				</span>
				<span
					style={{
						fontSize: "52px",
						fontWeight: 700,
						color: "#ffffff",
						letterSpacing: "-1.5px",
						lineHeight: 1.1,
						maxWidth: "1000px",
					}}
				>
					{title}
				</span>
			</div>
			<span style={{ fontSize: "14px", fontWeight: 600, color: primaryColor }}>
				reloop.sh/blog
			</span>
		</div>,
		{ ...size },
	);
}
