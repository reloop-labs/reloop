import { RoundedFrame, WireLine, WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function ReloopCoolifySetupArt(_props: BlogPostArtProps) {
	return (
		<>
			<rect
				x={196}
				y={108}
				width={208}
				height={168}
				rx={10}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.22}
			/>
			<rect
				x={220}
				y={132}
				width={72}
				height={40}
				rx={6}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.25}
			/>
			<rect
				x={308}
				y={132}
				width={72}
				height={40}
				rx={6}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.25}
			/>
			<RoundedFrame
				x={264}
				y={196}
				width={72}
				height={40}
				rx={6}
				opacity={0.3}
				accent
			/>
			<WireLine d="M 256 172 L 300 196" opacity={0.18} />
			<WireLine d="M 344 172 L 300 196" opacity={0.18} accent />
			<WireNode cx={300} cy={216} accent />
		</>
	);
}
