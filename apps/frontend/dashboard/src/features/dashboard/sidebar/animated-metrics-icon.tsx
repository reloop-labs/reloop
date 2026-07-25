import { cn } from "@reloop/ui/cn";

type AnimatedMetricsIconProps = {
	className?: string;
};

/**
 * Metrics bars that pulse like an equalizer on group hover.
 * Place inside an element with the `group` class.
 */
export function AnimatedMetricsIcon({ className }: AnimatedMetricsIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			className={cn("h-4 w-4 shrink-0", className)}
		>
			{/* Tall bar */}
			<path
				d="M5.2 22C4.07989 22 3.51984 22 3.09202 21.782C2.71569 21.5903 2.40973 21.2843 2.21799 20.908C2 20.4802 2 19.9201 2 18.8V5.2C2 4.0799 2 3.51984 2.21799 3.09202C2.40973 2.71569 2.71569 2.40973 3.09202 2.21799C3.51984 2 4.07989 2 5.2 2H6.8C7.92011 2 8.48016 2 8.90798 2.21799C9.28431 2.40973 9.59027 2.71569 9.78201 3.09202C10 3.51984 10 4.07989 10 5.2V18.8C10 19.9201 10 20.4802 9.78201 20.908C9.59027 21.2843 9.28431 21.5903 8.90798 21.782C8.48016 22 7.92011 22 6.8 22H5.2Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="origin-bottom motion-safe:group-hover:animate-metrics-bar-tall"
				style={{ transformBox: "fill-box" }}
			/>
			{/* Short bar */}
			<path
				d="M17.2 22C16.0799 22 15.5198 22 15.092 21.782C14.7157 21.5903 14.4097 21.2843 14.218 20.908C14 20.4802 14 19.9201 14 18.8V13.2C14 12.0799 14 11.5198 14.218 11.092C14.4097 10.7157 14.7157 10.4097 15.092 10.218C15.5198 10 16.0799 10 17.2 10H18.8C19.9201 10 20.4802 10 20.908 10.218C21.2843 10.4097 21.5903 10.7157 21.782 11.092C22 11.5198 22 12.0799 22 13.2V18.8C22 19.9201 22 20.4802 21.782 20.908C21.5903 21.2843 21.2843 21.5903 20.908 21.782C20.4802 22 19.9201 22 18.8 22H17.2Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="origin-bottom motion-safe:group-hover:animate-metrics-bar-short"
				style={{ transformBox: "fill-box" }}
			/>
		</svg>
	);
}
