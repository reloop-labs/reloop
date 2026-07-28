import { cn } from "@reloop/ui/cn";

type AnimatedLogsIconProps = {
	className?: string;
};

/**
 * Logs icon: document flips L→R, then text lines draw staggered.
 * Place inside an element with the `group` class.
 */
export function AnimatedLogsIcon({ className }: AnimatedLogsIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			className={cn(
				"h-4 w-4 shrink-0 [perspective:48px]",
				className,
			)}
		>
			{/* Document + side brackets — flip */}
			<g
				className="origin-center motion-safe:group-data-[animating=true]:animate-logs-flip"
				style={{ transformBox: "fill-box", transformStyle: "preserve-3d" }}
			>
				<path
					d="M5 6C3.34315 6 2 7.34315 2 9V15C2 16.6569 3.34315 18 5 18"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M19 6C20.6569 6 22 7.34315 22 9V15C22 16.6569 20.6569 18 19 18"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M11.4 22H12.6C14.8402 22 15.9603 22 16.816 21.564C17.5686 21.1805 18.1805 20.5686 18.564 19.816C19 18.9603 19 17.8402 19 15.6V8.4C19 6.15979 19 5.03968 18.564 4.18404C18.1805 3.43139 17.5686 2.81947 16.816 2.43597C15.9603 2 14.8402 2 12.6 2H11.4C9.15979 2 8.03968 2 7.18404 2.43597C6.43139 2.81947 5.81947 3.43139 5.43597 4.18404C5 5.03968 5 6.15979 5 8.4V15.6C5 17.8402 5 18.9603 5.43597 19.816C5.81947 20.5686 6.43139 21.1805 7.18404 21.564C8.03968 22 9.15979 22 11.4 22Z"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</g>

			{/* Text lines — staggered after flip */}
			<path
				d="M9 7H15"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-data-[animating=true]:animate-logs-draw-1"
			/>
			<path
				d="M9 11H15"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-data-[animating=true]:animate-logs-draw-2"
			/>
			<path
				d="M9 15H11"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-data-[animating=true]:animate-logs-draw-3"
			/>
		</svg>
	);
}
