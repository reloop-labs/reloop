import { CardArtSvg } from "./card-art-svg";

/** Rosette-badge blueprint for the bimi-checker card. */
export function BimiBlueprintArt({ className }: { className?: string }) {
	return (
		<CardArtSvg className={className}>
			<path
				d="M 78 96 L 66 132 L 86 122 L 100 136 L 114 122 L 134 132 L 122 96"
				stroke="currentColor"
				strokeWidth="4"
				strokeLinejoin="round"
				fill="none"
				opacity="0.8"
			/>
			<circle
				cx="100"
				cy="66"
				r="34"
				stroke="currentColor"
				strokeWidth="5"
				fill="currentColor"
				fillOpacity="0.04"
			/>
			<circle
				cx="100"
				cy="66"
				r="22"
				stroke="currentColor"
				strokeWidth="2.5"
				fill="none"
				opacity="0.6"
			/>
			<path
				d="M 90 66 L 98 74 L 111 59"
				stroke="currentColor"
				strokeWidth="5"
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			/>
		</CardArtSvg>
	);
}
