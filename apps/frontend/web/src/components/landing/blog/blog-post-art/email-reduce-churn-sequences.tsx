import { WireLine, WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function EmailReduceChurnSequencesArt(_props: BlogPostArtProps) {
	return (
		<>
			<path
				d="M 408 248 C 408 168, 300 128, 192 168 C 120 196, 120 276, 192 304 C 300 344, 408 304, 408 248"
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.18}
			/>
			<WireLine d="M 300 168 L 300 128" opacity={0.2} accent />
			<WireNode cx={192} cy={248} />
			<WireNode cx={300} cy={168} />
			<WireNode cx={408} cy={248} />
			<WireNode cx={300} cy={128} accent />
		</>
	);
}
