import { cn } from "@reloop/ui/cn";

type AnimatedMailIconProps = {
	className?: string;
};

/**
 * Mail icon with flap drawing left → right on group hover.
 * Body stays static. Place inside an element with the `group` class.
 */
export function AnimatedMailIcon({ className }: AnimatedMailIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			className={cn("h-4 w-4 shrink-0", className)}
		>
			{/* Envelope body — static */}
			<path
				d="M10 21H14C16.8003 21 18.2004 21 19.27 20.455C20.2108 19.9757 20.9757 19.2108 21.455 18.27C22 17.2004 22 15.8003 22 13V11C22 8.19974 22 6.79961 21.455 5.73005C20.9757 4.78924 20.2108 4.02433 19.27 3.54497C18.2004 3 16.8003 3 14 3H10C7.19974 3 5.79961 3 4.73005 3.54497C3.78924 4.02433 3.02433 4.78924 2.54497 5.73005C2 6.79961 2 8.19974 2 11V13C2 15.8003 2 17.2004 2.54497 18.27C3.02433 19.2108 3.78924 19.9757 4.73005 20.455C5.79961 21 7.19974 21 10 21Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>

			{/* Flap — left → right */}
			<path
				d="M6 8L7 8.66667L7.5624 9.0416C9.16618 10.1108 9.96808 10.6454 10.8348 10.8531C11.6008 11.0366 12.3992 11.0366 13.1652 10.8531C14.0319 10.6454 14.8338 10.1108 16.4376 9.0416L17 8.66667L18 8"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-data-[animating=true]:animate-mail-flap-draw"
			/>
		</svg>
	);
}
