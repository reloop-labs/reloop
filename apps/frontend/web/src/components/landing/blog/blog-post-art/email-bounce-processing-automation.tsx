import { WireLine, WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function EmailBounceProcessingAutomationArt(_props: BlogPostArtProps) {
	return (
		<>
			<WireLine d="M 168 188 L 300 188 L 432 188" opacity={0.2} />
			<path
				d="M 432 188 Q 480 188, 480 236 Q 480 284, 432 284 L 300 284"
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.22}
				strokeDasharray="4 4"
			/>
			<WireLine d="M 300 284 L 168 284 L 168 188" opacity={0.18} accent />
			<rect
				x={276}
				y={160}
				width={48}
				height={56}
				rx={6}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.28}
			/>
			<WireNode cx={168} cy={188} />
			<WireNode cx={300} cy={188} r={4} />
			<WireNode cx={432} cy={188} />
			<WireNode cx={300} cy={284} accent />
		</>
	);
}
