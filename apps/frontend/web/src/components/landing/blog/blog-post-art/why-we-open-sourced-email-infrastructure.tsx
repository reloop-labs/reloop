import { BroadcastRays, RoundedFrame, WireLine, WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function WhyWeOpenSourcedEmailInfrastructureArt(
	_props: BlogPostArtProps,
) {
	return (
		<>
			<BroadcastRays cx={300} cy={188} count={6} length={48} />
			<circle
				cx={300}
				cy={188}
				r={44}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.2}
			/>
			<WireNode cx={300} cy={188} r={4} accent />
			<WireLine d="M 300 144 L 300 108" opacity={0.2} />
			<WireLine d="M 336 188 L 372 188" opacity={0.2} />
			<WireLine d="M 264 188 L 228 188" opacity={0.2} />
			<WireLine d="M 324 156 L 356 124" opacity={0.2} />
			<WireLine d="M 276 156 L 244 124" opacity={0.2} />
			<WireNode cx={300} cy={108} />
			<WireNode cx={372} cy={188} />
			<WireNode cx={228} cy={188} />
			<WireNode cx={356} cy={124} />
			<WireNode cx={244} cy={124} />
			<RoundedFrame
				x={196}
				y={248}
				width={208}
				height={72}
				rx={8}
				opacity={0.18}
			/>
		</>
	);
}
