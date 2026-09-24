"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as TabMenu from "@reloop/ui/tab-menu-horizontal";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
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
import { getAudienceIcon } from "../utils";

export type CampaignPreviewTabId = "preview" | "plain" | "html" | "insights";

export interface CampaignAudienceInfo {
	name: string;
	type: "all" | "group" | "channel" | "csv";
	typeLabel: string;
	countLabel: string;
	href?: string;
}

interface CampaignPreviewTabsProps {
	campaign: Campaign;
	audienceInfo?: CampaignAudienceInfo | null;
}

export function CampaignPreviewTabs({
	campaign,
	audienceInfo,
}: CampaignPreviewTabsProps) {
	const [activeTab, setActiveTab] = useState<CampaignPreviewTabId>("preview");
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const plainText = useMemo(() => {
		return (
			htmlToPlainText(campaign.contentHtml || "") || campaign.previewText || ""
		);
	}, [campaign.contentHtml, campaign.previewText]);

	const fallbackAudienceInfo = useMemo<CampaignAudienceInfo>(() => {
		const count = campaign.recipientCount ?? 0;
		const countLabel = `${count.toLocaleString()} ${count === 1 ? "recipient" : "recipients"}`;
		const targetName = campaign.audienceTargetName?.trim();

		if (campaign.audienceType === "group") {
			return {
				name: targetName || "Group",
				type: "group",
				typeLabel: "Group",
				countLabel,
				href: campaign.audienceTargetId
					? `/contacts/groups/${campaign.audienceTargetId}`
					: undefined,
			};
		}

		if (campaign.audienceType === "channel") {
			return {
				name: targetName?.replace(/^Channel:\s*/i, "") || "Channel",
				type: "channel",
				typeLabel: "Channel",
				countLabel,
				href: campaign.audienceTargetId
					? `/contacts?channelId=${campaign.audienceTargetId}`
					: undefined,
			};
		}

		if (campaign.audienceType === "csv") {
			return {
				name: targetName || "CSV Upload",
				type: "csv",
				typeLabel: "CSV",
				countLabel,
				href: undefined,
			};
		}

		return {
			name: targetName || "All Contacts",
			type: "all",
			typeLabel: "All Contacts",
			countLabel,
			href: "/contacts",
		};
	}, [campaign]);

	const effectiveAudienceInfo = audienceInfo ?? fallbackAudienceInfo;

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
							"overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100",
					)}
				>
					<TabMenu.Content value="preview">
						<div className="bg-white dark:bg-transparent">
							{/* Delivery Info - Email Header Style */}
							<div className="divide-y divide-stroke-soft-100 border-stroke-soft-100 border-b dark:divide-stroke-soft-100 dark:border-stroke-soft-100">
								<div className="flex items-start gap-4 px-6 py-3.5">
									<span className="w-16 flex-shrink-0 font-medium text-paragraph-sm text-text-sub-600">
										From
									</span>
									<span className="font-medium text-paragraph-sm text-text-strong-950">
										{campaign.fromName
											? `${campaign.fromName} <${campaign.fromEmail}>`
											: campaign.fromEmail}
									</span>
								</div>
								<div className="flex items-start gap-4 px-6 py-3.5">
									<span className="w-16 flex-shrink-0 font-medium text-paragraph-sm text-text-sub-600">
										To
									</span>
									<span className="flex items-center gap-1.5 font-medium text-paragraph-sm text-text-strong-950">
										{effectiveAudienceInfo ? (
											<>
												<Icon
													name={getAudienceIcon(effectiveAudienceInfo.type)}
													className="h-3.5 w-3.5 shrink-0 text-text-sub-600"
												/>
												{effectiveAudienceInfo.href ? (
													<Link
														href={effectiveAudienceInfo.href}
														className="underline decoration-dotted underline-offset-2 transition-colors hover:text-[#1868DF] dark:hover:text-blue-400"
													>
														{effectiveAudienceInfo.name}
													</Link>
												) : (
													<span>{effectiveAudienceInfo.name}</span>
												)}
												<span className="font-normal text-text-sub-600">
													{" "}
													(
													{effectiveAudienceInfo.type !== "all"
														? `${effectiveAudienceInfo.typeLabel} · `
														: ""}
													{effectiveAudienceInfo.countLabel})
												</span>
											</>
										) : null}
									</span>
								</div>
								<div className="flex items-start gap-4 px-6 py-3.5">
									<span className="w-16 flex-shrink-0 font-medium text-paragraph-sm text-text-sub-600">
										Date
									</span>
									<span className="font-medium text-paragraph-sm text-text-strong-950">
										{new Date(
											campaign.sentAt || campaign.createdAt,
										).toLocaleString(undefined, {
											weekday: "long",
											year: "numeric",
											month: "long",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</div>
								<div className="flex items-start gap-4 px-6 py-3.5">
									<span className="w-16 flex-shrink-0 font-medium text-paragraph-sm text-text-sub-600">
										Subject
									</span>
									<span className="font-medium text-paragraph-sm text-text-strong-950">
										{campaign.subject}
									</span>
								</div>
							</div>

							<div className="p-6">
								{campaign.contentHtml ? (
									<EmailHtmlPreview html={campaign.contentHtml} />
								) : (
									<div className="text-paragraph-sm text-text-sub-600">
										No content
									</div>
								)}
							</div>
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
