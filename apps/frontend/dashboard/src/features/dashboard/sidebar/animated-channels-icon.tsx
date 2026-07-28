import { cn } from "@reloop/ui/cn";

type AnimatedChannelsIconProps = {
	className?: string;
};

/**
 * Channels icon with badge ring → fill reveal on group hover.
 * Panel stays static. Place inside an element with the `group` class.
 */
export function AnimatedChannelsIcon({ className }: AnimatedChannelsIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			className={cn("h-4 w-4 shrink-0", className)}
		>
			{/* Panel — static */}
			<path
				d="M12 3H10C7.19974 3 5.79961 3 4.73005 3.54497C3.78924 4.02433 3.02433 4.78924 2.54497 5.73005C2 6.79961 2 8.19974 2 11V14C2 16.8003 2 18.2004 2.54497 19.27C3.02433 20.2108 3.78924 20.9757 4.73005 21.455C5.79961 22 7.19974 22 10 22H13C15.8003 22 17.2004 22 18.27 21.455C19.2108 20.9757 19.9757 20.2108 20.455 19.27C21 18.2004 21 16.8003 21 14V12"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* Badge ring draws first */}
			<path
				d="M22 5C22 6.65685 20.6569 8 19 8C17.3431 8 16 6.65685 16 5C16 3.34315 17.3431 2 19 2C20.6569 2 22 3.34315 22 5Z"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-data-[animating=true]:animate-channels-draw-ring"
			/>

			{/* Solid dot appears after the ring */}
			<circle
				cx={19}
				cy={5}
				r={3}
				fill="currentColor"
				className="motion-safe:group-data-[animating=true]:animate-channels-fill-in"
			/>
		</svg>
	);
}
