import { RoundedFrame, WireLine, WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function VercelAiSdkReloopNotificationsArt(_props: BlogPostArtProps) {
	return (
		<>
			<circle
				cx={220}
				cy={188}
				r={36}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.2}
			/>
			<rect
				x={316}
				y={156}
				width={96}
				height={64}
				rx={8}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.25}
			/>
			<RoundedFrame
				x={436}
				y={168}
				width={72}
				height={40}
				rx={8}
				opacity={0.3}
				accent
			/>
			<WireLine d="M 256 188 L 316 188" opacity={0.22} />
			<WireLine d="M 412 188 L 436 188" opacity={0.22} accent />
			<WireNode cx={220} cy={188} r={4} />
			<WireNode cx={364} cy={188} />
			<WireNode cx={472} cy={188} accent />
			<text
				x={220}
				y={192}
				className="fill-current font-mono text-[9px] opacity-0 dark:opacity-40"
				textAnchor="middle"
			>
				AI
			</text>
		</>
	);
}
