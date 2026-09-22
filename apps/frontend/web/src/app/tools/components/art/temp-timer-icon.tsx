/**
 * Mini timer mark for the temp-email-checker card.
 * Same face + topper + hands as the OG/hero blueprint timer,
 * simplified to stay crisp at 20px (no grid or dimensions).
 */
export function TempTimerIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
		>
			<rect x="9.5" y="1.5" width="5" height="2.4" rx="0.8" />
			<line x1="12" y1="3.9" x2="12" y2="5.4" />
			<circle cx="12" cy="13.4" r="8" />
			<line x1="12" y1="13.4" x2="12" y2="9" />
			<line x1="12" y1="13.4" x2="15.4" y2="15" />
		</svg>
	);
}
