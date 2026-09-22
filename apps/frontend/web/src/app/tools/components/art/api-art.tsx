import { CardArtSvg } from "./card-art-svg";

/** Terminal-window blueprint for the API card. */
export function ApiBlueprintArt({ className }: { className?: string }) {
	return (
		<CardArtSvg className={className}>
			<rect
				x="36"
				y="38"
				width="128"
				height="84"
				rx="10"
				stroke="currentColor"
				strokeWidth="5"
				fill="currentColor"
				fillOpacity="0.04"
			/>
			<line
				x1="36"
				y1="62"
				x2="164"
				y2="62"
				stroke="currentColor"
				strokeWidth="3"
				opacity="0.7"
			/>
			<circle cx="50" cy="50" r="3" fill="currentColor" opacity="0.7" />
			<circle cx="62" cy="50" r="3" fill="currentColor" opacity="0.45" />
			<path
				d="M 54 82 L 64 90 L 54 98"
				stroke="currentColor"
				strokeWidth="4"
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			/>
			<line
				x1="72"
				y1="98"
				x2="88"
				y2="98"
				stroke="currentColor"
				strokeWidth="4"
				strokeLinecap="round"
			/>
			<line
				x1="54"
				y1="110"
				x2="120"
				y2="110"
				stroke="currentColor"
				strokeWidth="3"
				strokeLinecap="round"
				opacity="0.5"
			/>
		</CardArtSvg>
	);
}
