function hashString(value: string) {
	let hash = 0;

	for (let index = 0; index < value.length; index += 1) {
		hash = (hash << 5) - hash + value.charCodeAt(index);
		hash |= 0;
	}

	return Math.abs(hash);
}

function FlowFieldPattern({ seed }: { seed: number }) {
	const offset = seed % 24;

	const circles = [
		{ cx: 90 + offset, cy: 62, r: 22 },
		{ cx: 195 + (seed % 12), cy: 98, r: 20 },
		{ cx: 310 + (seed % 16), cy: 134, r: 22 },
		{ cx: 425 + (seed % 10), cy: 170, r: 18 },
	];

	const lineCount = 18;

	return (
		<>
			{Array.from({ length: lineCount }, (_, index) => {
				const y = 32 + index * 11;
				const isDashed = (index + seed) % 5 === 0;
				const circle = circles[Math.min(index % 4, circles.length - 1)];
				if (!circle) return null;

				const dist = Math.abs(y - circle.cy);
				const influence = Math.max(0, 1 - dist / (circle.r + 28));
				const bend =
					influence > 0.15
						? circle.cy > y
							? y - circle.r * influence * 1.4
							: y + circle.r * influence * 1.4
						: y;

				const startX = 16;
				const endX = 584;
				const approachX = circle.cx - circle.r - 4;
				const departX = circle.cx + circle.r + 4;

				return (
					<g key={`flow-line-${index}`}>
						<path
							d={`M ${startX} ${y} L ${approachX} ${y} Q ${circle.cx} ${bend}, ${departX} ${y} L ${endX} ${y}`}
							fill="none"
							stroke="currentColor"
							strokeOpacity={0.18 + (index % 4) * 0.04}
							strokeWidth="1"
							strokeDasharray={isDashed ? "2 6" : undefined}
						/>
						<polygon
							points={`${endX},${y} ${endX - 5},${y - 2.5} ${endX - 5},${y + 2.5}`}
							fill="currentColor"
							fillOpacity={0.28}
						/>
					</g>
				);
			})}
			{circles.map((circle, index) => (
				<g key={`flow-node-${index}`}>
					<circle
						cx={circle.cx}
						cy={circle.cy}
						r={circle.r}
						fill="currentColor"
						fillOpacity={0.02}
						stroke="currentColor"
						strokeOpacity={0.12}
						strokeWidth="1"
					/>
					<circle
						cx={circle.cx}
						cy={circle.cy}
						r={2}
						fill="currentColor"
						fillOpacity={0.55}
					/>
				</g>
			))}
		</>
	);
}

export function BlogPostHeroArt({ slug }: { slug: string }) {
	const seed = hashString(slug);

	return (
		<div className="relative mx-auto aspect-[2/1] w-full max-w-[720px] overflow-hidden text-text-strong-950 dark:text-white">
			<svg
				className="absolute inset-0 size-full"
				viewBox="0 0 600 240"
				aria-hidden="true"
				preserveAspectRatio="xMidYMid meet"
			>
				<FlowFieldPattern seed={seed} />
			</svg>
		</div>
	);
}
