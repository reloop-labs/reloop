import { cn } from "@reloop/ui/cn";

type AnimatedContactsIconProps = {
	className?: string;
};

/**
 * Contacts card icon with text lines that draw left → right on group hover.
 * Place inside an element with the `group` class.
 */
export function AnimatedContactsIcon({ className }: AnimatedContactsIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			className={cn("h-4 w-4 shrink-0", className)}
		>
			<rect
				opacity={0.12}
				x={3}
				y={4}
				width={18}
				height={16}
				rx={2}
				fill="currentColor"
			/>
			<rect
				x={3}
				y={4}
				width={18}
				height={16}
				rx={2}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<circle
				cx={9}
				cy={10}
				r={2}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M6 16c.5-2 2-3 3-3s2.5 1 3 3"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* Card text lines: top then bottom */}
			<path
				d="M14 8h5"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-data-[animating=true]:animate-contacts-draw-top"
			/>
			<path
				d="M14 12h5"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-data-[animating=true]:animate-contacts-draw-bottom"
			/>
		</svg>
	);
}
