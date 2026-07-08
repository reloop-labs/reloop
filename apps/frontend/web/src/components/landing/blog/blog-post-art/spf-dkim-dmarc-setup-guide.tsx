import { RoundedFrame, WireLine, WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function SpfDkimDmarcSetupGuideArt(_props: BlogPostArtProps) {
	return (
		<>
			<WireLine d="M 168 188 L 264 188 L 360 188 L 456 188" opacity={0.22} />
			<rect
				x={148}
				y={156}
				width={64}
				height={64}
				rx={8}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.28}
			/>
			<rect
				x={244}
				y={156}
				width={64}
				height={64}
				rx={8}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.28}
			/>
			<RoundedFrame
				x={340}
				y={156}
				width={64}
				height={64}
				rx={8}
				opacity={0.28}
				accent
			/>
			<WireNode cx={180} cy={188} />
			<WireNode cx={276} cy={188} />
			<WireNode cx={372} cy={188} accent />
			<text
				x={180}
				y={192}
				className="fill-current font-mono text-[10px] opacity-30 dark:opacity-50"
				textAnchor="middle"
			>
				SPF
			</text>
			<text
				x={276}
				y={192}
				className="fill-current font-mono text-[10px] opacity-30 dark:opacity-50"
				textAnchor="middle"
			>
				DKIM
			</text>
			<text
				x={372}
				y={192}
				className="fill-current font-mono text-[10px] opacity-30 dark:opacity-50"
				textAnchor="middle"
			>
				DMARC
			</text>
		</>
	);
}
