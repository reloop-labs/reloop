"use client";

import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { SdkCodeBlock } from "@reloop/web/app/sdk/components/sdk-code-block";
import { EmailStack } from "./email-stack";
import {
	SEND_API_TABS,
	SEND_CODE,
	TEMPLATE_TABS,
	TEMPLATES_CODE,
	WEBHOOK_CODE,
	WEBHOOK_TABS,
	type PreviewTabId,
	type SendApiTabId,
	type TemplateTabId,
	type WebhookTabId,
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
	const [templateSubTab, setTemplateSubTab] = useState<TemplateTabId>("otp");
	const [webhookSubTab, setWebhookSubTab] = useState<WebhookTabId>("nextjs");
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

	return (
		<div className="bg-bg-weak-50/60 dark:bg-white/[0.015]">
			<div className="relative overflow-hidden">
				<div className="relative mx-auto h-[29rem] max-w-5xl px-5 pt-12 sm:h-[32rem] sm:px-8 sm:pt-14 lg:h-[34rem] lg:px-10">
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
									<SdkCodeBlock
										code={SEND_CODE[sendSubTab]}
										slug="nodejs"
										lang="typescript"
										tabs={SEND_API_TABS}
										activeTab={sendSubTab}
										onTabChange={(id) => setSendSubTab(id as SendApiTabId)}
									/>
								) : active === "templates" ? (
									<SdkCodeBlock
										code={TEMPLATES_CODE[templateSubTab]}
										slug="nextjs"
										lang="tsx"
										tabs={TEMPLATE_TABS}
										activeTab={templateSubTab}
										onTabChange={(id) => setTemplateSubTab(id as TemplateTabId)}
									/>
								) : (
									<SdkCodeBlock
										code={WEBHOOK_CODE[webhookSubTab]}
										slug={webhookSubTab === "python" ? "python" : "nodejs"}
										lang={webhookSubTab === "python" ? "python" : "typescript"}
										tabs={WEBHOOK_TABS}
										activeTab={webhookSubTab}
										onTabChange={(id) => setWebhookSubTab(id as WebhookTabId)}
									/>
								)}
							</div>
							{active !== "send" && (
								<div className="relative z-10 mt-6 w-full max-w-sm lg:absolute lg:top-4 lg:right-0 xl:right-2">
									{active === "events" ? (
										<WebhookEvents active={active === "events"} />
									) : (
										<EmailStack activeId={templateSubTab} />
									)}
								</div>
							)}
						</motion.div>
					</AnimatePresence>
				</div>
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-44 bg-gradient-to-t from-[#fbfbfb] from-15% via-[#fbfbfb]/80 to-transparent dark:from-[#0a0a0a] dark:via-[#0a0a0a]/80"
				/>
			</div>
			<PreviewTabs active={active} onChange={handleTabChange} />
		</div>
	);
}
