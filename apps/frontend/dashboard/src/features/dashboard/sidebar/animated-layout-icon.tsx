import { cn } from "@reloop/ui/cn";

type AnimatedLayoutIconProps = {
	className?: string;
};

/**
 * Layout/templates icon with frame drawing clockwise on group hover.
 * Place inside an element with the `group` class.
 */
export function AnimatedLayoutIcon({ className }: AnimatedLayoutIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			className={cn("h-4 w-4 shrink-0", className)}
		>
			{/* Top → right → bottom → left */}
			<path
				d="M2 5H22"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-hover:animate-layout-draw-1"
			/>
			<path
				d="M19 2V22"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-hover:animate-layout-draw-2"
			/>
			<path
				d="M22 19H2"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-hover:animate-layout-draw-3"
			/>
			<path
				d="M5 22V2"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-hover:animate-layout-draw-4"
			/>
		</svg>
	);
}
