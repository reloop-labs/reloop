"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as TabMenu from "@reloop/ui/tab-menu-horizontal";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ShortcutHint } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { EmailHtmlPreview } from "#/features/emails/detail/email-html-preview";
import { EmailInsightsPanel } from "#/features/emails/detail/email-insights-panel";
import {
	formatHtml,
	htmlToPlainText,
} from "#/features/emails/detail/format-html";
import { CopyCodeBlock } from "#/features/onboarding/step4/copy-code-block";
import type { Campaign } from "../campaign-types";

export type CampaignPreviewTabId = "preview" | "plain" | "html" | "insights";

interface CampaignPreviewTabsProps {
	campaign: Campaign;
}

export function CampaignPreviewTabs({ campaign }: CampaignPreviewTabsProps) {
	const [activeTab, setActiveTab] = useState<CampaignPreviewTabId>("preview");
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const plainText = useMemo(() => {
		return (
			htmlToPlainText(campaign.contentHtml || "") || campaign.previewText || ""
		);
	}, [campaign.contentHtml, campaign.previewText]);

	const tabItems = useMemo(() => {
		return [
			{
				title: "Preview",
				value: "preview" as const,
				icon: "mail-single" as const,
				shortcut: "1",
			},
			{
				title: "Plain Text",
				value: "plain" as const,
				icon: "file-text" as const,
				shortcut: "2",
			},
			{
				title: "HTML Source",
				value: "html" as const,
				icon: "code" as const,
				shortcut: "3",
			},
			{
				title: "Insights",
				value: "insights" as const,
				icon: "bulb" as const,
				shortcut: "4",
			},
		];
	}, []);

	useHotkeys(
		"1",
		(e) => {
			e.preventDefault();
			setActiveTab("preview");
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"2",
		(e) => {
			e.preventDefault();
			setActiveTab("plain");
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"3",
		(e) => {
			e.preventDefault();
			setActiveTab("html");
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"4",
		(e) => {
			e.preventDefault();
			setActiveTab("insights");
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	const activeIndex = tabItems.findIndex((item) => item.value === activeTab);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const currentTab = buttonRefs.current[currentIdx];
	const rect = currentTab?.getBoundingClientRect();

	return (
		<section className="pt-2">
			<TabMenu.Root
				value={activeTab}
				onValueChange={(val) => setActiveTab(val as CampaignPreviewTabId)}
			>
				<TabMenu.List className="relative mb-6 h-11 gap-0 border-b! py-0">
					{tabItems.map((item, index) => (
						<TabMenu.Trigger
							key={item.value}
							value={item.value}
							ref={(el) => {
								if (el) buttonRefs.current[index] = el;
							}}
							onPointerEnter={() => setHoveredIdx(index)}
							onPointerLeave={() => setHoveredIdx(undefined)}
							className={cn(
								"flex cursor-pointer items-center gap-2 px-3 py-0! font-medium text-sm",
								hoveredIdx === undefined &&
									activeIndex === index &&
									"text-text-strong-950",
							)}
						>
							<Icon name={item.icon} className="h-4 w-4" />
							{item.title}
							<ShortcutHint>{item.shortcut}</ShortcutHint>
						</TabMenu.Trigger>
					))}

					<AnimatePresence>
						{rect && activeIndex !== -1 ? (
							<motion.div
								className="absolute top-0 left-0 rounded-xl bg-neutral-alpha-10"
								initial={{
									pointerEvents: "none",
									width: rect.width,
									height: rect.height - 14,
									left:
										rect.left -
										(currentTab?.offsetParent?.getBoundingClientRect().left ||
											0),
									top:
										rect.top -
										(currentTab?.offsetParent?.getBoundingClientRect().top ||
											0) +
										7,
									opacity: 0,
								}}
								animate={{
									pointerEvents: "none",
									width: rect.width,
									height: rect.height - 14,
									left:
										rect.left -
										(currentTab?.offsetParent?.getBoundingClientRect().left ||
											0),
									top:
										rect.top -
										(currentTab?.offsetParent?.getBoundingClientRect().top ||
											0) +
										7,
									opacity: 1,
								}}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.14 }}
							/>
						) : null}
					</AnimatePresence>
				</TabMenu.List>

				<div
					className={cn(
						"mb-10",
						activeTab === "preview" &&
							"overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/50",
					)}
				>
					<TabMenu.Content value="preview">
						<div className="bg-white p-6 dark:bg-neutral-950">
							{campaign.contentHtml ? (
								<EmailHtmlPreview html={campaign.contentHtml} />
							) : (
								<div className="p-6 text-paragraph-sm text-text-sub-600">
									No content
								</div>
							)}
						</div>
					</TabMenu.Content>

					<TabMenu.Content value="plain">
						{plainText ? (
							<CopyCodeBlock code={plainText} lang="text" label="Plain Text" />
						) : (
							<div className="p-6 text-paragraph-sm text-text-sub-600">
								No text content
							</div>
						)}
					</TabMenu.Content>

					<TabMenu.Content value="html">
						{campaign.contentHtml ? (
							<CopyCodeBlock
								code={formatHtml(campaign.contentHtml)}
								lang="html"
								label="HTML Source"
							/>
						) : (
							<div className="p-6 text-paragraph-sm text-text-sub-600">
								No HTML content available
							</div>
						)}
					</TabMenu.Content>

					<TabMenu.Content value="insights">
						<EmailInsightsPanel
							email={{
								fromEmail: campaign.fromEmail,
								fromName: campaign.fromName,
								subject: campaign.subject,
								htmlBody: campaign.contentHtml,
								textBody: plainText,
								size: campaign.contentHtml
									? new Blob([campaign.contentHtml]).size
									: 0,
							}}
						/>
					</TabMenu.Content>
				</div>
			</TabMenu.Root>
		</section>
	);
}
