import { WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function HowWeBuiltEmailDeliveryQueueBullmqArt(_props: BlogPostArtProps) {
	const layers = [
		{ y: 248, w: 240 },
		{ y: 208, w: 200 },
		{ y: 168, w: 160 },
		{ y: 128, w: 120 },
	];

	return (
		<>
			{layers.map((layer, index) => (
				<rect
					key={layer.y}
					x={300 - layer.w / 2}
					y={layer.y}
					width={layer.w}
					height={32}
					rx={6}
					fill="none"
					stroke="currentColor"
					strokeOpacity={index === layers.length - 1 ? 0.32 : 0.18}
					className={index === layers.length - 1 ? "dark:stroke-primary-base dark:opacity-80" : undefined}
				/>
			))}
			<WireNode cx={300} cy={144} r={4} accent />
			<line x1={300} y1={160} x2={300} y2={248} stroke="currentColor" strokeOpacity={0.12} strokeDasharray="3 4" />
		</>
	);
}
