import { WireLine, WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function EmailProviderComparison2026Art(_props: BlogPostArtProps) {
	const cols = [220, 300, 380];

	return (
		<>
			{cols.map((x) => (
				<line key={x} x1={x} y1={120} x2={x} y2={280} stroke="currentColor" strokeOpacity={0.12} />
			))}
			<line x1={180} y1={160} x2={420} y2={160} stroke="currentColor" strokeOpacity={0.12} />
			<line x1={180} y1={208} x2={420} y2={208} stroke="currentColor" strokeOpacity={0.12} />
			<line x1={180} y1={256} x2={420} y2={256} stroke="currentColor" strokeOpacity={0.12} />
			<rect x={196} y={96} width={208} height={200} rx={8} fill="none" stroke="currentColor" strokeOpacity={0.2} />
			<WireNode cx={300} cy={184} accent />
			<WireLine d="M 220 160 L 300 184 L 380 160" opacity={0.18} />
		</>
	);
}
