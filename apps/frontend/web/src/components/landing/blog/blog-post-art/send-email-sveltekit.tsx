import { RoundedFrame, WireLine, WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function SendEmailSveltekitArt(_props: BlogPostArtProps) {
	return (
		<>
			<RoundedFrame x={184} y={104} width={232} height={168} rx={10} opacity={0.22} />
			<WireLine d="M 220 248 L 300 160" opacity={0.22} />
			<WireLine d="M 380 248 L 300 160" opacity={0.22} accent />
			<WireNode cx={220} cy={248} />
			<WireNode cx={380} cy={248} accent />
			<WireNode cx={300} cy={160} r={4} />
			<line x1={220} y1={136} x2={380} y2={136} stroke="currentColor" strokeOpacity={0.1} />
		</>
	);
}
