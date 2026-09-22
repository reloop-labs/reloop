import { CardArtSvg } from "./card-art-svg";

/** Warning-triangle + struck lines blueprint for the spam-words card. */
export function SpamWordsBlueprintArt({ className }: { className?: string }) {
	return (
		<CardArtSvg className={className}>
			<path
				d="M 100 30 L 146 112 H 54 Z"
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
				y2="86"
				stroke="currentColor"
				strokeWidth="6"
				strokeLinecap="round"
			/>
			<circle cx="100" cy="100" r="3.5" fill="currentColor" />
			<g stroke="currentColor" strokeWidth="4" strokeLinecap="round">
				<line x1="150" y1="60" x2="182" y2="60" opacity="0.55" />
				<line x1="150" y1="78" x2="172" y2="78" opacity="0.55" />
				<line x1="18" y1="118" x2="182" y2="118" opacity="0.85" />
			</g>
		</CardArtSvg>
	);
}
