import { RoundedFrame, WireLine, WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function SendEmailNextjsAppRouterArt(_props: BlogPostArtProps) {
	return (
		<>
			<RoundedFrame x={176} y={88} width={248} height={200} rx={10} opacity={0.22} />
			<rect x={204} y={116} width={88} height={48} rx={6} fill="none" stroke="currentColor" strokeOpacity={0.25} />
			<rect x={312} y={116} width={88} height={48} rx={6} fill="none" stroke="currentColor" strokeOpacity={0.25} />
			<RoundedFrame x={256} y={196} width={88} height={48} rx={6} opacity={0.3} accent />
			<WireLine d="M 248 164 L 256 196" opacity={0.2} />
			<WireLine d="M 356 164 L 300 196" opacity={0.2} accent />
			<WireNode cx={248} cy={164} />
			<WireNode cx={356} cy={164} />
			<WireNode cx={300} cy={220} accent />
		</>
	);
}
