function hashString(value: string) {
	let hash = 0;

	for (let index = 0; index < value.length; index += 1) {
		hash = (hash << 5) - hash + value.charCodeAt(index);
		hash |= 0;
	}

	return Math.abs(hash);
}

function WireframePattern({ seed }: { seed: number }) {
	const variant = seed % 4;

	if (variant === 0) {
		return (
			<>
				<rect
					x="48"
					y="44"
					width="88"
					height="56"
					rx="6"
					fill="none"
					stroke="currentColor"
					strokeOpacity="0.35"
					strokeWidth="1"
				/>
				<rect
					x="168"
					y="72"
					width="104"
					height="72"
					rx="6"
					fill="none"
					stroke="currentColor"
					strokeOpacity="0.35"
					strokeWidth="1"
				/>
				<line
					x1="136"
					y1="72"
					x2="168"
					y2="108"
					stroke="currentColor"
					strokeOpacity="0.25"
					strokeWidth="1"
				/>
				<circle cx="92" cy="72" r="3" fill="currentColor" fillOpacity="0.5" />
				<circle cx="220" cy="108" r="3" fill="currentColor" fillOpacity="0.5" />
				<path
					d="M56 132 C 110 108, 150 148, 220 124"
					fill="none"
					stroke="currentColor"
					strokeOpacity="0.2"
					strokeWidth="1"
				/>
			</>
		);
	}

	if (variant === 1) {
		return (
			<>
				<line
					x1="40"
					y1="100"
					x2="280"
					y2="100"
					stroke="currentColor"
					strokeOpacity="0.15"
					strokeWidth="1"
				/>
				<line
					x1="160"
					y1="36"
					x2="160"
					y2="164"
					stroke="currentColor"
					strokeOpacity="0.15"
					strokeWidth="1"
				/>
				<circle cx="160" cy="100" r="28" fill="none" stroke="currentColor" strokeOpacity="0.3" />
				<circle cx="160" cy="100" r="4" fill="currentColor" fillOpacity="0.55" />
				<circle cx="88" cy="68" r="3" fill="currentColor" fillOpacity="0.4" />
				<circle cx="232" cy="132" r="3" fill="currentColor" fillOpacity="0.4" />
				<circle cx="104" cy="148" r="2" fill="currentColor" fillOpacity="0.3" />
				<circle cx="216" cy="56" r="2" fill="currentColor" fillOpacity="0.3" />
				<path
					d="M88 68 L 132 84 L 160 100 L 200 116 L 232 132"
					fill="none"
					stroke="currentColor"
					strokeOpacity="0.25"
					strokeWidth="1"
				/>
			</>
		);
	}

	if (variant === 2) {
		return (
			<>
				<rect
					x="56"
					y="48"
					width="208"
					height="104"
					rx="8"
					fill="none"
					stroke="currentColor"
					strokeOpacity="0.2"
					strokeWidth="1"
				/>
				<line x1="56" y1="80" x2="264" y2="80" stroke="currentColor" strokeOpacity="0.12" />
				<line x1="120" y1="48" x2="120" y2="152" stroke="currentColor" strokeOpacity="0.12" />
				<rect
					x="136"
					y="96"
					width="48"
					height="32"
					rx="4"
					fill="none"
					stroke="currentColor"
					strokeOpacity="0.35"
				/>
				<path
					d="M72 112 L 104 96 L 136 112"
					fill="none"
					stroke="currentColor"
					strokeOpacity="0.3"
					strokeWidth="1"
				/>
				<circle cx="200" cy="112" r="3" fill="currentColor" fillOpacity="0.45" />
			</>
		);
	}

	return (
		<>
			<path
				d="M48 140 Q 120 60, 200 100 T 272 72"
				fill="none"
				stroke="currentColor"
				strokeOpacity="0.3"
				strokeWidth="1"
			/>
			<path
				d="M48 108 Q 140 148, 220 88"
				fill="none"
				stroke="currentColor"
				strokeOpacity="0.2"
				strokeWidth="1"
			/>
			<circle cx="48" cy="140" r="4" fill="currentColor" fillOpacity="0.5" />
			<circle cx="200" cy="100" r="4" fill="currentColor" fillOpacity="0.5" />
			<circle cx="272" cy="72" r="4" fill="currentColor" fillOpacity="0.5" />
			<line
				x1="64"
				y1="48"
				x2="120"
				y2="48"
				stroke="currentColor"
				strokeOpacity="0.18"
				strokeWidth="1"
			/>
			<line
				x1="64"
				y1="56"
				x2="96"
				y2="56"
				stroke="currentColor"
				strokeOpacity="0.14"
				strokeWidth="1"
			/>
			<line
				x1="64"
				y1="64"
				x2="108"
				y2="64"
				stroke="currentColor"
				strokeOpacity="0.14"
				strokeWidth="1"
			/>
		</>
	);
}

export function BlogPostThumbnail({ slug }: { slug: string }) {
	const seed = hashString(slug);

	return (
		<div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950 dark:border-white/10 dark:bg-[#111] dark:text-white">
			<svg
				className="absolute inset-0 size-full"
				viewBox="0 0 320 200"
				aria-hidden="true"
				preserveAspectRatio="xMidYMid slice"
			>
				<WireframePattern seed={seed} />
			</svg>
		</div>
	);
}
