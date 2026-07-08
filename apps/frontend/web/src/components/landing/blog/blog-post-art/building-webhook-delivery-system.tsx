import { WireLine, WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function BuildingWebhookDeliverySystemArt(_props: BlogPostArtProps) {
	return (
		<>
			<path
				d="M 220 248 C 220 188, 300 148, 380 188 C 440 216, 440 276, 380 304 C 300 344, 220 304, 220 248"
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.18}
			/>
			<WireLine d="M 300 188 L 360 216" opacity={0.22} accent />
			<WireNode cx={220} cy={248} />
			<WireNode cx={380} cy={188} />
			<WireNode cx={360} cy={216} accent />
			<polygon points="340,208 352,216 340,224" fill="currentColor" fillOpacity={0.35} className="dark:fill-primary-base dark:opacity-80" />
		</>
	);
}
