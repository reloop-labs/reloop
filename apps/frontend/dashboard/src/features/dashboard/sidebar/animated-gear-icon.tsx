import { cn } from "@reloop/ui/cn";

type AnimatedGearIconProps = {
	className?: string;
};

/**
 * Settings gear: hole draws, then a short turn on group hover.
 * Place inside an element with the `group` class.
 */
export function AnimatedGearIcon({ className }: AnimatedGearIconProps) {
	return (
		<span
			className={cn(
				"inline-flex h-4 w-4 shrink-0 origin-center motion-safe:group-hover:animate-gear-turn",
				className,
			)}
		>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden
				className="h-full w-full"
			>
				<path
					d="M12 4.00004C11.303 4.00004 10.6132 3.73831 10.1864 3.18734L9.73424 2.60372C9.12172 1.81308 8.01933 1.59645 7.15318 2.09652L5.84684 2.85074C4.98069 3.35081 4.6171 4.41383 4.99556 5.3396L5.27481 6.02271C5.5387 6.66822 5.42168 7.39321 5.0722 7.99668C4.72303 8.59962 4.15039 9.07044 3.46003 9.16458L2.72977 9.26416C1.7388 9.39929 1 10.2457 1 11.2458V12.7543C1 13.7544 1.7388 14.6008 2.72977 14.7359L3.46006 14.8355C4.1504 14.9296 4.72303 15.4004 5.07219 16.0034C5.42166 16.6068 5.53867 17.3318 5.27479 17.9773L4.99554 18.6604C4.61708 19.5862 4.98067 20.6492 5.84682 21.1493L7.15316 21.9035C8.01931 22.4035 9.1217 22.1869 9.73422 21.3963L10.1863 20.8128C10.6131 20.2618 11.303 20 12 20C12.6971 20 13.387 20.2618 13.8139 20.8129L14.2658 21.3961C14.8783 22.1867 15.9807 22.4034 16.8468 21.9033L18.1532 21.1491C19.0193 20.649 19.3829 19.586 19.0045 18.6602L18.7252 17.9772C18.4614 17.3317 18.5784 16.6068 18.9278 16.0033C19.277 15.4004 19.8496 14.9296 20.5399 14.8355L21.2702 14.7359C22.2612 14.6008 23 13.7544 23 12.7543V11.2458C23 10.2457 22.2612 9.39929 21.2702 9.26416L20.5399 9.16458C19.8496 9.07044 19.277 8.59963 18.9278 7.99671C18.5784 7.39326 18.4613 6.6683 18.7252 6.02281L19.0044 5.33977C19.3829 4.414 19.0193 3.35099 18.1532 2.85092L16.8468 2.0967C15.9807 1.59663 14.8783 1.81326 14.2658 2.6039L13.8138 3.18725C13.3869 3.73829 12.697 4.00004 12 4.00004Z"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<circle
					cx={12}
					cy={12}
					r={3}
					pathLength={1}
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
					fill="none"
					className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:group-hover:animate-gear-hole-draw"
				/>
			</svg>
		</span>
	);
}
