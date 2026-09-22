import { CardArtSvg } from "./card-art-svg";

/**
 * Envelope-check blueprint for the email-validator card.
 * Same drafting language as the timer art, simplified for card size.
 */
export function ValidatorBlueprintArt({ className }: { className?: string }) {
	return (
		<CardArtSvg className={className}>
			<rect
				x="40"
				y="42"
				width="120"
				height="76"
				rx="10"
				stroke="currentColor"
				strokeWidth="5"
				fill="currentColor"
				fillOpacity="0.04"
			/>
			<path
				d="M 44 48 L 92 86 L 100 86 L 156 48"
				stroke="currentColor"
				strokeWidth="5"
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			/>
			<circle cx="152" cy="108" r="20" fill="#ffffff" />
			<path
				d="M 143 108 L 150 115 L 161 102"
				stroke="#246BF5"
				strokeWidth="4"
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			/>
		</CardArtSvg>
	);
}
