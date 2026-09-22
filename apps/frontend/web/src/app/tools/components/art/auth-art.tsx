import { CardArtSvg } from "./card-art-svg";

/** Shield-check blueprint for the auth-checker card. */
export function AuthBlueprintArt({ className }: { className?: string }) {
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
			<path
				d="M 84 80 L 96 92 L 118 68"
				stroke="currentColor"
				strokeWidth="6"
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			/>
		</CardArtSvg>
	);
}
