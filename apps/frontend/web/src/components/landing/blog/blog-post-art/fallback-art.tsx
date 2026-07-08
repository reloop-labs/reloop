function hashString(value: string) {
	let hash = 0;

	for (let index = 0; index < value.length; index += 1) {
		hash = (hash << 5) - hash + value.charCodeAt(index);
		hash |= 0;
	}

	return Math.abs(hash);
}

export function FallbackWireframeArt({ slug }: { slug: string }) {
	const seed = hashString(slug);
	const variant = seed % 4;

	if (variant === 0) {
		return (
			<>
				<rect
					x="148"
					y="88"
					width="120"
					height="76"
					rx="6"
					fill="none"
					stroke="currentColor"
					strokeOpacity="0.35"
					strokeWidth="1"
				/>
				<rect
					x="328"
					y="116"
					width="140"
					height="96"
					rx="6"
					fill="none"
					stroke="currentColor"
					strokeOpacity="0.35"
					strokeWidth="1"
				/>
				<line
					x1="268"
					y1="116"
					x2="328"
					y2="154"
					stroke="currentColor"
					strokeOpacity="0.25"
					strokeWidth="1"
				/>
				<circle cx="208" cy="116" r="3" fill="currentColor" fillOpacity="0.5" />
				<circle cx="398" cy="154" r="3" fill="currentColor" fillOpacity="0.5" />
				<path
					d="M 164 220 C 248 196, 300 236, 398 212"
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
					x1="120"
					y1="188"
					x2="480"
					y2="188"
					stroke="currentColor"
					strokeOpacity="0.15"
					strokeWidth="1"
				/>
				<line
					x1="300"
					y1="68"
					x2="300"
					y2="308"
					stroke="currentColor"
					strokeOpacity="0.15"
					strokeWidth="1"
				/>
				<circle
					cx="300"
					cy="188"
					r="36"
					fill="none"
					stroke="currentColor"
					strokeOpacity="0.3"
				/>
				<circle
					cx="300"
					cy="188"
					r="4"
					fill="currentColor"
					fillOpacity="0.55"
				/>
				<circle cx="204" cy="128" r="3" fill="currentColor" fillOpacity="0.4" />
				<circle cx="396" cy="248" r="3" fill="currentColor" fillOpacity="0.4" />
				<path
					d="M 204 128 L 252 148 L 300 188 L 348 228 L 396 248"
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
					x="156"
					y="90"
					width="288"
					height="144"
					rx="8"
					fill="none"
					stroke="currentColor"
					strokeOpacity="0.2"
					strokeWidth="1"
				/>
				<line
					x1="156"
					y1="134"
					x2="444"
					y2="134"
					stroke="currentColor"
					strokeOpacity="0.12"
				/>
				<line
					x1="248"
					y1="90"
					x2="248"
					y2="234"
					stroke="currentColor"
					strokeOpacity="0.12"
				/>
				<rect
					x="280"
					y="168"
					width="64"
					height="44"
					rx="4"
					fill="none"
					stroke="currentColor"
					strokeOpacity="0.35"
				/>
				<circle
					cx="360"
					cy="190"
					r="3"
					fill="currentColor"
					fillOpacity="0.45"
				/>
			</>
		);
	}

	return (
		<>
			<path
				d="M 120 264 Q 248 116, 376 188 T 520 136"
				fill="none"
				stroke="currentColor"
				strokeOpacity="0.3"
				strokeWidth="1"
			/>
			<circle cx="120" cy="264" r="4" fill="currentColor" fillOpacity="0.5" />
			<circle cx="376" cy="188" r="4" fill="currentColor" fillOpacity="0.5" />
			<circle cx="520" cy="136" r="4" fill="currentColor" fillOpacity="0.5" />
			<line
				x1="136"
				y1="96"
				x2="220"
				y2="96"
				stroke="currentColor"
				strokeOpacity="0.18"
				strokeWidth="1"
			/>
			<line
				x1="136"
				y1="108"
				x2="192"
				y2="108"
				stroke="currentColor"
				strokeOpacity="0.14"
				strokeWidth="1"
			/>
		</>
	);
}
