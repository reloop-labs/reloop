"use client";

import { Logo } from "@reloop/ui/logo";
import { useId } from "react";
import type { SimpleIcon } from "simple-icons";
import { BrandIcon } from "./brand-icon";

/**
 * Dual brand app icons framed in facing chevron panels
 * (arrow shapes that meet at center with fade-out fills).
 */
export function CompareHeroIcons({
	icon,
}: {
	icon: Pick<SimpleIcon, "hex" | "path">;
}) {
	const uid = useId().replace(/:/g, "");
	const fillL = `${uid}-fill-l`;
	const strokeL = `${uid}-stroke-l`;
	const fillR = `${uid}-fill-r`;
	const strokeR = `${uid}-stroke-r`;

	return (
		<div
			className="relative mx-auto h-[148px] w-full max-w-[562px] sm:h-[200px] md:h-[242px] [--chevron-fill:#ffffff] [--chevron-stroke:#d4d4d4] dark:[--chevron-fill:rgba(255,255,255,0.06)] dark:[--chevron-stroke:rgba(255,255,255,0.18)]"
		>
			{/* Chevron panels */}
			<svg
				viewBox="0 0 562 242"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className="absolute inset-0 size-full -translate-x-px"
				aria-hidden
			>
				<path
					d="M1 1H232.586C237.636 1 242.146 4.16226 243.868 8.91041L284.5 121L243.868 233.09C242.146 237.838 237.636 241 232.586 241H1V1Z"
					fill={`url(#${fillL})`}
					stroke={`url(#${strokeL})`}
				/>
				<path
					d="M318.412 9.50797C319.949 4.45422 324.61 1 329.893 1H561V241H329.893C324.61 241 319.949 237.546 318.412 232.492L284.5 121L318.412 9.50797Z"
					fill={`url(#${fillR})`}
					stroke={`url(#${strokeR})`}
				/>
				<defs>
					<linearGradient
						id={fillL}
						x1="241"
						y1="121"
						x2="1"
						y2="121"
						gradientUnits="userSpaceOnUse"
					>
						<stop stopColor="var(--chevron-fill)" />
						<stop offset="1" stopColor="var(--chevron-fill)" stopOpacity="0" />
					</linearGradient>
					<linearGradient
						id={strokeL}
						x1="241"
						y1="121"
						x2="1"
						y2="121"
						gradientUnits="userSpaceOnUse"
					>
						<stop stopColor="var(--chevron-stroke)" />
						<stop
							offset="1"
							stopColor="var(--chevron-stroke)"
							stopOpacity="0"
						/>
					</linearGradient>
					<linearGradient
						id={fillR}
						x1="321"
						y1="121"
						x2="561"
						y2="121"
						gradientUnits="userSpaceOnUse"
					>
						<stop stopColor="var(--chevron-fill)" />
						<stop offset="1" stopColor="var(--chevron-fill)" stopOpacity="0" />
					</linearGradient>
					<linearGradient
						id={strokeR}
						x1="321"
						y1="121"
						x2="561"
						y2="121"
						gradientUnits="userSpaceOnUse"
					>
						<stop stopColor="var(--chevron-stroke)" />
						<stop
							offset="1"
							stopColor="var(--chevron-stroke)"
							stopOpacity="0"
						/>
					</linearGradient>
				</defs>
			</svg>

			{/* Logos overlaid on the panels */}
			<div className="absolute inset-0 flex items-center">
				{/* Left: Reloop — sit in the body of the left chevron */}
				<div className="flex flex-1 items-center justify-center pr-[8%]">
					<div
						className="relative flex size-[4.25rem] items-center justify-center rounded-[20px] bg-[#0a0d12] shadow-sm sm:size-[5.25rem] sm:rounded-[24px] md:size-24 md:rounded-[26px]"
						aria-hidden
					>
						<Logo className="size-[72%] [&_rect]:!fill-white" />
					</div>
				</div>

				{/* Right: competitor */}
				<div className="flex flex-1 items-center justify-center pl-[8%]">
					<div
						className="relative flex size-[4.25rem] items-center justify-center rounded-[20px] shadow-sm sm:size-[5.25rem] sm:rounded-[24px] md:size-24 md:rounded-[26px]"
						style={{ backgroundColor: `#${icon.hex}` }}
						aria-hidden
					>
						<BrandIcon
							icon={icon}
							fill="#ffffff"
							className="size-9 sm:size-11 md:size-12"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
