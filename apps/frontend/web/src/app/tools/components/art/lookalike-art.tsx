import { CardArtSvg } from "./card-art-svg";

/** Eye-scan blueprint for the lookalike-watch card. */
export function LookalikeBlueprintArt({ className }: { className?: string }) {
	return (
		<CardArtSvg className={className}>
			<path
				d="M 28 80 Q 64 40 100 40 Q 136 40 172 80 Q 136 120 100 120 Q 64 120 28 80 Z"
				stroke="currentColor"
				strokeWidth="5"
				strokeLinejoin="round"
				fill="currentColor"
				fillOpacity="0.04"
			/>
			<circle
				cx="100"
				cy="80"
				r="20"
				stroke="currentColor"
				strokeWidth="4"
				fill="none"
			/>
			<circle cx="100" cy="80" r="5" fill="currentColor" />
			<path
				d="M 28 44 V 28 H 44 M 156 28 H 172 V 44 M 172 116 V 132 H 156 M 44 132 H 28 V 116"
				stroke="currentColor"
				strokeWidth="3.5"
				strokeLinecap="round"
				fill="none"
				opacity="0.7"
			/>
		</CardArtSvg>
	);
}
