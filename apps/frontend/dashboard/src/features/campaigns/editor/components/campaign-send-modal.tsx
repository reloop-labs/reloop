"use client";

import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import { Skeleton } from "@reloop/ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import {
	useChannelsQuery,
	useContactsQuery,
	useGroupContactsCountQuery,
} from "#/features/contacts/hooks/use-contacts-query";
import { SlideToPublish } from "#/features/templates/editor/components/header/publish-template-modal";
import { sendCampaignRequest } from "../../campaigns-api";
import { useCampaignEditorStore } from "../campaign-editor-store";

interface CampaignSendModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	campaignId: string;
	onSent?: () => void;
}

type SendStatus = "idle" | "sending" | "success";

interface DeliveryBreakdown {
	total: number | null;
	unsubscribed: number | null;
	blocked: number | null;
	sendable: number | null;
	isLoading: boolean;
}

function useDeliveryBreakdown(): DeliveryBreakdown {
	const audienceType = useCampaignEditorStore((s) => s.audienceType);
	const audienceTargetId = useCampaignEditorStore((s) => s.audienceTargetId);

	const contactsQuery = useContactsQuery({
		page: 1,
		limit: 1,
		search: "",
		status: "subscribed",
		enabled: audienceType === "all",
	});
	const groupCountQuery = useGroupContactsCountQuery(
		audienceType === "group" ? audienceTargetId : null,
	);
	const channelsQuery = useChannelsQuery(audienceType === "channel");

	if (audienceType === "group") {
		const data = groupCountQuery.data;
		if (groupCountQuery.isPending || !data) {
			return {
				total: null,
				unsubscribed: null,
				blocked: null,
				sendable: null,
				isLoading: true,
			};
		}
		const total = data.total;
		const unsubscribed = data.unsubscribedContacts;
		const sendable = data.subscribedContacts;
		const blocked = Math.max(0, total - sendable - unsubscribed);
		return { total, unsubscribed, blocked, sendable, isLoading: false };
	}

	if (audienceType === "channel") {
		const channel = (channelsQuery.data?.channels ?? []).find(
			(c) => c.id === audienceTargetId,
		);
		if (channelsQuery.isPending) {
			return {
				total: null,
				unsubscribed: null,
				blocked: null,
				sendable: null,
				isLoading: true,
			};
		}
		const total = channel?.subscriberCount ?? 0;
		return {
			total,
			unsubscribed: 0,
			blocked: 0,
			sendable: total,
			isLoading: false,
		};
	}

	if (audienceType === "all") {
		const data = contactsQuery.data;
		if (contactsQuery.isPending || !data) {
			return {
				total: null,
				unsubscribed: null,
				blocked: null,
				sendable: null,
				isLoading: true,
			};
		}
		const total = data.totalContacts ?? data.total;
		const unsubscribed = data.unsubscribedContacts ?? 0;
		const sendable =
			data.subscribedContacts ?? Math.max(0, total - unsubscribed);
		const blocked = Math.max(0, total - sendable - unsubscribed);
		return { total, unsubscribed, blocked, sendable, isLoading: false };
	}

	return {
		total: 0,
		unsubscribed: 0,
		blocked: 0,
		sendable: 0,
		isLoading: false,
	};
}

function BreakdownRow({
	label,
	value,
	isLoading,
	negative,
}: {
	label: string;
	value: number | null;
	isLoading: boolean;
	negative?: boolean;
}) {
	return (
		<div className="flex items-center justify-between py-[3px]">
			<span className="text-text-sub-600">{label}</span>
			{isLoading ? (
				<Skeleton className="h-4 w-12 rounded" />
			) : (
				<span
					className={
						negative && (value ?? 0) > 0
							? "font-medium text-text-sub-600 tabular-nums"
							: "font-medium text-text-strong-950 tabular-nums dark:text-white"
					}
				>
					{negative && (value ?? 0) > 0 ? "−" : ""}
					{value?.toLocaleString() ?? "—"}
				</span>
			)}
		</div>
	);
}

export function CampaignSendModal({
	open,
	onOpenChange,
	campaignId,
	onSent,
}: CampaignSendModalProps) {
	const router = useRouter();
	const { subject, audienceTargetName, fromName, fromEmail } =
		useCampaignEditorStore();
	const breakdown = useDeliveryBreakdown();
	const [status, setStatus] = useState<SendStatus>("idle");
	const closeTimer = useRef<number | null>(null);

	const hasFrom = fromEmail.trim().length > 0;
	const hasSubject = subject.trim().length > 0;
	const missing = [!hasFrom && "a From address", !hasSubject && "a subject"]
		.filter(Boolean)
		.join(" and ");
	const canSend = hasFrom && hasSubject;
	const hasNoAudience = !breakdown.isLoading && (breakdown.sendable ?? 0) <= 0;
	const sliderDisabled =
		status !== "idle" || !canSend || breakdown.isLoading || hasNoAudience;
	const sliderTitle = !canSend
		? `Add ${missing} first`
		: breakdown.isLoading
			? "Loading audience…"
			: hasNoAudience
				? "No sendable contacts in this audience"
				: undefined;

	useEffect(() => {
		if (!open) {
			setStatus("idle");
			if (closeTimer.current) {
				window.clearTimeout(closeTimer.current);
				closeTimer.current = null;
			}
		}
	}, [open]);

	const handleClose = () => {
		if (status === "sending") return;
		if (closeTimer.current) {
			window.clearTimeout(closeTimer.current);
			closeTimer.current = null;
		}
		onOpenChange(false);
	};

	const handleSend = async () => {
		if (status !== "idle" || sliderDisabled) return;
		setStatus("sending");
		try {
			await sendCampaignRequest(campaignId);
			setStatus("success");
			closeTimer.current = window.setTimeout(() => {
				onOpenChange(false);
				onSent?.();
				router.push(`/campaigns/${campaignId}`);
			}, 1700);
		} catch (err) {
			setStatus("idle");
			toast.error(
				err instanceof Error ? err.message : "Failed to broadcast campaign",
			);
		}
	};

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (open) void handleSend().catch(() => undefined);
		},
		{ enableOnFormTags: true, enabled: open && !sliderDisabled },
		[open, sliderDisabled, campaignId],
	);

	return (
		<Modal.Root open={open} onOpenChange={(o) => !o && handleClose()}>
			<Modal.Content
				className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 p-0 sm:max-w-[440px] dark:border-stroke-soft-100/40 dark:bg-white/[0.03]"
				showClose={false}
			>
				<div className="relative flex flex-col justify-between overflow-hidden">
					<AnimatePresence mode="wait">
						{status === "success" ? (
							<motion.div
								key="success"
								initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
								animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ type: "spring", duration: 0.35, bounce: 0 }}
								className="m-0.5 flex min-h-[320px] flex-1 flex-col items-center justify-center rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 text-center dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]"
							>
								<svg
									width="36"
									height="36"
									viewBox="0 0 32 32"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									className="text-primary-base"
								>
									<path
										d="M27.6 16C27.6 17.5234 27.3 19.0318 26.717 20.4392C26.1341 21.8465 25.2796 23.1253 24.2025 24.2025C23.1253 25.2796 21.8465 26.1341 20.4392 26.717C19.0318 27.3 17.5234 27.6 16 27.6C14.4767 27.6 12.9683 27.3 11.5609 26.717C10.1535 26.1341 8.87475 25.2796 7.79759 24.2025C6.72043 23.1253 5.86598 21.8465 5.28302 20.4392C4.70007 19.0318 4.40002 17.5234 4.40002 16C4.40002 12.9235 5.62216 9.97301 7.79759 7.79759C9.97301 5.62216 12.9235 4.40002 16 4.40002C19.0765 4.40002 22.027 5.62216 24.2025 7.79759C26.3779 9.97301 27.6 12.9235 27.6 16Z"
										fill="currentColor"
										fillOpacity="0.16"
									/>
									<path
										d="M12.1334 16.9667L15.0334 19.8667L19.8667 13.1M27.6 16C27.6 17.5234 27.3 19.0318 26.717 20.4392C26.1341 21.8465 25.2796 23.1253 24.2025 24.2025C23.1253 25.2796 21.8465 26.1341 20.4392 26.717C19.0318 27.3 17.5234 27.6 16 27.6C14.4767 27.6 12.9683 27.3 11.5609 26.717C10.1535 26.1341 8.87475 25.2796 7.79759 24.2025C6.72043 23.1253 5.86598 21.8465 5.28302 20.4392C4.70007 19.0318 4.40002 17.5234 4.40002 16C4.40002 12.9235 5.62216 9.97301 7.79759 7.79759C9.97301 5.62216 12.9235 4.40002 16 4.40002C19.0765 4.40002 22.027 5.62216 24.2025 7.79759C26.3779 9.97301 27.6 12.9235 27.6 16Z"
										stroke="currentColor"
										strokeWidth="2.4"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								<h3 className="mt-3 font-semibold text-base text-text-strong-950 tracking-tight dark:text-white">
									Campaign broadcasted!
								</h3>
								<p className="mt-1 text-text-sub-600 text-xs dark:text-text-sub-400">
									Sent to{" "}
									<span className="font-medium text-text-strong-950 dark:text-white">
										{(breakdown.sendable ?? 0).toLocaleString()}{" "}
										{(breakdown.sendable ?? 0) === 1 ? "contact" : "contacts"}
									</span>
								</p>
							</motion.div>
						) : (
							<motion.div
								key="form"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
								transition={{ duration: 0.2 }}
								className="flex h-full flex-col justify-between"
							>
								{/* Top Raised Card */}
								<div className="m-0.5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
									{/* Header */}
									<div className="flex items-start gap-2.5 px-6 pt-5">
										<Icon
											name="mega-phone"
											className="mt-0.5 h-6 w-6 shrink-0 text-[#1868DF] dark:text-blue-400"
										/>
										<div className="min-w-0 flex-1">
											<Modal.Title className="font-medium text-text-strong-950 text-xl tracking-tight dark:text-white">
												Confirm campaign
											</Modal.Title>
										</div>
										<button
											type="button"
											onClick={handleClose}
											aria-label="Close"
											disabled={status === "sending"}
											className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 active:scale-[0.95] disabled:opacity-50 dark:border-stroke-soft-100/40 dark:bg-transparent dark:hover:bg-white/[0.05] dark:hover:text-white"
										>
											<X className="size-3.5" strokeWidth={2.25} />
										</button>
									</div>

									{/* Content */}
									<div className="space-y-3 px-6 pt-3 pb-5 text-xs">
										{/* Receipt card — campaign details + delivery summary */}
										<div className="px-1 py-1">
											<div className="flex items-center justify-between gap-3 py-2.5">
												<span className="shrink-0 text-text-sub-600">
													From
													<span className="ml-0.5 text-error-base text-paragraph-xs">
														*
													</span>
												</span>
												<span
													title={
														hasFrom ? `${fromName} <${fromEmail}>` : undefined
													}
													className="min-w-0 truncate text-right font-medium text-text-strong-950 dark:text-white"
												>
													{hasFrom ? (
														<>
															{fromName} &lt;{fromEmail}&gt;
														</>
													) : (
														<span className="text-text-sub-600">
															(No sender yet — add a From address)
														</span>
													)}
												</span>
											</div>
											<div className="flex items-center justify-between gap-3 border-stroke-soft-200 border-t py-2.5 dark:border-stroke-soft-100/40">
												<span className="shrink-0 text-text-sub-600">To</span>
												<span className="flex min-w-0 items-center justify-end gap-1.5 text-right font-medium text-text-strong-950 dark:text-white">
													<span className="truncate">{audienceTargetName}</span>
													{breakdown.isLoading ? (
														<Skeleton className="h-4 w-20 rounded" />
													) : (
														<span className="shrink-0 font-normal text-text-soft-400 tabular-nums">
															({(breakdown.sendable ?? 0).toLocaleString()}{" "}
															{(breakdown.sendable ?? 0) === 1
																? "contact"
																: "contacts"}
															)
														</span>
													)}
												</span>
											</div>
											<div className="flex items-center justify-between gap-3 border-stroke-soft-200 border-t py-2.5 dark:border-stroke-soft-100/40">
												<span className="shrink-0 text-text-sub-600">
													Subject
													<span className="ml-0.5 text-error-base text-paragraph-xs">
														*
													</span>
												</span>
												<span
													title={subject || undefined}
													className="min-w-0 truncate text-right font-medium text-text-strong-950 dark:text-white"
												>
													{subject || "(No subject)"}
												</span>
											</div>

											<div className="border-stroke-soft-200 border-t border-dashed py-1 dark:border-stroke-soft-100/40">
												<p className="pt-2 font-semibold text-[11px] text-text-sub-600 uppercase tracking-wide">
													Delivery summary
												</p>
												<div className="py-1">
													<BreakdownRow
														label="Total contacts"
														value={breakdown.total}
														isLoading={breakdown.isLoading}
													/>
													<BreakdownRow
														label="Unsubscribed"
														value={breakdown.unsubscribed}
														isLoading={breakdown.isLoading}
														negative
													/>
													<BreakdownRow
														label="Blocked & suppressed"
														value={breakdown.blocked}
														isLoading={breakdown.isLoading}
														negative
													/>
												</div>
											</div>

											<div className="border-stroke-soft-200 border-t border-dashed py-2.5 dark:border-stroke-soft-100/40">
												<div className="flex items-center justify-between">
													<span className="font-semibold text-sm text-text-strong-950 dark:text-white">
														Emails to be sent
													</span>
													{breakdown.isLoading ? (
														<Skeleton className="h-5 w-14 rounded" />
													) : (
														<span className="font-semibold text-[#1868DF] text-base tabular-nums dark:text-blue-400">
															{(breakdown.sendable ?? 0).toLocaleString()}
														</span>
													)}
												</div>
											</div>
										</div>

										<p className="text-[11px] text-text-sub-600">
											{canSend ? (
												"This action cannot be undone once delivery begins."
											) : (
												<>Add {missing} before broadcasting.</>
											)}
										</p>
									</div>
								</div>

								{/* Bottom Slider Tray */}
								<div className="relative p-2.5 pb-3.5" title={sliderTitle}>
									<SlideToPublish
										onPublish={() => void handleSend().catch(() => undefined)}
										isPublishing={status === "sending"}
										isSuccess={false}
										disabled={sliderDisabled}
										idleText="Slide to send »"
										successText="Broadcasted"
									/>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}
