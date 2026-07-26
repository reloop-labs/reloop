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
				{/*
				 * Facing chevrons with rounded outer corners (r≈22) and
				 * softer shoulders into the center tip.
				 */}
				<path
					d="M1 23C1 10.85 10.85 1 23 1H214C228.5 1 240.5 9.5 245.5 22.5L284.5 121L245.5 219.5C240.5 232.5 228.5 241 214 241H23C10.85 241 1 231.15 1 219Z"
					fill={`url(#${fillL})`}
					stroke={`url(#${strokeL})`}
					strokeWidth="1"
				/>
				<path
					d="M318.5 22.5C323.5 9.5 335.5 1 350 1H539C551.15 1 561 10.85 561 23V219C561 231.15 551.15 241 539 241H350C335.5 241 323.5 232.5 318.5 219.5L284.5 121Z"
					fill={`url(#${fillR})`}
					stroke={`url(#${strokeR})`}
					strokeWidth="1"
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
