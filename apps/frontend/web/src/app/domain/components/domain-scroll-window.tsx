"use client";

import {
	motion,
	useReducedMotion,
	useScroll,
	useTransform,
} from "framer-motion";
import type { ReactNode } from "react";

const SHRINK_DISTANCE_PX = 900;
const SCALE_START = 1;
const SCALE_END = 0.9;

export function DomainScrollWindow({ children }: { children: ReactNode }) {
	const reduceMotion = useReducedMotion();
	const { scrollY } = useScroll();
	const transform = useTransform(
		scrollY,
		[0, SHRINK_DISTANCE_PX],
		[`scale(${SCALE_START})`, `scale(${SCALE_END})`],
	);

	const frame = (
		<div className="flex h-[32rem] w-full flex-col sm:h-[40rem] lg:h-[48rem]">
			{children}
		</div>
	);

	if (reduceMotion) {
		return (
			<div className="relative z-10 mx-auto w-full max-w-5xl px-3 pt-10 pb-10 sm:px-6 sm:pt-14 sm:pb-14 md:max-w-7xl lg:px-8 lg:pt-20 lg:pb-16">
				{frame}
			</div>
		);
	}

	return (
		<div className="relative h-[110dvh]">
			<div className="sticky top-20 z-10 mx-auto w-full max-w-5xl px-3 pt-10 sm:top-24 sm:px-6 sm:pt-14 md:max-w-7xl lg:px-8 lg:pt-16">
				<motion.div
					className="origin-top will-change-transform"
					style={{ transform }}
				>
					{frame}
				</motion.div>
			</div>
		</div>
	);
}
