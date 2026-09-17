import { cn } from "@reloop/ui/cn";

type AnimatedCampaignsIconProps = {
	className?: string;
};

/**
 * Megaphone/campaigns icon with horn tilt and three sound lines
 * that appear one by one on group hover, with a clear gap between
 * the bell mouth and the lines.
 * Place inside an element with the `group` class.
 */
export function AnimatedCampaignsIcon({
	className,
}: AnimatedCampaignsIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			className={cn("h-4 w-4 shrink-0 overflow-visible", className)}
		>
			<g className="origin-[5px_18px] [transform-box:view-box] motion-safe:group-data-[animating=true]:animate-campaign-horn motion-safe:group-hover:animate-campaign-horn">
				{/* Scaled megaphone body leaving a distinct gap before the sound lines */}
				<g transform="translate(-1, 0.8) scale(0.8)">
					{/* Megaphone body tint */}
					<path
						opacity="0.12"
						fillRule="evenodd"
						clipRule="evenodd"
						d="M14.9649 3.5243L10 6.99974L10 14.9997L14.9649 18.4752C16.5945 19.6159 17.4092 20.1862 18.0874 20.1565C18.678 20.1307 19.2269 19.8449 19.5868 19.3759C20 18.8373 20 17.8427 20 15.8536L20 6.14584C20 4.15674 20 3.16219 19.5868 2.62359C19.2269 2.15459 18.678 1.8688 18.0874 1.84296C17.4092 1.81328 16.5944 2.38362 14.9649 3.5243ZM9 15.0001L6 15.0001L6 19.5001C6 20.3285 6.67157 21.0001 7.5 21.0001C8.32842 21.0001 9 20.3285 9 19.5001L9 15.0001Z"
						fill="currentColor"
					/>

					{/* Megaphone outline & handle (without crescent arc) */}
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M15.395 4.13872C16.222 3.55982 16.8 3.15616 17.2552 2.8958C17.7184 2.63093 17.9362 2.58706 18.0546 2.59224C18.4238 2.60839 18.7668 2.78701 18.9917 3.08014C19.0639 3.17421 19.1529 3.37778 19.2015 3.9091C19.2492 4.43138 19.25 5.13636 19.25 6.14583L19.25 7.99986L19.25 13.9999L19.25 15.8536C19.25 16.8631 19.2492 17.5681 19.2015 18.0904C19.1529 18.6217 19.0639 18.8253 18.9917 18.9193C18.7668 19.2125 18.4238 19.3911 18.0546 19.4072C17.9362 19.4124 17.7184 19.3685 17.2552 19.1037C16.8 18.8433 16.222 18.4397 15.395 17.8608L10.75 14.6092L10.75 7.39023L15.395 4.13872ZM20.75 14.6748L20.75 15.8536L20.75 15.8925C20.75 16.8541 20.75 17.6281 20.6952 18.227C20.6405 18.8249 20.5228 19.3879 20.1818 19.8324C19.687 20.4773 18.9323 20.8703 18.1202 20.9058C17.5605 20.9303 17.0318 20.7038 16.5106 20.4058C15.9886 20.1073 15.3545 19.6634 14.5669 19.112L14.5668 19.112L14.5667 19.1119L14.5666 19.1119L14.5348 19.0896L9.76393 15.75L9.75 15.75L9.75 19.5001C9.75 20.7427 8.74264 21.7501 7.5 21.7501C6.25736 21.7501 5.25 20.7427 5.25 19.5001L5.25 15.6911C2.98301 15.3315 1.25 13.3681 1.25 11C1.25 8.37663 3.37665 6.24998 6 6.24998L9.76323 6.24998L14.5348 2.90987L14.5666 2.8876C15.3544 2.33615 15.9885 1.89224 16.5106 1.59369C17.0318 1.29564 17.5605 1.06918 18.1202 1.09368C18.9323 1.12921 19.687 1.52216 20.1818 2.16704C20.5228 2.61156 20.6405 3.17457 20.6952 3.77244C20.75 4.37129 20.75 5.1453 20.75 6.10683L20.75 6.10701L20.75 6.14583L20.75 7.32487C22.4617 7.67232 23.75 9.18564 23.75 10.9999C23.75 12.8141 22.4617 14.3274 20.75 14.6748ZM9.25 7.74998L6 7.74998C4.20507 7.74998 2.75 9.20505 2.75 11C2.75 12.7949 4.20507 14.25 6 14.25L9.25 14.25L9.25 7.74998ZM6.75 15.7501L6.75 19.5001C6.75 19.9143 7.08578 20.2501 7.5 20.2501C7.91421 20.2501 8.25 19.9143 8.25 19.5001L8.25 15.7501L6.75 15.7501Z"
						fill="currentColor"
					/>
				</g>

				{/* 3 sound lines with clear gap — hidden by default, reveal one by one on hover */}
				{/* 1. Top ray (angled upward) */}
				<line
					x1="19"
					y1="7"
					x2="23"
					y2="4"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					className="origin-[19px_7px] opacity-0 transition-opacity duration-150 [transform-box:view-box] motion-safe:group-data-[animating=true]:animate-campaign-ray-1 motion-safe:group-hover:animate-campaign-ray-1"
				/>

				{/* 2. Middle ray (horizontal) */}
				<line
					x1="19.5"
					y1="11.5"
					x2="24"
					y2="11.5"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					className="origin-[19.5px_11.5px] opacity-0 transition-opacity duration-150 [transform-box:view-box] motion-safe:group-data-[animating=true]:animate-campaign-ray-2 motion-safe:group-hover:animate-campaign-ray-2"
				/>

				{/* 3. Bottom ray (angled downward) */}
				<line
					x1="19"
					y1="16"
					x2="23"
					y2="19"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					className="origin-[19px_16px] opacity-0 transition-opacity duration-150 [transform-box:view-box] motion-safe:group-data-[animating=true]:animate-campaign-ray-3 motion-safe:group-hover:animate-campaign-ray-3"
				/>
			</g>
		</svg>
	);
}

export const AnimatedMegaphoneIcon = AnimatedCampaignsIcon;
