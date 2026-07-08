import { WireLine, WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function SendEmailRemixArt(_props: BlogPostArtProps) {
	return (
		<>
			<path
				d="M 188 248 L 300 128 L 412 248 Z"
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.18}
			/>
			<WireLine d="M 236 208 L 300 168" opacity={0.22} />
			<WireLine d="M 364 208 L 300 168" opacity={0.22} accent />
			<WireNode cx={236} cy={208} />
			<WireNode cx={364} cy={208} accent />
			<WireNode cx={300} cy={168} r={4} />
			<line
				x1={268}
				y1={296}
				x2={332}
				y2={296}
				stroke="currentColor"
				strokeOpacity={0.12}
			/>
		</>
	);
}
