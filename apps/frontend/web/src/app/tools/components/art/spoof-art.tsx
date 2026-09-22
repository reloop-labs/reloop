import { CardArtSvg } from "./card-art-svg";

/** Shield-alert blueprint for the spoof-checker card. */
export function SpoofBlueprintArt({ className }: { className?: string }) {
	return (
		<CardArtSvg className={className}>
			<path
				d="M 100 22 L 142 38 V 78 C 142 108 122 128 100 138 C 78 128 58 108 58 78 V 38 Z"
				stroke="currentColor"
				strokeWidth="5"
				strokeLinejoin="round"
				fill="currentColor"
				fillOpacity="0.04"
			/>
			<line
				x1="100"
				y1="62"
				x2="100"
				y2="92"
				stroke="currentColor"
				strokeWidth="6"
				strokeLinecap="round"
			/>
			<circle cx="100" cy="108" r="3.5" fill="currentColor" />
		</CardArtSvg>
	);
}
