import { CardArtSvg } from "./card-art-svg";

/** Circle-slash + list blueprint for the blocklist-checker card. */
export function BlocklistBlueprintArt({ className }: { className?: string }) {
	return (
		<CardArtSvg className={className}>
			<circle
				cx="78"
				cy="80"
				r="42"
				stroke="currentColor"
				strokeWidth="5"
				fill="currentColor"
				fillOpacity="0.04"
			/>
			<line
				x1="50"
				y1="108"
				x2="106"
				y2="52"
				stroke="currentColor"
				strokeWidth="5"
				strokeLinecap="round"
			/>
			<g stroke="currentColor" strokeWidth="4" strokeLinecap="round">
				<line x1="134" y1="52" x2="172" y2="52" />
				<line x1="134" y1="72" x2="164" y2="72" opacity="0.7" />
				<line x1="134" y1="92" x2="172" y2="92" />
				<line x1="134" y1="112" x2="158" y2="112" opacity="0.7" />
			</g>
		</CardArtSvg>
	);
}
