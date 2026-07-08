import { BroadcastRays, WireLine, WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function SendEmailCloudflareWorkersArt(_props: BlogPostArtProps) {
	return (
		<>
			<BroadcastRays cx={300} cy={188} count={6} length={56} opacity={0.14} />
			<circle
				cx={300}
				cy={188}
				r={32}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.25}
			/>
			<WireNode cx={300} cy={188} r={4} accent />
			<WireLine d="M 300 156 L 300 116" opacity={0.2} />
			<WireLine d="M 332 188 L 392 188" opacity={0.2} accent />
			<WireLine d="M 268 188 L 208 188" opacity={0.2} />
			<WireLine d="M 324 220 L 368 264" opacity={0.18} />
			<WireLine d="M 276 220 L 232 264" opacity={0.18} />
			<WireNode cx={300} cy={116} />
			<WireNode cx={392} cy={188} accent />
			<WireNode cx={208} cy={188} />
			<WireNode cx={368} cy={264} />
			<WireNode cx={232} cy={264} />
		</>
	);
}
