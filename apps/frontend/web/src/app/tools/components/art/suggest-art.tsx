import { CardArtSvg } from "./card-art-svg";

/** Sparkles blueprint for the suggest-a-tool card. */
export function SuggestBlueprintArt({ className }: { className?: string }) {
	return (
		<CardArtSvg className={className}>
			<path
				d="M 100 34 C 102 58 106 70 128 80 C 106 90 102 102 100 126 C 98 102 94 90 72 80 C 94 70 98 58 100 34 Z"
				stroke="currentColor"
				strokeWidth="4"
				strokeLinejoin="round"
				fill="currentColor"
				fillOpacity="0.08"
			/>
			<path
				d="M 152 96 C 153 108 155 114 167 119 C 155 124 153 130 152 142 C 151 130 149 124 137 119 C 149 114 151 108 152 96 Z"
				stroke="currentColor"
				strokeWidth="3"
				strokeLinejoin="round"
				fill="none"
				opacity="0.75"
			/>
			<path
				d="M 52 100 C 53 108 54 112 62 115 C 54 118 53 122 52 130 C 51 122 50 118 42 115 C 50 112 51 108 52 100 Z"
				stroke="currentColor"
				strokeWidth="3"
				strokeLinejoin="round"
				fill="none"
				opacity="0.75"
			/>
		</CardArtSvg>
	);
}
