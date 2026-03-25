interface AnimatedClockProps {
	className?: string;
}

export const AnimatedClock = ({
	className = "h-3.5 w-3.5",
}: AnimatedClockProps) => {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			{/* Clock circle */}
			<circle
				cx="12"
				cy="12"
				r="9"
				stroke="currentColor"
				strokeWidth="1.5"
				fill="none"
			/>
			{/* Static hour hand */}
			<line
				x1="12"
				y1="12"
				x2="12"
				y2="8"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			{/* Spinning minute hand */}
			<line
				x1="12"
				y1="12"
				x2="12"
				y2="6"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				className="origin-center animate-spin"
				style={{ transformOrigin: "12px 12px", animationDuration: "2s" }}
			/>
		</svg>
	);
};
