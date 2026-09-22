import { CardArtSvg } from "./card-art-svg";

/** Pulse-gauge blueprint for the domain-reputation card. */
export function ReputationBlueprintArt({ className }: { className?: string }) {
	return (
		<CardArtSvg className={className}>
			<path
				d="M 100 30 A 56 56 0 1 0 156 80"
				stroke="currentColor"
				strokeWidth="5"
				strokeLinecap="round"
				fill="none"
			/>
			<path
				d="M 156 80 A 56 56 0 0 0 132 42"
				stroke="currentColor"
				strokeWidth="5"
				strokeLinecap="round"
				fill="none"
				opacity="0.35"
				strokeDasharray="4 6"
			/>
			<path
				d="M 62 92 H 84 L 92 72 L 104 108 L 112 88 H 138"
				stroke="currentColor"
				strokeWidth="5"
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			/>
		</CardArtSvg>
	);
}
