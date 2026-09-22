import { CardArtSvg } from "./card-art-svg";

/** Magnifier-over-mail blueprint for the who-sends card. */
export function WhoSendsBlueprintArt({ className }: { className?: string }) {
	return (
		<CardArtSvg className={className}>
			<rect
				x="34"
				y="48"
				width="92"
				height="64"
				rx="10"
				stroke="currentColor"
				strokeWidth="5"
				fill="currentColor"
				fillOpacity="0.04"
			/>
			<path
				d="M 38 54 L 74 82 L 80 82 L 122 54"
				stroke="currentColor"
				strokeWidth="4"
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
				opacity="0.8"
			/>
			<circle
				cx="138"
				cy="100"
				r="30"
				stroke="currentColor"
				strokeWidth="6"
				fill="none"
			/>
			<line
				x1="159"
				y1="121"
				x2="176"
				y2="138"
				stroke="currentColor"
				strokeWidth="6"
				strokeLinecap="round"
			/>
		</CardArtSvg>
	);
}
