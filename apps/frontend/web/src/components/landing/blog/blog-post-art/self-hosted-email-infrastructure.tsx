import { WireNode } from "./primitives";
import type { BlogPostArtProps } from "./types";

export function SelfHostedEmailInfrastructureArt(_props: BlogPostArtProps) {
	const boxes = [
		{ x: 228, y: 232, label: "SMTP" },
		{ x: 228, y: 188, label: "API" },
		{ x: 228, y: 144, label: "Queue" },
	];

	return (
		<>
			{boxes.map((box, index) => (
				<g key={box.label}>
					<rect
						x={box.x}
						y={box.y}
						width={144}
						height={36}
						rx={6}
						fill="none"
						stroke="currentColor"
						strokeOpacity={index === 2 ? 0.32 : 0.2}
						className={index === 2 ? "dark:stroke-primary-base dark:opacity-80" : undefined}
					/>
					<text x={box.x + 72} y={box.y + 22} className="fill-current font-mono text-[9px] opacity-25 dark:opacity-45" textAnchor="middle">{box.label}</text>
				</g>
			))}
			<WireNode cx={372} cy={160} accent />
			<line x1={372} y1={160} x2={372} y2={232} stroke="currentColor" strokeOpacity={0.12} />
		</>
	);
}
