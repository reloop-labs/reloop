import { cn } from "@reloop/ui/cn";

type AnimatedPlugIconProps = {
	className?: string;
};

/**
 * Connected-apps plug: the plug and socket slide together along the diagonal
 * until the prongs touch the socket, three lines burst out on each side of
 * the contact like a sound wave, then both halves slide back to rest.
 * Place inside an element with the `group` class.
 */
export function AnimatedPlugIcon({ className }: AnimatedPlugIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			className={cn("h-4 w-4 shrink-0 overflow-visible", className)}
		>
			<g className="motion-safe:group-data-[animating=true]:animate-plug-touch-left">
				<path
					opacity={0.12}
					d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"
					fill="currentColor"
				/>
				<path
					d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4ZM2 22l3-3M7.5 13.5 10 11M10.5 16.5 13 14"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</g>
			<g className="motion-safe:group-data-[animating=true]:animate-plug-touch-right">
				<path
					opacity={0.12}
					d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z"
					fill="currentColor"
				/>
				<path
					d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0ZM19 5l3-3"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</g>
			<path
				d="M7.91 8.48 6.25 7.78M9.15 6.65 7.88 5.38M10.98 5.41l-.7-1.66M18.59 13.02l1.66.7M17.35 14.85l1.27 1.27M15.52 16.09l.7 1.66"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				opacity={0}
				className="motion-safe:group-data-[animating=true]:animate-plug-spark"
				style={{ transformOrigin: "13.25px 10.75px", transformBox: "view-box" }}
			/>
		</svg>
	);
}
