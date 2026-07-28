import { cn } from "@reloop/ui/cn";

type AnimatedHomeIconProps = {
	className?: string;
};

/**
 * Home icon with a 3-stroke door that draws left → right on group hover.
 * Place inside an element with the `group` class.
 */
export function AnimatedHomeIcon({ className }: AnimatedHomeIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			className={cn("h-4 w-4 shrink-0", className)}
		>
			{/* House shell (no door) */}
			<path
				d="M7.00244 3.99785L5.00244 5.59785C3.89986 6.47992 3.34857 6.92095 2.95174 7.46837C2.6002 7.95333 2.33865 8.49751 2.17957 9.07497C2 9.72681 2 10.4328 2 11.8448V13.9998C2 16.8001 2 18.2002 2.54497 19.2698C3.02433 20.2106 3.78924 20.9755 4.73005 21.4548C5.79961 21.9998 7.19974 21.9998 10 21.9998H14C16.8003 21.9998 18.2004 21.9998 19.27 21.4548C20.2108 20.9755 20.9757 20.2106 21.455 19.2698C22 18.2002 22 16.8001 22 13.9998V11.8448C22 10.4328 22 9.72681 21.8204 9.07497C21.6613 8.49751 21.3998 7.95333 21.0483 7.46837C20.6514 6.92095 20.1001 6.47992 18.9976 5.59785L16.9976 3.99785C15.214 2.57098 14.3222 1.85754 13.3332 1.58393C12.4608 1.34259 11.5392 1.34259 10.6668 1.58393C9.67783 1.85754 8.78603 2.57098 7.00244 3.99785Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* Door: left post → top arch → right post */}
			<path
				d="M9 22V15"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-data-[animating=true]:animate-door-draw-left"
			/>
			<path
				d="M9 15C9 14.0679 9 13.602 9.15224 13.2344C9.35523 12.7444 9.74458 12.355 10.2346 12.152C10.6022 11.9998 11.0681 11.9998 12 11.9998C12.9319 11.9998 13.3978 11.9998 13.7654 12.152C14.2554 12.355 14.6448 12.7444 14.8478 13.2344C15 13.602 15 14.0679 15 15"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-data-[animating=true]:animate-door-draw-top"
			/>
			<path
				d="M15 15V22"
				pathLength={1}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-data-[animating=true]:animate-door-draw-right"
			/>
		</svg>
	);
}
