import { CardArtSvg } from "./card-art-svg";

/** Calendar-clock blueprint for the domain-age card. */
export function DomainAgeBlueprintArt({ className }: { className?: string }) {
	return (
		<CardArtSvg className={className}>
			<rect
				x="52"
				y="38"
				width="96"
				height="84"
				rx="10"
				stroke="currentColor"
				strokeWidth="5"
				fill="currentColor"
				fillOpacity="0.04"
			/>
			<line
				x1="52"
				y1="62"
				x2="148"
				y2="62"
				stroke="currentColor"
				strokeWidth="4"
			/>
			<line
				x1="76"
				y1="28"
				x2="76"
				y2="48"
				stroke="currentColor"
				strokeWidth="5"
				strokeLinecap="round"
			/>
			<line
				x1="124"
				y1="28"
				x2="124"
				y2="48"
				stroke="currentColor"
				strokeWidth="5"
				strokeLinecap="round"
			/>
			<circle cx="100" cy="94" r="18" stroke="currentColor" strokeWidth="4" />
			<line
				x1="100"
				y1="94"
				x2="100"
				y2="84"
				stroke="currentColor"
				strokeWidth="3.5"
				strokeLinecap="round"
			/>
			<line
				x1="100"
				y1="94"
				x2="107"
				y2="98"
				stroke="currentColor"
				strokeWidth="3.5"
				strokeLinecap="round"
			/>
		</CardArtSvg>
	);
}
