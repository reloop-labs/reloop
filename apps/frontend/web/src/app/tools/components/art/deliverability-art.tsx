import { CardArtSvg } from "./card-art-svg";

/**
 * Paper-plane inbox blueprint for the deliverability-tester card.
 * Same drafting language as the other card arts.
 */
export function DeliverabilityBlueprintArt({
	className,
}: {
	className?: string;
}) {
	return (
		<CardArtSvg className={className}>
			<path
				d="M 12 128 Q 52 108 78 84"
				stroke="currentColor"
				strokeWidth="2.5"
				strokeDasharray="5 5"
				strokeLinecap="round"
				fill="none"
				opacity="0.7"
			/>
			<path
				d="M 28 62 L 148 30 L 104 116 L 88 88 Z"
				stroke="currentColor"
				strokeWidth="5"
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="currentColor"
				fillOpacity="0.04"
			/>
			<path
				d="M 88 88 L 148 30"
				stroke="currentColor"
				strokeWidth="3"
				strokeLinecap="round"
				fill="none"
				opacity="0.7"
			/>
			<rect
				x="132"
				y="96"
				width="46"
				height="32"
				rx="6"
				stroke="currentColor"
				strokeWidth="5"
				fill="none"
			/>
			<line
				x1="132"
				y1="108"
				x2="178"
				y2="108"
				stroke="currentColor"
				strokeWidth="2.5"
				opacity="0.7"
			/>
		</CardArtSvg>
	);
}
