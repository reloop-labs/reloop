import { WireLine, WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function BlockDisposableEmailsAtSignupArt(_props: BlogPostArtProps) {
	return (
		<>
			{/* Signup → checker → database / reject */}
			<WireLine d="M 140 200 L 300 200" opacity={0.22} />
			<WireLine d="M 300 200 L 460 140" opacity={0.2} dashed />
			<WireLine d="M 300 200 L 460 260" opacity={0.28} accent />

			{/* Checker gate */}
			<rect
				x={276}
				y={172}
				width={48}
				height={56}
				rx={6}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.3}
			/>
			<WireLine d="M 288 190 L 312 190" opacity={0.35} accent />
			<WireLine d="M 288 210 L 312 210" opacity={0.25} />

			{/* Reject sink */}
			<rect
				x={444}
				y={120}
				width={40}
				height={40}
				rx={5}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.2}
				strokeDasharray="3 3"
			/>

			{/* Accept sink */}
			<rect
				x={444}
				y={240}
				width={40}
				height={40}
				rx={5}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.35}
			/>

			<WireNode cx={140} cy={200} />
			<WireNode cx={300} cy={200} r={4} accent />
			<WireNode cx={464} cy={140} />
			<WireNode cx={464} cy={260} accent />
		</>
	);
}
