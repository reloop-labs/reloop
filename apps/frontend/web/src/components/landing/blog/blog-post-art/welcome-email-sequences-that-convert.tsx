import { WireLine, WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function WelcomeEmailSequencesThatConvertArt(_props: BlogPostArtProps) {
	const nodes = [
		{ x: 168, y: 248 },
		{ x: 248, y: 208 },
		{ x: 328, y: 168 },
		{ x: 408, y: 128 },
	];

	return (
		<>
			<WireLine d="M 168 248 L 248 208 L 328 168 L 408 128" opacity={0.22} accent />
			{nodes.map((node, index) => (
				<WireNode key={node.x} cx={node.x} cy={node.y} accent={index === nodes.length - 1} />
			))}
			<rect x={392} y={108} width={48} height={32} rx={6} fill="none" stroke="currentColor" strokeOpacity={0.2} />
		</>
	);
}
