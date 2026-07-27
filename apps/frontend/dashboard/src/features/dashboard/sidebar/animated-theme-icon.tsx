import { cn } from "@reloop/ui/cn";

type AnimatedThemeIconProps = {
	className?: string;
};

const hinge =
	"[transform-box:view-box] origin-[12px_22px] will-change-transform";

/**
 * Original swatch-book: book then pages tip horizontal → vertical, staggered.
 * Place inside an element with the `group` class.
 */
export function AnimatedThemeIcon({ className }: AnimatedThemeIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			className={cn("h-4 w-4 shrink-0", className)}
		>
			{/* 1 — book + rivet (main vertical bar) */}
			<g className={cn(hinge, "motion-safe:group-hover:animate-theme-bar-1")}>
				<path
					d="M12 22V6.8C12 5.11984 12 4.27976 11.673 3.63803C11.3854 3.07354 10.9265 2.6146 10.362 2.32698C9.72024 2 8.88016 2 7.2 2H6.8C5.11984 2 4.27976 2 3.63803 2.32698C3.07354 2.6146 2.6146 3.07354 2.32698 3.63803C2 4.27976 2 5.11984 2 6.8V17.2C2 18.8802 2 19.7202 2.32698 20.362C2.6146 20.9265 3.07354 21.3854 3.63803 21.673C4.27976 22 5.11984 22 6.8 22H12Z"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M7.5 17C7.5 17.2761 7.27614 17.5 7 17.5C6.72386 17.5 6.5 17.2761 6.5 17M7.5 17C7.5 16.7239 7.27614 16.5 7 16.5C6.72386 16.5 6.5 16.7239 6.5 17M7.5 17H6.5"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</g>

			{/* 2 — fan page */}
			<g className={cn(hinge, "motion-safe:group-hover:animate-theme-bar-2")}>
				<path
					d="M12 6.99964L13.1188 5.88079C13.8252 5.17434 14.1784 4.82111 14.5501 4.61598C15.4522 4.11817 16.5467 4.11812 17.4488 4.61586C17.8206 4.82096 18.1738 5.17415 18.8803 5.88055C19.5286 6.52882 19.8528 6.85296 20.0513 7.19863C20.5321 8.03603 20.5805 9.0537 20.1813 9.93293C20.0165 10.2959 19.7245 10.6493 19.1406 11.3562L12 20"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</g>

			{/* 3 — bottom page */}
			<g className={cn(hinge, "motion-safe:group-hover:animate-theme-bar-3")}>
				<path
					d="M8 22H17.5C18.8978 22 19.5967 22 20.1481 21.7716C20.8831 21.4672 21.4672 20.8831 21.7716 20.1481C22 19.5967 22 18.8978 22 17.5V17C22 16.07 22 15.605 21.8978 15.2235C21.6204 14.1883 20.8117 13.3796 19.7765 13.1022C19.395 13 18.93 13 18 13"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</g>
		</svg>
	);
}
