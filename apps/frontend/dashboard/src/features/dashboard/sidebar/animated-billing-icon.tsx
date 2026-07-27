import { cn } from "@reloop/ui/cn";

type AnimatedBillingIconProps = {
	className?: string;
};

/**
 * Billing card: stripe then chip draw L→R on group hover.
 * Place inside an element with the `group` class.
 */
export function AnimatedBillingIcon({ className }: AnimatedBillingIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			className={cn("h-4 w-4 shrink-0", className)}
		>
			<path
				opacity="0.12"
				d="M2 8H22V14.6C22 16.8402 22 17.9603 21.564 18.816C21.1805 19.5686 20.5686 20.1805 19.816 20.564C18.9603 21 17.8402 21 15.6 21H8.4C6.15979 21 5.03969 21 4.18404 20.564C3.43139 20.1805 2.81947 19.5686 2.43597 18.816C2 17.9603 2 16.8402 2 14.6V8Z"
				fill="currentColor"
			/>
			{/* Card outline — static */}
			<path
				d="M8.4 21H15.6C17.8402 21 18.9603 21 19.816 20.564C20.5686 20.1805 21.1805 19.5686 21.564 18.816C22 17.9603 22 16.8402 22 14.6V9.4C22 7.15979 22 6.03968 21.564 5.18404C21.1805 4.43139 20.5686 3.81947 19.816 3.43597C18.9603 3 17.8402 3 15.6 3H8.4C6.15979 3 5.03968 3 4.18404 3.43597C3.43139 3.81947 2.81947 4.43139 2.43597 5.18404C2 6.03968 2 7.15979 2 9.4V14.6C2 16.8402 2 17.9603 2.43597 18.816C2.81947 19.5686 3.43139 20.1805 4.18404 20.564C5.03968 21 6.15979 21 8.4 21Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			{/* Magnetic stripe — L→R */}
			<path
				d="M2.5 8H21.5"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-hover:animate-billing-stripe"
			/>
			{/* Chip dash — after stripe */}
			<path
				d="M6 12H10"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-hover:animate-billing-chip"
			/>
		</svg>
	);
}
