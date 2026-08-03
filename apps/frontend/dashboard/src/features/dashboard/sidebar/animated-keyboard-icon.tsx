import { cn } from "@reloop/ui/cn";

type AnimatedKeyboardIconProps = {
	className?: string;
};

/**
 * Keyboard (shortcuts): soft fill + outline; keys pulse on group hover.
 * Place inside an element with the `group` class.
 */
export function AnimatedKeyboardIcon({ className }: AnimatedKeyboardIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			className={cn("h-4 w-4 shrink-0", className)}
		>
			<rect
				opacity="0.12"
				x="2"
				y="5"
				width="20"
				height="14"
				rx="4"
				fill="currentColor"
			/>
			<path
				d="M9.99995 14H14M6 10H6.05M10 10H10.05M14 10H14.05M18 10H18.05M18 14H18.05M6 14H6.05M8.4 19H15.6C17.8402 19 18.9603 19 19.816 18.564C20.5686 18.1805 21.1805 17.5686 21.564 16.816C22 15.9603 22 14.8402 22 12.6V11.4C22 9.15979 22 8.03968 21.564 7.18404C21.1805 6.43139 20.5686 5.81947 19.816 5.43597C18.9603 5 17.8402 5 15.6 5H8.4C6.15979 5 5.03968 5 4.18404 5.43597C3.43139 5.81947 2.81947 6.43139 2.43597 7.18404C2 8.03968 2 9.15979 2 11.4V12.6C2 14.8402 2 15.9603 2.43597 16.816C2.81947 17.5686 3.43139 18.1805 4.18404 18.564C5.03968 19 6.15979 19 8.4 19Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
