"use client";

import * as Button from "@reloop/ui/button";
import { Icon, type IconName } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";

/**
 * Stroke button whose label swaps with the same slide/fade as the login CTA
 * (spinner while loading) and whose width springs between label lengths
 * instead of jumping.
 */
export function AnimatedActionButton({
	icon,
	label,
	loadingLabel,
	isLoading,
	onClick,
}: {
	icon: IconName;
	label: string;
	loadingLabel: string;
	isLoading: boolean;
	onClick: () => void;
}) {
	const contentRef = useRef<HTMLSpanElement>(null);
	const [width, setWidth] = useState<number | "auto">("auto");

	useLayoutEffect(() => {
		const el = contentRef.current;
		if (!el) return;
		const update = () => setWidth(el.offsetWidth);
		update();
		const ro = new ResizeObserver(update);
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	return (
		<Button.Root
			type="button"
			variant="neutral"
			mode="stroke"
			size="small"
			disabled={isLoading}
			aria-busy={isLoading}
			onClick={onClick}
			className="overflow-hidden disabled:cursor-default"
		>
			<motion.span
				className="flex items-center overflow-hidden"
				initial={false}
				animate={{ width }}
				transition={{ type: "spring", duration: 0.3, bounce: 0 }}
			>
				<span ref={contentRef} className="flex w-max items-center">
					<AnimatePresence mode="popLayout" initial={false}>
						<motion.span
							key={isLoading ? "loading" : "idle"}
							transition={{ type: "spring", duration: 0.25, bounce: 0 }}
							initial={{ opacity: 0, y: -14 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 14 }}
							className="flex items-center gap-2 whitespace-nowrap"
						>
							{isLoading ? (
								<Spinner size={14} color="currentColor" />
							) : (
								<Icon name={icon} className="size-4 shrink-0" />
							)}
							<span>{isLoading ? loadingLabel : label}</span>
						</motion.span>
					</AnimatePresence>
				</span>
			</motion.span>
		</Button.Root>
	);
}
