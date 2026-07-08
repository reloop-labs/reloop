import { RoundedFrame, WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function TransactionalEmailBestPracticesArt(_props: BlogPostArtProps) {
	return (
		<>
			<RoundedFrame
				x={196}
				y={104}
				width={208}
				height={168}
				rx={10}
				opacity={0.2}
			/>
			{[0, 1, 2, 3].map((row) => (
				<g key={row}>
					<rect
						x={220}
						y={128 + row * 32}
						width={12}
						height={12}
						rx={2}
						fill="none"
						stroke="currentColor"
						strokeOpacity={row === 3 ? 0.32 : 0.2}
						className={
							row === 3 ? "dark:stroke-primary-base dark:opacity-80" : undefined
						}
					/>
					<line
						x1={244}
						y1={134 + row * 32}
						x2={360}
						y2={134 + row * 32}
						stroke="currentColor"
						strokeOpacity={0.12}
					/>
				</g>
			))}
			<WireNode cx={226} cy={224} accent />
		</>
	);
}
