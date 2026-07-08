import { WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function SelfHostEmail5DollarsArt(_props: BlogPostArtProps) {
	return (
		<>
			<rect
				x={252}
				y={120}
				width={96}
				height={120}
				rx={8}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.25}
			/>
			<line
				x1={268}
				y1={148}
				x2={332}
				y2={148}
				stroke="currentColor"
				strokeOpacity={0.14}
			/>
			<line
				x1={268}
				y1={164}
				x2={316}
				y2={164}
				stroke="currentColor"
				strokeOpacity={0.12}
			/>
			<circle
				cx={300}
				cy={200}
				r={16}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.2}
			/>
			<WireNode cx={300} cy={200} r={3} accent />
			<text
				x={300}
				y={268}
				className="fill-current font-mono text-[11px] opacity-25 dark:opacity-45"
				textAnchor="middle"
			>
				$5
			</text>
		</>
	);
}
