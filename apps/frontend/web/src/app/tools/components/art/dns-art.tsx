import { CardArtSvg } from "./card-art-svg";

/** Globe blueprint for the dns-lookup card. */
export function DnsBlueprintArt({ className }: { className?: string }) {
	return (
		<CardArtSvg className={className}>
			<circle
				cx="100"
				cy="80"
				r="46"
				stroke="currentColor"
				strokeWidth="5"
				fill="currentColor"
				fillOpacity="0.04"
			/>
			<ellipse
				cx="100"
				cy="80"
				rx="22"
				ry="46"
				stroke="currentColor"
				strokeWidth="2.5"
				fill="none"
				opacity="0.7"
			/>
			<line
				x1="54"
				y1="80"
				x2="146"
				y2="80"
				stroke="currentColor"
				strokeWidth="2.5"
				opacity="0.7"
			/>
			<path
				d="M 62 54 Q 100 70 138 54"
				stroke="currentColor"
				strokeWidth="2.5"
				fill="none"
				opacity="0.7"
			/>
			<path
				d="M 62 106 Q 100 90 138 106"
				stroke="currentColor"
				strokeWidth="2.5"
				fill="none"
				opacity="0.7"
			/>
			<circle cx="146" cy="80" r="4" fill="currentColor" />
		</CardArtSvg>
	);
}
