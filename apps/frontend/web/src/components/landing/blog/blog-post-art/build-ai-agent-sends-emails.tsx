import { BroadcastRays, WireLine, WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function BuildAiAgentSendsEmailsArt(_props: BlogPostArtProps) {
	return (
		<>
			<BroadcastRays cx={300} cy={188} count={5} length={40} opacity={0.12} />
			<rect x={252} y={148} width={96} height={80} rx={10} fill="none" stroke="currentColor" strokeOpacity={0.25} />
			<WireLine d="M 300 148 L 300 116" opacity={0.2} />
			<WireLine d="M 348 188 L 408 188" opacity={0.22} accent />
			<WireLine d="M 252 188 L 192 188" opacity={0.2} />
			<WireNode cx={300} cy={116} accent />
			<WireNode cx={192} cy={188} />
			<WireNode cx={408} cy={188} accent />
			<WireNode cx={300} cy={228} />
		</>
	);
}
