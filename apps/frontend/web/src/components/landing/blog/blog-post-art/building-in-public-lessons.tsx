import {
	BroadcastRays,
	DocLines,
	RoundedFrame,
	WireLine,
	WireNode,
} from "./primitives";
import type { BlogPostArtProps } from "./types";

export function BuildingInPublicLessonsArt(_props: BlogPostArtProps) {
	return (
		<>
			<BroadcastRays cx={300} cy={188} count={8} length={42} opacity={0.1} />

			<RoundedFrame x={148} y={72} width={304} height={196} rx={12} opacity={0.28} />

			<WireLine
				d="M 188 228 C 228 208, 252 188, 276 168 S 324 128, 368 108"
				opacity={0.22}
			/>
			<WireLine
				d="M 328 128 L 368 108"
				opacity={0.18}
				accent
			/>

			<WireNode cx={188} cy={228} />
			<WireNode cx={228} cy={204} />
			<WireNode cx={276} cy={168} />
			<WireNode cx={328} cy={128} />
			<WireNode cx={368} cy={108} accent />

			<DocLines x={172} y={96} widths={[52, 40, 48]} />

			<line
				x1={148}
				y1={118}
				x2={452}
				y2={118}
				stroke="currentColor"
				strokeOpacity={0.1}
				strokeWidth="1"
			/>
		</>
	);
}
