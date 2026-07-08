import type { BlogPostArtProps } from "./types";

export function BuildingInPublicLessonsArt(_props: BlogPostArtProps) {
	return (
		<>
			{/* Light Mode Image */}
			<image
				href="/blog/images/building-in-public-lessons-light.png"
				x={0}
				y={0}
				width={600}
				height={375}
				preserveAspectRatio="xMidYMid slice"
				className="dark:hidden"
			/>
			{/* Dark Mode Image */}
			<image
				href="/blog/images/building-in-public-lessons-dark.png"
				x={0}
				y={0}
				width={600}
				height={375}
				preserveAspectRatio="xMidYMid slice"
				className="hidden dark:block"
			/>
		</>
	);
}
