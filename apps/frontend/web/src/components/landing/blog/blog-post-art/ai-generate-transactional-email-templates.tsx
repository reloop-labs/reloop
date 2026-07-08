import { DocLines, RoundedFrame, WireLine, WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function AiGenerateTransactionalEmailTemplatesArt(_props: BlogPostArtProps) {
	return (
		<>
			<circle cx={220} cy={188} r={32} fill="none" stroke="currentColor" strokeOpacity={0.2} />
			<WireLine d="M 252 188 L 316 188" opacity={0.22} accent />
			<RoundedFrame x={316} y={136} width={168} height={104} rx={8} opacity={0.24} />
			<DocLines x={336} y={160} widths={[56, 72, 48]} />
			<WireNode cx={220} cy={188} />
			<WireNode cx={400} cy={188} accent />
		</>
	);
}
