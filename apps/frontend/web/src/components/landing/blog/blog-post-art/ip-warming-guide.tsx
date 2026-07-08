import { WireLine, WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function IpWarmingGuideArt(_props: BlogPostArtProps) {
	const bars = [
		{ x: 188, h: 48 },
		{ x: 236, h: 72 },
		{ x: 284, h: 96 },
		{ x: 332, h: 124 },
		{ x: 380, h: 156 },
	];

	return (
		<>
			<line
				x1={160}
				y1={280}
				x2={440}
				y2={280}
				stroke="currentColor"
				strokeOpacity={0.12}
			/>
			{bars.map((bar, index) => (
				<g key={bar.x}>
					<rect
						x={bar.x}
						y={280 - bar.h}
						width={36}
						height={bar.h}
						rx={4}
						fill="none"
						stroke="currentColor"
						strokeOpacity={index === bars.length - 1 ? 0.35 : 0.2}
						className={
							index === bars.length - 1
								? "dark:stroke-primary-base dark:opacity-80"
								: undefined
						}
					/>
					<WireNode
						cx={bar.x + 18}
						cy={280 - bar.h}
						r={index === bars.length - 1 ? 3 : 2}
						accent={index === bars.length - 1}
					/>
				</g>
			))}
			<WireLine
				d="M 206 232 L 254 208 L 302 184 L 350 160 L 398 136"
				opacity={0.18}
				accent
			/>
		</>
	);
}
