import { RoundedFrame, WireLine, WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function WhyEmailsLandInSpamFixArt(_props: BlogPostArtProps) {
	return (
		<>
			<RoundedFrame x={168} y={88} width={264} height={200} rx={10} opacity={0.22} />
			<path
				d="M 220 248 L 300 148 L 380 248 Z"
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.15}
				strokeWidth="1"
			/>
			<WireLine d="M 220 248 L 300 168" opacity={0.25} accent />
			<WireLine d="M 300 168 L 380 248" opacity={0.2} />
			<line x1={168} y1={288} x2={432} y2={288} stroke="currentColor" strokeOpacity={0.12} />
			<WireNode cx={220} cy={248} />
			<WireNode cx={300} cy={168} accent />
			<WireNode cx={380} cy={248} />
			<rect x={276} y={108} width={48} height={32} rx={4} fill="none" stroke="currentColor" strokeOpacity={0.25} />
		</>
	);
}
