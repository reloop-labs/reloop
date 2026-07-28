import { cn } from "@reloop/ui/cn";

type AnimatedSmtpIconProps = {
	className?: string;
};

/**
 * SMTP racks race left → right: top first, then bottom.
 * Place inside an element with the `group` class.
 */
export function AnimatedSmtpIcon({ className }: AnimatedSmtpIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			className={cn("h-4 w-4 shrink-0 overflow-visible", className)}
		>
			{/* Top rack — races first */}
			<g
				className="motion-safe:group-data-[animating=true]:animate-smtp-race-top"
				style={{ transformBox: "fill-box" }}
			>
				<path
					d="M3 6C3 5.07003 3 4.60504 3.10222 4.22354C3.37962 3.18827 4.18827 2.37962 5.22354 2.10222C5.60504 2 6.07003 2 7 2H17C17.93 2 18.395 2 18.7765 2.10222C19.8117 2.37962 20.6204 3.18827 20.8978 4.22354C21 4.60504 21 5.07003 21 6C21 6.92997 21 7.39496 20.8978 7.77646C20.6204 8.81173 19.8117 9.62038 18.7765 9.89778C18.395 10 17.93 10 17 10H7C6.07003 10 5.60504 10 5.22354 9.89778C4.18827 9.62038 3.37962 8.81173 3.10222 7.77646C3 7.39496 3 6.92997 3 6Z"
					fill="currentColor"
					opacity={0.12}
				/>
				<path
					d="M7 10H17C17.93 10 18.395 10 18.7765 9.89778C19.8117 9.62038 20.6204 8.81173 20.8978 7.77646C21 7.39496 21 6.92997 21 6C21 5.07003 21 4.60504 20.8978 4.22354C20.6204 3.18827 19.8117 2.37962 18.7765 2.10222C18.395 2 17.93 2 17 2H7C6.07003 2 5.60504 2 5.22354 2.10222C4.18827 2.37962 3.37962 3.18827 3.10222 4.22354C3 4.60504 3 5.07003 3 6C3 6.92997 3 7.39496 3.10222 7.77646C3.37962 8.81173 4.18827 9.62038 5.22354 9.89778C5.60504 10 6.07003 10 7 10Z"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M17.5 6C17.5 6.27614 17.2761 6.5 17 6.5C16.7239 6.5 16.5 6.27614 16.5 6M17.5 6C17.5 5.72386 17.2761 5.5 17 5.5C16.7239 5.5 16.5 5.72386 16.5 6M17.5 6H16.5"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</g>

			{/* Bottom rack — races after top */}
			<g
				className="motion-safe:group-data-[animating=true]:animate-smtp-race-bottom"
				style={{ transformBox: "fill-box" }}
			>
				<path
					d="M3 17C3 16.07 3 15.605 3.10222 15.2235C3.37962 14.1883 4.18827 13.3796 5.22354 13.1022C5.60504 13 6.07003 13 7 13H17C17.93 13 18.395 13 18.7765 13.1022C19.8117 13.3796 20.6204 14.1883 20.8978 15.2235C21 15.605 21 16.07 21 17C21 17.93 21 18.395 20.8978 18.7765C20.6204 19.8117 19.8117 20.6204 18.7765 20.8978C18.395 21 17.93 21 17 21H7C6.07003 21 5.60504 21 5.22354 20.8978C4.18827 20.6204 3.37962 19.8117 3.10222 18.7765C3 18.395 3 17.93 3 17Z"
					fill="currentColor"
					opacity={0.12}
				/>
				<path
					d="M7 21H17C17.93 21 18.395 21 18.7765 20.8978C19.8117 20.6204 20.6204 19.8117 20.8978 18.7765C21 18.395 21 17.93 21 17C21 16.07 21 15.605 20.8978 15.2235C20.6204 14.1883 19.8117 13.3796 18.7765 13.1022C18.395 13 17.93 13 17 13H7C6.07003 13 5.60504 13 5.22354 13.1022C4.18827 13.3796 3.37962 14.1883 3.10222 15.2235C3 15.605 3 16.07 3 17C3 17.93 3 18.395 3.10222 18.7765C3.37962 19.8117 4.18827 20.6204 5.22354 20.8978C5.60504 21 6.07003 21 7 21Z"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M17.5 17C17.5 17.2761 17.2761 17.5 17 17.5C16.7239 17.5 16.5 17.2761 16.5 17M17.5 17C17.5 16.7239 17.2761 16.5 17 16.5C16.7239 16.5 16.5 16.7239 16.5 17M17.5 17H16.5"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</g>
		</svg>
	);
}
