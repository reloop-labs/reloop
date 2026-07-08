import { RoundedFrame, WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function BimiEmailSetupGuideArt(_props: BlogPostArtProps) {
	return (
		<>
			<RoundedFrame
				x={188}
				y={96}
				width={224}
				height={184}
				rx={12}
				opacity={0.24}
			/>
			<rect
				x={248}
				y={148}
				width={104}
				height={80}
				rx={8}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.3}
			/>
			<circle
				cx={300}
				cy={176}
				r={20}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.2}
			/>
			<WireNode cx={300} cy={176} r={4} accent />
			<line
				x1={212}
				y1={128}
				x2={268}
				y2={128}
				stroke="currentColor"
				strokeOpacity={0.14}
			/>
			<line
				x1={212}
				y1={140}
				x2={248}
				y2={140}
				stroke="currentColor"
				strokeOpacity={0.12}
			/>
		</>
	);
}
