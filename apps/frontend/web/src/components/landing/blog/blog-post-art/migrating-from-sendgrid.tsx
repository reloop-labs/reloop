import { RoundedFrame, WireLine, WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function MigratingFromSendgridArt(_props: BlogPostArtProps) {
	return (
		<>
			<RoundedFrame x={168} y={168} width={88} height={88} rx={8} opacity={0.2} />
			<RoundedFrame x={344} y={168} width={88} height={88} rx={8} opacity={0.28} accent />
			<WireLine d="M 256 212 L 344 212" opacity={0.25} accent />
			<polygon points="320,204 332,212 320,220" fill="currentColor" fillOpacity={0.35} className="dark:fill-primary-base dark:opacity-80" />
			<WireNode cx={212} cy={212} />
			<WireNode cx={388} cy={212} accent />
			<path d="M 276 212 C 296 188, 304 188, 324 212" fill="none" stroke="currentColor" strokeOpacity={0.15} strokeDasharray="4 4" />
		</>
	);
}
