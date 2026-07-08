import { WireLine, WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function TransactionalEmailAsGrowthChannelArt(_props: BlogPostArtProps) {
	return (
		<>
			<rect x={220} y={248} width={48} height={32} rx={4} fill="none" stroke="currentColor" strokeOpacity={0.2} />
			<WireLine d="M 244 248 L 300 168" opacity={0.22} />
			<WireLine d="M 300 168 L 356 108" opacity={0.22} accent />
			<WireNode cx={244} cy={264} />
			<WireNode cx={300} cy={168} />
			<WireNode cx={356} cy={108} accent />
			<path d="M 348 116 L 356 108 L 364 116" fill="none" stroke="currentColor" strokeOpacity={0.25} />
		</>
	);
}
