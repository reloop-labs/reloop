"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Channel, Group } from "#/features/contacts/hooks/use-contacts-query";
import {
	useChannelsQuery,
	useContactsQuery,
	useGroupContactsCountQuery,
	useGroupsQuery,
} from "#/features/contacts/hooks/use-contacts-query";
import { useCampaignEditorStore } from "../campaign-editor-store";
import { CampaignFieldRow } from "./campaign-field-row";

type AudienceMenuView = "root" | "groups" | "topics";

/** Cubic bezier matching marketing header mega-menu transition */
const EASE_DEFAULT: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const SLIDE_PX = 90;
const SLIDE_MS = 0.22;

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

const AudienceGroupRow = ({
	group,
	isSelected,
	onSelect,
}: {
	group: Group;
	isSelected: boolean;
	onSelect: () => void;
}) => {
	const countQuery = useGroupContactsCountQuery(group.id);
	const count =
		countQuery.data?.subscribedContacts ?? countQuery.data?.total ?? 0;

	return (
		<button
			type="button"
			role="option"
			aria-selected={isSelected}
			onClick={onSelect}
			className={cn(
				"flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-label-xs transition-colors",
				isSelected
					? "bg-bg-weak-50 font-medium text-text-strong-950 dark:bg-bg-sub-300/40"
					: "text-text-sub-600 hover:bg-bg-weak-50/70 dark:hover:bg-bg-sub-300/20",
			)}
		>
			<span className="truncate">{group.name}</span>
			<div className="flex items-center gap-1.5">
				<span className="text-[11px] font-normal text-text-soft-400">
					{count.toLocaleString()} contacts
				</span>
				{isSelected && (
					<Icon
						name="check"
						className="h-3.5 w-3.5 shrink-0 text-primary-base"
					/>
				)}
			</div>
		</button>
	);
};

const AudienceTopicRow = ({
	channel,
	isSelected,
	onSelect,
}: {
	channel: Channel;
	isSelected: boolean;
	onSelect: () => void;
}) => {
	const count = channel.subscriberCount ?? 0;

	return (
		<button
			type="button"
			role="option"
			aria-selected={isSelected}
			onClick={onSelect}
			className={cn(
				"flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-label-xs transition-colors",
				isSelected
					? "bg-bg-weak-50 font-medium text-text-strong-950 dark:bg-bg-sub-300/40"
					: "text-text-sub-600 hover:bg-bg-weak-50/70 dark:hover:bg-bg-sub-300/20",
			)}
		>
			<span className="truncate">{channel.name}</span>
			<div className="flex items-center gap-1.5">
				<span className="text-[11px] font-normal text-text-soft-400">
					{count.toLocaleString()} contacts
				</span>
				{isSelected && (
					<Icon
						name="check"
						className="h-3.5 w-3.5 shrink-0 text-primary-base"
					/>
				)}
			</div>
		</button>
	);
};

export const CampaignAudienceField = () => {
	const audienceType = useCampaignEditorStore((s) => s.audienceType);
	const audienceTargetId = useCampaignEditorStore((s) => s.audienceTargetId);
	const audienceTargetName = useCampaignEditorStore(
		(s) => s.audienceTargetName,
	);
	const setAudience = useCampaignEditorStore((s) => s.setAudience);

	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [menuView, setMenuView] = useState<AudienceMenuView>("root");
	const [direction, setDirection] = useState<number>(0);

	const containerRef = useRef<HTMLDivElement>(null);
	const listboxId = useId();

	// Open directly into the active category view (groups, topics, or root)
	useEffect(() => {
		if (isMenuOpen) {
			if (audienceType === "group") {
				setMenuView("groups");
			} else if (audienceType === "channel") {
				setMenuView("topics");
			} else {
				setMenuView("root");
			}
			setDirection(0);
		}
	}, [isMenuOpen, audienceType]);

	// Load contact counts and audience resources
	const contactsQuery = useContactsQuery({
		page: 1,
		limit: 1,
		search: "",
		status: "subscribed",
	});
	const totalContacts =
		contactsQuery.data?.subscribedContacts ??
		contactsQuery.data?.totalContacts ??
		contactsQuery.data?.total ??
		0;

	const groupsQuery = useGroupsQuery({
		page: 1,
		limit: 100,
		search: "",
	});
	const channelsQuery = useChannelsQuery();
	const groups = groupsQuery.data?.groups || [];
	const channels = channelsQuery.data?.channels || [];

	const groupCountQuery = useGroupContactsCountQuery(
		audienceType === "group" ? audienceTargetId : null,
	);

	const selectedChannel = channels.find((c) => c.id === audienceTargetId);

	// Compute resolved recipient count
	const recipientCount = useMemo(() => {
		if (audienceType === "all") {
			return totalContacts;
		}
		if (audienceType === "group") {
			return (
				groupCountQuery.data?.subscribedContacts ??
				groupCountQuery.data?.total ??
				0
			);
		}
		if (audienceType === "channel") {
			return selectedChannel?.subscriberCount ?? 0;
		}
		return 0;
	}, [
		audienceType,
		totalContacts,
		groupCountQuery.data,
		selectedChannel?.subscriberCount,
	]);

	// Compute display label
	const displayLabel = useMemo(() => {
		if (audienceType === "all") {
			return "All Contacts";
		}
		if (audienceType === "group") {
			return (
				audienceTargetName ||
				groups.find((g) => g.id === audienceTargetId)?.name ||
				"Select Group"
			);
		}
		if (audienceType === "channel") {
			return (
				audienceTargetName ||
				channels.find((c) => c.id === audienceTargetId)?.name ||
				"Select Topic"
			);
		}
		return "All Contacts";
	}, [audienceType, audienceTargetName, audienceTargetId, groups, channels]);

	// Close on outside click
	useEffect(() => {
		const handleClickOutside = (e: PointerEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setIsMenuOpen(false);
			}
		};

		document.addEventListener("pointerdown", handleClickOutside);
		return () => {
			document.removeEventListener("pointerdown", handleClickOutside);
		};
	}, []);

	return (
		<CampaignFieldRow
			id="campaign-send-details-audience"
			label="To"
			infoTooltip={{
				title: "Target Audience",
				description:
					"Select the target audience, contact group, or topic to receive this campaign.",
			}}
		>
			<div ref={containerRef} className="relative flex items-center text-label-sm">
				{/* Clean Trigger Button without Badge Box Styling */}
				<button
					type="button"
					onClick={() => setIsMenuOpen((prev) => !prev)}
					aria-haspopup="listbox"
					aria-expanded={isMenuOpen}
					aria-controls={listboxId}
					className="flex items-center gap-1.5 text-label-sm font-medium text-text-strong-950 transition-colors hover:text-text-sub-600 outline-none"
				>
					<span>{displayLabel}</span>
					<span className="font-normal text-text-soft-400">
						({recipientCount.toLocaleString()}{" "}
						{recipientCount === 1 ? "contact" : "contacts"})
					</span>
					<Icon
						name="chevron-down"
						className={cn(
							"h-3.5 w-3.5 text-text-soft-400 transition-transform duration-150",
							isMenuOpen && "rotate-180",
						)}
					/>
				</button>

				{/* Animated Audience Dropdown Shell with Fixed Grounded Height */}
				<AnimatePresence>
					{isMenuOpen && (
						<motion.div
							id={listboxId}
							role="listbox"
							initial={{ opacity: 0, y: -4, scale: 0.98 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -4, scale: 0.98 }}
							transition={{ duration: 0.15, ease: "easeOut" }}
							className="absolute left-0 top-full z-50 mt-4 h-[148px] min-w-[260px] overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 dark:border-stroke-soft-100/40 dark:bg-bg-soft-200"
						>
							<div className="relative h-full w-full">
								<AnimatePresence initial={false} custom={direction} mode="popLayout">
									{menuView === "root" && (
										<motion.div
											key="root"
											custom={direction}
											variants={contentVariants}
											initial={direction === 0 ? false : "enter"}
											animate="center"
											exit="exit"
											transition={{
												duration: SLIDE_MS,
												ease: EASE_DEFAULT,
											}}
											className="flex h-full w-full flex-col gap-0.5 overflow-y-auto overscroll-contain"
										>
											{/* All Contacts */}
											<button
												type="button"
												role="option"
												aria-selected={audienceType === "all"}
												onClick={() => {
													setAudience("all", "", "All Contacts");
													setIsMenuOpen(false);
												}}
												className={cn(
													"flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-label-xs transition-colors",
													audienceType === "all"
														? "bg-bg-weak-50 font-medium text-text-strong-950 dark:bg-bg-sub-300/40"
														: "text-text-sub-600 hover:bg-bg-weak-50/70 dark:hover:bg-bg-sub-300/20",
												)}
											>
												<span className="font-medium text-text-strong-950">All Contacts</span>
												<div className="flex items-center gap-1.5">
													<span className="text-[11px] font-normal text-text-soft-400">
														{totalContacts.toLocaleString()} contacts
													</span>
													{audienceType === "all" && (
														<Icon name="check" className="h-3.5 w-3.5 text-primary-base" />
													)}
												</div>
											</button>

											{/* Groups Option */}
											<button
												type="button"
												role="option"
												onClick={() => {
													setDirection(1);
													setMenuView("groups");
												}}
												className={cn(
													"flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-label-xs transition-colors",
													audienceType === "group"
														? "bg-bg-weak-50 font-medium text-text-strong-950 dark:bg-bg-sub-300/40"
														: "text-text-sub-600 hover:bg-bg-weak-50/70 dark:hover:bg-bg-sub-300/20",
												)}
											>
												<span className="font-medium text-text-strong-950">Groups</span>
												<div className="flex items-center gap-1 text-text-soft-400">
													<span className="text-[11px] font-normal">
														{groups.length} {groups.length === 1 ? "group" : "groups"}
													</span>
													<Icon name="chevron-right" className="h-3.5 w-3.5" />
												</div>
											</button>

											{/* Topics Option */}
											<button
												type="button"
												role="option"
												onClick={() => {
													setDirection(1);
													setMenuView("topics");
												}}
												className={cn(
													"flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-label-xs transition-colors",
													audienceType === "channel"
														? "bg-bg-weak-50 font-medium text-text-strong-950 dark:bg-bg-sub-300/40"
														: "text-text-sub-600 hover:bg-bg-weak-50/70 dark:hover:bg-bg-sub-300/20",
												)}
											>
												<span className="font-medium text-text-strong-950">Topics</span>
												<div className="flex items-center gap-1 text-text-soft-400">
													<span className="text-[11px] font-normal">
														{channels.length} {channels.length === 1 ? "topic" : "topics"}
													</span>
													<Icon name="chevron-right" className="h-3.5 w-3.5" />
												</div>
											</button>
										</motion.div>
									)}

									{menuView === "groups" && (
										<motion.div
											key="groups"
											custom={direction}
											variants={contentVariants}
											initial="enter"
											animate="center"
											exit="exit"
											transition={{
												duration: SLIDE_MS,
												ease: EASE_DEFAULT,
											}}
											className="flex h-full w-full flex-col"
										>
											{/* Back Header */}
											<button
												type="button"
												onClick={() => {
													setDirection(-1);
													setMenuView("root");
												}}
												className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-left text-label-xs font-semibold text-text-strong-950 transition-colors hover:bg-bg-weak-50/70 dark:hover:bg-bg-sub-300/20"
											>
												<Icon name="arrow-left" className="h-3.5 w-3.5 text-text-soft-400" />
												<span>Groups</span>
											</button>

											<div className="border-stroke-soft-200 my-1 border-t dark:border-stroke-soft-100/40" />

											<div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
												{groups.length === 0 ? (
													<div className="p-2.5 text-center text-paragraph-xs text-text-sub-600">
														No groups found
													</div>
												) : (
													groups.map((g) => (
														<AudienceGroupRow
															key={g.id}
															group={g}
															isSelected={
																audienceType === "group" && audienceTargetId === g.id
															}
															onSelect={() => {
																setAudience("group", g.id, g.name);
																setIsMenuOpen(false);
															}}
														/>
													))
												)}
											</div>
										</motion.div>
									)}

									{menuView === "topics" && (
										<motion.div
											key="topics"
											custom={direction}
											variants={contentVariants}
											initial="enter"
											animate="center"
											exit="exit"
											transition={{
												duration: SLIDE_MS,
												ease: EASE_DEFAULT,
											}}
											className="flex h-full w-full flex-col"
										>
											{/* Back Header */}
											<button
												type="button"
												onClick={() => {
													setDirection(-1);
													setMenuView("root");
												}}
												className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-left text-label-xs font-semibold text-text-strong-950 transition-colors hover:bg-bg-weak-50/70 dark:hover:bg-bg-sub-300/20"
											>
												<Icon name="arrow-left" className="h-3.5 w-3.5 text-text-soft-400" />
												<span>Topics</span>
											</button>

											<div className="border-stroke-soft-200 my-1 border-t dark:border-stroke-soft-100/40" />

											<div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
												{channels.length === 0 ? (
													<div className="p-2.5 text-center text-paragraph-xs text-text-sub-600">
														No topics found
													</div>
												) : (
													channels.map((c) => (
														<AudienceTopicRow
															key={c.id}
															channel={c}
															isSelected={
																audienceType === "channel" &&
																audienceTargetId === c.id
															}
															onSelect={() => {
																setAudience("channel", c.id, c.name);
																setIsMenuOpen(false);
															}}
														/>
													))
												)}
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</CampaignFieldRow>
	);
};
