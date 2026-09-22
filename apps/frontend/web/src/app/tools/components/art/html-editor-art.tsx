import { CardArtSvg } from "./card-art-svg";

/** Code-brackets + layout blueprint for the html-editor card. */
export function HtmlEditorBlueprintArt({ className }: { className?: string }) {
	return (
		<CardArtSvg className={className}>
			<path
				d="M 78 58 L 58 80 L 78 102"
				stroke="currentColor"
				strokeWidth="6"
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			/>
			<path
				d="M 122 58 L 142 80 L 122 102"
				stroke="currentColor"
				strokeWidth="6"
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			/>
			<line
				x1="108"
				y1="56"
				x2="92"
				y2="104"
				stroke="currentColor"
				strokeWidth="5"
				strokeLinecap="round"
			/>
			<g stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.55">
				<line x1="148" y1="52" x2="182" y2="52" />
				<line x1="148" y1="66" x2="174" y2="66" />
				<line x1="18" y1="122" x2="52" y2="122" />
			</g>
		</CardArtSvg>
	);
}
