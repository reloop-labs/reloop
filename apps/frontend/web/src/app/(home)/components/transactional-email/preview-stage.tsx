"use client";

import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { CodeWindow } from "./code-window";
import { EmailStack } from "./email-stack";
import {
	PREVIEW_CODE,
	PREVIEW_FILES,
	SEND_API_TABS,
	type PreviewTabId,
	type SendApiTabId,
	SendApiCode,
} from "./preview-scenes";
import { PreviewTabs } from "./preview-tabs";
import { WebhookEvents } from "./webhook-events";

const TAB_ORDER: PreviewTabId[] = ["send", "templates", "events"];

/** CSS ease matching header mega-menu directional slides */
const EASE_DEFAULT: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const SLIDE_PX = 160;
const SLIDE_MS = 0.28;

const contentVariants = {
	enter: (dir: number) => ({
		opacity: 0,
		x: dir > 0 ? SLIDE_PX : dir < 0 ? -SLIDE_PX : 0,
	}),
	center: {
		opacity: 1,
		x: 0,
	},
	exit: (dir: number) => ({
		opacity: 0,
		x: dir > 0 ? -SLIDE_PX : dir < 0 ? SLIDE_PX : 0,
	}),
};

export function PreviewStage() {
	const shouldReduceMotion = useReducedMotion();
	const [active, setActive] = useState<PreviewTabId>("send");
	const [sendSubTab, setSendSubTab] = useState<SendApiTabId>("send");
	const [direction, setDirection] = useState(0);

	const handleTabChange = (newTab: PreviewTabId) => {
		if (newTab === active) return;
		const from = TAB_ORDER.indexOf(active);
		const to = TAB_ORDER.indexOf(newTab);
		if (from !== -1 && to !== -1) {
			setDirection(to > from ? 1 : -1);
		} else {
			setDirection(0);
		}
		setActive(newTab);
	};

	const Code = PREVIEW_CODE[active];

	return (
		<div className="bg-[#f4f5f7] dark:bg-[#111]">
			<div className="relative overflow-hidden">
				<div className="relative mx-auto min-h-[28rem] max-w-5xl px-5 pt-12 pb-16 sm:min-h-[32rem] sm:px-8 sm:pt-14 sm:pb-20 lg:px-10">
					<AnimatePresence
						initial={false}
						custom={direction}
						mode="popLayout"
					>
						<motion.div
							key={active}
							custom={direction}
							variants={contentVariants}
							initial={shouldReduceMotion ? false : "enter"}
							animate="center"
							exit={shouldReduceMotion ? undefined : "exit"}
							transition={
								shouldReduceMotion
									? { duration: 0 }
									: { duration: SLIDE_MS, ease: EASE_DEFAULT }
							}
							className="relative w-full"
						>
							<div
								className={cn(
									"w-full max-w-xl lg:max-w-[34rem]",
									active === "send" && "mx-auto",
								)}
							>
								{active === "send" ? (
									<CodeWindow
										tabs={SEND_API_TABS}
										activeTab={sendSubTab}
										onTabChange={(id) => setSendSubTab(id as SendApiTabId)}
									>
										<SendApiCode tab={sendSubTab} />
									</CodeWindow>
								) : (
									<CodeWindow file={PREVIEW_FILES[active]}>
										<Code />
									</CodeWindow>
								)}
							</div>
							{active !== "send" && (
								<div className="relative z-10 mt-6 w-full max-w-sm lg:absolute lg:top-4 lg:right-0 xl:right-2">
									{active === "events" ? (
										<WebhookEvents active={active === "events"} />
									) : (
										<EmailStack />
									)}
								</div>
							)}
						</motion.div>
					</AnimatePresence>
				</div>
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-44 bg-gradient-to-t from-[#f4f5f7] from-15% via-[#f4f5f7]/75 to-transparent dark:from-[#111] dark:via-[#111]/75"
				/>
			</div>
			<PreviewTabs active={active} onChange={handleTabChange} />
		</div>
	);
}
