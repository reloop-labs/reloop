"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Popover from "@reloop/ui/popover";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AnimatedSidebarToggleIcon } from "#/features/dashboard/sidebar/animated-sidebar-toggle-icon";
import { usePlayAnimationOnHover } from "#/features/dashboard/sidebar/use-play-animation-on-hover";
import { useSidebarCollapse } from "#/features/dashboard/sidebar/use-sidebar-collapse";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { duplicateCampaignRequest } from "../../campaigns-api";
import { useCampaignEditorStore } from "../campaign-editor-store";
import { CampaignScheduleModal } from "./campaign-schedule-modal";
import { CampaignSendModal } from "./campaign-send-modal";
import { CampaignTestEmailModal } from "./campaign-test-email-modal";

const viewModes = ["visual", "code", "history", "variables"] as const;

const isViewMode = (id: string): id is (typeof viewModes)[number] =>
	(viewModes as readonly string[]).includes(id);

function SidebarToggleButton() {
	const { isCollapsed, toggle } = useSidebarCollapse();
	const {
		isAnimating,
		onPointerEnter,
		onPointerLeave,
		onAnimationStart,
		onAnimationEnd,
	} = usePlayAnimationOnHover(500);

	return (
		<button
			type="button"
			onClick={toggle}
			title="Toggle Sidebar (⌘B)"
			data-animating={isAnimating || undefined}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			onAnimationStart={onAnimationStart}
			onAnimationEnd={onAnimationEnd}
			className={cn(
				"group flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-sub-600 transition-colors",
				"hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5",
			)}
		>
			<AnimatedSidebarToggleIcon
				className={cn("h-4 w-4", isCollapsed && "rotate-180")}
			/>
		</button>
	);
}

function CenterNav() {
	const [viewMode, setViewMode] = useQueryState(
		"mode",
		parseAsStringLiteral(viewModes).withDefault("visual"),
	);

	const isCodeActive = viewMode === "code";

	return (
		<div className="flex items-center gap-0.5 rounded-[10px] border border-stroke-soft-200 bg-bg-weak-50/80 p-0.5 dark:border-stroke-soft-100/40 dark:bg-white/[0.06]">
			<button
				type="button"
				title="Visual editor"
				onClick={() => void setViewMode("visual")}
				className={cn(
					"flex h-7 w-7 items-center justify-center rounded-lg transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97]",
					!isCodeActive
						? "bg-bg-white-0 text-text-strong-950 shadow-regular-xs dark:bg-white/12 dark:text-white"
						: "text-text-sub-600 hover:text-text-strong-950 dark:hover:text-white",
				)}
			>
				<Icon name="pencil" className="h-4 w-4" />
			</button>
			<button
				type="button"
				title="Code editor"
				onClick={() => void setViewMode("code")}
				className={cn(
					"flex h-7 w-7 items-center justify-center rounded-lg transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97]",
					isCodeActive
						? "bg-bg-white-0 text-text-strong-950 shadow-regular-xs dark:bg-white/12 dark:text-white"
						: "text-text-sub-600 hover:text-text-strong-950 dark:hover:text-white",
				)}
			>
				<Icon name="code" className="h-4 w-4" />
			</button>
		</div>
	);
}

function CampaignNameField() {
	const { name, setName } = useCampaignEditorStore();
	const inputRef = useRef<HTMLInputElement>(null);
	const measureRef = useRef<HTMLSpanElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: DOM measurement of input text width
	useEffect(() => {
		if (measureRef.current && inputRef.current) {
			const width = measureRef.current.offsetWidth;
			inputRef.current.style.width = `${Math.max(60, width)}px`;
		}
	}, [name]);

	return (
		<div className="flex items-center">
			<div className="flex items-center gap-1.5">
				<Icon name="mega-phone" className="size-4 text-text-sub-600" />
				<Link
					href="/campaigns"
					className="font-medium text-label-sm text-text-sub-600 hover:text-text-strong-950"
				>
					Campaigns
				</Link>
			</div>

			<span className="ml-2.5 text-text-disabled-300 text-xs">/</span>

			<div className="group ml-1 flex items-center">
				<span
					ref={measureRef}
					className="invisible absolute whitespace-pre px-2 py-1 font-semibold text-label-sm"
					aria-hidden="true"
				>
					{name || "Campaign name"}
				</span>
				<input
					ref={inputRef}
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Campaign name"
					className="rounded-md bg-transparent px-2 py-1 font-semibold text-label-sm text-text-strong-950 outline-none transition-colors placeholder:text-text-soft-400 hover:bg-bg-weak-50 focus:ring-0"
				/>
				<span className="ml-2 shrink-0 select-none rounded-full bg-bg-weak-50 px-2.5 py-1 font-medium text-[11px] leading-none text-text-sub-600 ring-1 ring-stroke-soft-100 ring-inset dark:bg-bg-soft-200 dark:ring-stroke-soft-100/40">
					Draft
				</span>
			</div>
		</div>
	);
}

export function CampaignEditorHeader() {
	const router = useRouter();
	const { campaignId, name } = useCampaignEditorStore();
	const [popoverOpen, setPopoverOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [isTestModalOpen, setIsTestModalOpen] = useState(false);
	const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
	const [isSendModalOpen, setIsSendModalOpen] = useState(false);
	const buttonRefs = useRef<HTMLElement[]>([]);

	const [viewMode, setViewMode] = useQueryState(
		"mode",
		parseAsStringLiteral(viewModes).withDefault("visual"),
	);
	const isCodeSplit = viewMode === "code";

	const menuItems = useMemo(
		() => [
			{
				id: "test",
				label: "Test email",
				icon: "play" as const,
				isDanger: false,
			},
			{
				id: "schedule",
				label: "Schedule send",
				icon: "clock" as const,
				isDanger: false,
			},
			{
				id: "variables",
				label: "Variables",
				icon: "brackets" as const,
				isDanger: false,
			},
			{
				id: "details",
				label: "View analytics",
				icon: "info-outline" as const,
				isDanger: false,
			},
			{
				id: "duplicate",
				label: "Duplicate",
				icon: "copy" as const,
				isDanger: false,
			},
			{
				id: "delete",
				label: "Delete",
				icon: "trash" as const,
				isDanger: true,
				separatorBefore: true,
			},
		],
		[],
	);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const isDanger = menuItems[hoverIdx ?? -1]?.isDanger ?? false;

	const handleDuplicate = async () => {
		if (!campaignId) return;
		try {
			const cloned = await duplicateCampaignRequest(campaignId);
			toast.success("Campaign duplicated successfully");
			router.push(`/campaigns/${cloned.id}/edit`);
		} catch (error) {
			toast.error("Failed to duplicate campaign");
		}
	};

	const handleItemClick = (itemId: string) => {
		setPopoverOpen(false);
		if (itemId === "test") {
			setIsTestModalOpen(true);
		} else if (itemId === "schedule") {
			setIsScheduleModalOpen(true);
		} else if (itemId === "duplicate") {
			handleDuplicate();
		} else if (itemId === "details") {
			router.push(`/campaigns/${campaignId}`);
		} else if (isViewMode(itemId)) {
			setViewMode(itemId);
		}
	};

	return (
		<>
			<div className="relative flex shrink-0 items-center justify-between border-stroke-soft-200 border-b bg-bg-white-0 px-4 py-2.5 dark:border-stroke-soft-100/40 dark:bg-black">
				{/* Left: Toggle, CenterNav */}
				<div className="flex min-w-0 flex-1 items-center gap-2">
					<SidebarToggleButton />
					<CenterNav />
				</div>

				{/* Center: Title / Breadcrumb */}
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div className="pointer-events-auto">
						<CampaignNameField />
					</div>
				</div>

				{/* Right: Popover menu, Broadcast Button */}
				<div className="flex flex-1 items-center justify-end gap-2">
					<Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
						<Popover.Trigger asChild>
							<Button.Root variant="neutral" mode="stroke" size="xsmall">
								<Icon
									name="more-horizontal"
									className="h-4 w-4 text-text-sub-600 hover:text-text-strong-950"
								/>
							</Button.Root>
						</Popover.Trigger>
						<Popover.Content
							align="end"
							sideOffset={8}
							className="w-52 rounded-2xl p-1.5"
							showArrow={false}
						>
							<div className="relative">
								{menuItems.map((item, idx) => (
									<div key={item.id}>
										{"separatorBefore" in item && item.separatorBefore ? (
											<div className="my-1 h-px bg-stroke-soft-200 dark:bg-white/10" />
										) : null}
										<button
											ref={(el) => {
												if (el) buttonRefs.current[idx] = el;
											}}
											type="button"
											onPointerEnter={() => setHoverIdx(idx)}
											onPointerLeave={() => setHoverIdx(undefined)}
											onClick={() => handleItemClick(item.id)}
											className={cn(
												"flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 font-normal text-paragraph-xs transition-colors",
												item.isDanger
													? "text-error-base"
													: "text-text-strong-950",
												!currentRect &&
													hoverIdx === idx &&
													(item.isDanger
														? "bg-red-alpha-10"
														: "bg-neutral-alpha-10"),
											)}
										>
											<Icon
												name={item.icon}
												className={cn(
													"h-4 w-4",
													item.isDanger ? "" : "text-text-sub-600",
												)}
											/>
											<span>{item.label}</span>
										</button>
									</div>
								))}
								<AnimatedHoverBackground
									rect={currentRect}
									tabElement={currentTab}
									isDanger={isDanger}
								/>
							</div>
						</Popover.Content>
					</Popover.Root>

					{/* Broadcast / Send Button */}
					<FancyButton.Root
						variant="neutral"
						size="xsmall"
						onClick={() => setIsSendModalOpen(true)}
					>
						Broadcast
					</FancyButton.Root>
				</div>
			</div>

			{/* Modals */}
			<CampaignTestEmailModal
				open={isTestModalOpen}
				onOpenChange={setIsTestModalOpen}
				campaignId={campaignId}
			/>
			<CampaignScheduleModal
				open={isScheduleModalOpen}
				onOpenChange={setIsScheduleModalOpen}
				campaignId={campaignId}
			/>
			<CampaignSendModal
				open={isSendModalOpen}
				onOpenChange={setIsSendModalOpen}
				campaignId={campaignId}
			/>
		</>
	);
}
