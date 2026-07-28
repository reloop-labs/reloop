import { cn } from "@reloop/ui/cn";

type AnimatedIntegrationIconProps = {
	className?: string;
};

/**
 * Integrations icon: squares scale in from center staggered; plus stays.
 * Place inside an element with the `group` class.
 */
export function AnimatedIntegrationIcon({
	className,
}: AnimatedIntegrationIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			className={cn("h-4 w-4 shrink-0", className)}
		>
			{/* Soft fills on bottom squares — static */}
			<g opacity={0.12}>
				<path
					d="M2 17.2C2 16.0799 2 15.5198 2.21799 15.092C2.40973 14.7157 2.71569 14.4097 3.09202 14.218C3.51984 14 4.0799 14 5.2 14H6.8C7.9201 14 8.48016 14 8.90798 14.218C9.28431 14.4097 9.59027 14.7157 9.78201 15.092C10 15.5198 10 16.0799 10 17.2V18.8C10 19.9201 10 20.4802 9.78201 20.908C9.59027 21.2843 9.28431 21.5903 8.90798 21.782C8.48016 22 7.9201 22 6.8 22H5.2C4.0799 22 3.51984 22 3.09202 21.782C2.71569 21.5903 2.40973 21.2843 2.21799 20.908C2 20.4802 2 19.9201 2 18.8V17.2Z"
					fill="currentColor"
				/>
				<path
					d="M14 17.2C14 16.0799 14 15.5198 14.218 15.092C14.4097 14.7157 14.7157 14.4097 15.092 14.218C15.5198 14 16.0799 14 17.2 14H18.8C19.9201 14 20.4802 14 20.908 14.218C21.2843 14.4097 21.5903 14.7157 21.782 15.092C22 15.5198 22 16.0799 22 17.2V18.8C22 19.9201 22 20.4802 21.782 20.908C21.5903 21.2843 21.2843 21.5903 20.908 21.782C20.4802 22 19.9201 22 18.8 22H17.2C16.0799 22 15.5198 22 15.092 21.782C14.7157 21.5903 14.4097 21.2843 14.218 20.908C14 20.4802 14 19.9201 14 18.8V17.2Z"
					fill="currentColor"
				/>
			</g>

			{/* Plus — static */}
			<path
				d="M14 6H18M18 6H22M18 6V10M18 6V2"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* Squares — staggered scale from center */}
			<path
				d="M5.2 10H6.8C7.92011 10 8.48016 10 8.90798 9.78201C9.28431 9.59027 9.59027 9.28431 9.78201 8.90798C10 8.48016 10 7.92011 10 6.8V5.2C10 4.07989 10 3.51984 9.78201 3.09202C9.59027 2.71569 9.28431 2.40973 8.90798 2.21799C8.48016 2 7.92011 2 6.8 2H5.2C4.07989 2 3.51984 2 3.09202 2.21799C2.71569 2.40973 2.40973 2.71569 2.21799 3.09202C2 3.51984 2 4.07989 2 5.2V6.8C2 7.92011 2 8.48016 2.21799 8.90798C2.40973 9.28431 2.71569 9.59027 3.09202 9.78201C3.51984 10 4.07989 10 5.2 10Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="origin-center motion-safe:group-data-[animating=true]:animate-integration-square-1"
				style={{ transformBox: "fill-box" }}
			/>
			<path
				d="M5.2 22H6.8C7.92011 22 8.48016 22 8.90798 21.782C9.28431 21.5903 9.59027 21.2843 9.78201 20.908C10 20.4802 10 19.9201 10 18.8V17.2C10 16.0799 10 15.5198 9.78201 15.092C9.59027 14.7157 9.28431 14.4097 8.90798 14.218C8.48016 14 7.92011 14 6.8 14H5.2C4.07989 14 3.51984 14 3.09202 14.218C2.71569 14.4097 2.40973 14.7157 2.21799 15.092C2 15.5198 2 16.0799 2 17.2V18.8C2 19.9201 2 20.4802 2.21799 20.908C2.40973 21.2843 2.71569 21.5903 3.09202 21.782C3.51984 22 4.07989 22 5.2 22Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="origin-center motion-safe:group-data-[animating=true]:animate-integration-square-2"
				style={{ transformBox: "fill-box" }}
			/>
			<path
				d="M17.2 22H18.8C19.9201 22 20.4802 22 20.908 21.782C21.2843 21.5903 21.5903 21.2843 21.782 20.908C22 20.4802 22 19.9201 22 18.8V17.2C22 16.0799 22 15.5198 21.782 15.092C21.5903 14.7157 21.2843 14.4097 20.908 14.218C20.4802 14 19.9201 14 18.8 14H17.2C16.0799 14 15.5198 14 15.092 14.218C14.7157 14.4097 14.4097 14.7157 14.218 15.092C14 15.5198 14 16.0799 14 17.2V18.8C14 19.9201 14 20.4802 14.218 20.908C14.4097 21.2843 14.7157 21.5903 15.092 21.782C15.5198 22 16.0799 22 17.2 22Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="origin-center motion-safe:group-data-[animating=true]:animate-integration-square-3"
				style={{ transformBox: "fill-box" }}
			/>
		</svg>
	);
}
