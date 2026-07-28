import { cn } from "@reloop/ui/cn";

type AnimatedGlobeIconProps = {
	className?: string;
};

/**
 * Domain globe (original icon): outer stays; meridians top→bottom, latitudes L→R.
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
			{/* Outer sphere — original arcs, static */}
			<path
				d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* Meridians — original curves, top → bottom */}
			<path
				d="M12 2C14.2091 2 16 6.47715 16 12C16 17.5228 14.2091 22 12 22"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-data-[animating=true]:animate-globe-v-1"
			/>
			<path
				d="M12 2C9.79086 2 8 6.47715 8 12C8 17.5228 9.79086 22 12 22"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-data-[animating=true]:animate-globe-v-2"
			/>

			{/* Latitudes — original curves, left → right */}
			<path
				d="M2 12C2 9.79086 6.47715 8 12 8C17.5228 8 22 9.79086 22 12"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-data-[animating=true]:animate-globe-h-1"
			/>
			<path
				d="M2 12C2 14.2091 6.47715 16 12 16C17.5228 16 22 14.2091 22 12"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-data-[animating=true]:animate-globe-h-2"
			/>
		</svg>
	);
}
