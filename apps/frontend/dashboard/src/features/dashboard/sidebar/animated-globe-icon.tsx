import { cn } from "@reloop/ui/cn";

type AnimatedGlobeIconProps = {
	className?: string;
};

/**
 * Domain globe: outer ring stays; verticals draw top→bottom, horizontals L→R.
 * Place inside an element with the `group` class.
 */
export function AnimatedGlobeIcon({ className }: AnimatedGlobeIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			className={cn("h-4 w-4 shrink-0", className)}
		>
			{/* Outer sphere — static */}
			<circle
				cx={12}
				cy={12}
				r={10}
				stroke="currentColor"
				strokeWidth="1.5"
			/>

			{/* Vertical meridians — top → bottom */}
			<path
				d="M12 2V22"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-hover:animate-globe-v-1"
			/>
			<path
				d="M12 2C14.2091 2 16 6.47715 16 12C16 17.5228 14.2091 22 12 22"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-hover:animate-globe-v-2"
			/>
			<path
				d="M12 2C9.79086 2 8 6.47715 8 12C8 17.5228 9.79086 22 12 22"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-hover:animate-globe-v-3"
			/>

			{/* Horizontal latitudes — left → right */}
			<path
				d="M2 12H22"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-hover:animate-globe-h-1"
			/>
			<path
				d="M2 12C2 9.79086 6.47715 8 12 8C17.5228 8 22 9.79086 22 12"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-hover:animate-globe-h-2"
			/>
			<path
				d="M2 12C2 14.2091 6.47715 16 12 16C17.5228 16 22 14.2091 22 12"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-hover:animate-globe-h-3"
			/>
		</svg>
	);
}
