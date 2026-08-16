"use client";

import {
	animate,
	motion,
	useMotionValue,
	useReducedMotion,
	useScroll,
	useTransform,
} from "framer-motion";
import { useEffect, type ReactNode } from "react";

const SHRINK_DISTANCE_PX = 900;
const SCALE_START = 1;
const SCALE_END = 0.9;
const INTRO_SCALE = 1.045;
const INTRO_MS = 720;
const INTRO_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function DomainScrollWindow({ children }: { children: ReactNode }) {
	const reduceMotion = useReducedMotion();
	const { scrollY } = useScroll();
	const scrollScale = useTransform(
		scrollY,
		[0, SHRINK_DISTANCE_PX],
		[SCALE_START, SCALE_END],
	);
	const scale = useMotionValue(reduceMotion ? SCALE_START : INTRO_SCALE);
	const transform = useTransform(scale, (value) => `scale(${value})`);

	useEffect(() => {
		if (reduceMotion) {
			scale.set(scrollScale.get());
			return scrollScale.on("change", (value) => scale.set(value));
		}

		let introFinished = false;
		const intro = animate(scale, scrollScale.get(), {
			duration: INTRO_MS / 1000,
			ease: INTRO_EASE,
			onComplete: () => {
				introFinished = true;
			},
		});
		const unsubscribe = scrollScale.on("change", (value) => {
			if (introFinished) scale.set(value);
		});

		return () => {
			intro.stop();
			unsubscribe();
		};
	}, [reduceMotion, scale, scrollScale]);

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
