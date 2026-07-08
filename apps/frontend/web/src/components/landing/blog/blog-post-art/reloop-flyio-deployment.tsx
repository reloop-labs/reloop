import { AccentCircle, WireLine, WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function ReloopFlyioDeploymentArt(_props: BlogPostArtProps) {
	return (
		<>
			<circle
				cx={220}
				cy={188}
				r={28}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.18}
			/>
			<circle
				cx={300}
				cy={156}
				r={28}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.18}
			/>
			<AccentCircle cx={380} cy={188} r={28} />
			<WireLine d="M 248 188 L 272 156" opacity={0.2} />
			<WireLine d="M 328 156 L 352 188" opacity={0.2} accent />
			<WireLine d="M 248 188 L 352 188" opacity={0.15} />
			<WireNode cx={220} cy={188} />
			<WireNode cx={300} cy={156} />
			<WireNode cx={380} cy={188} accent />
		</>
	);
}
