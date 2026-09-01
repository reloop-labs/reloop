"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Tooltip from "@reloop/ui/tooltip";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import type { DomainListResponse } from "#/features/domain/types";
import { useCampaignEditorStore } from "../campaign-editor-store";
import {
	useChannelsQuery,
	useGroupsQuery,
} from "#/features/contacts/hooks/use-contacts-query";
import type { AudienceTargetType } from "../../campaign-types";
import { useSWR } from "#/features/templates/editor/hooks/use-swr-compat";

const fetcher = (url: string) =>
	fetch(url, { credentials: "include" }).then((res) => res.json());

interface FieldRowProps {
	id?: string;
	label: string;
	children: React.ReactNode;
	hideBorder?: boolean;
	required?: boolean;
}

const FieldRow = ({
	id,
	label,
	children,
	hideBorder,
	required,
}: FieldRowProps) => {
	return (
		<div
			className={cn(
				"flex items-center border-stroke-soft-200 border-b px-3 py-3 dark:border-stroke-soft-100/40",
				hideBorder && "border-b-0",
			)}
		>
			<label
				htmlFor={id}
				className="w-20 shrink-0 select-none text-label-sm text-text-sub-600"
			>
				{label}
				{required && (
					<span className="ml-0.5 text-error-base text-paragraph-xs">*</span>
				)}
			</label>
			<div className="flex flex-1 items-center min-w-0">{children}</div>
		</div>
	);
};

interface ErrorDetails {
	title: string;
	description: string;
	actionText?: string;
	actionLink?: string;
}

interface ErrorTooltipContentProps {
	error: ErrorDetails;
}

const ErrorTooltipContent = ({ error }: ErrorTooltipContentProps) => {
	return (
		<div className="flex w-72 flex-col gap-2 p-0.5 text-left">
			<div className="flex items-start gap-2.5">
				<div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-error-lighter">
					<Icon name="alert-circle" className="h-3.5 w-3.5 text-error-base" />
				</div>
				<div className="flex flex-col gap-0.5">
					<h4 className="font-semibold text-label-xs text-text-strong-950 leading-snug">
						{error.title}
					</h4>
					<p className="text-paragraph-xs text-text-sub-600 leading-normal">
						{error.description}
					</p>
				</div>
			</div>

			{error.actionLink && error.actionText && (
				<div className="border-stroke-soft-200 border-t pt-2">
					<Link
						href={error.actionLink}
						className="inline-flex items-center gap-1 font-semibold text-paragraph-xs text-primary-base transition-colors hover:text-primary-hover hover:underline"
					>
						{error.actionText}
						<Icon name="arrow-right" className="h-3 w-3" />
					</Link>
				</div>
			)}
		</div>
	);
};

export const CampaignSendDetails = () => {
	const fromName = useCampaignEditorStore((s) => s.fromName);
	const setFromName = useCampaignEditorStore((s) => s.setFromName);
	const fromEmail = useCampaignEditorStore((s) => s.fromEmail);
	const setFromEmail = useCampaignEditorStore((s) => s.setFromEmail);
	const replyTo = useCampaignEditorStore((s) => s.replyTo);
	const setReplyTo = useCampaignEditorStore((s) => s.setReplyTo);
	const previewText = useCampaignEditorStore((s) => s.previewText);
	const setPreviewText = useCampaignEditorStore((s) => s.setPreviewText);
	const subject = useCampaignEditorStore((s) => s.subject);
	const setSubject = useCampaignEditorStore((s) => s.setSubject);
	const audienceType = useCampaignEditorStore((s) => s.audienceType);
	const audienceTargetId = useCampaignEditorStore((s) => s.audienceTargetId);
	const setAudience = useCampaignEditorStore((s) => s.setAudience);

	const [showReplyTo, setShowReplyTo] = useState(false);

	useEffect(() => {
		if (replyTo) {
			setShowReplyTo(true);
		}
	}, [replyTo]);

	const { activeOrganization } = useActiveOrganization();
	const { data: domainData } = useSWR<DomainListResponse>(
		activeOrganization?.id
			? `/api/domain/v1/list?organizationId=${activeOrganization.id}`
			: null,
		fetcher,
	);

	const groupsQuery = useGroupsQuery({
		page: 1,
		limit: 50,
		search: "",
	});
	const channelsQuery = useChannelsQuery();
	const groups = groupsQuery.data?.groups || [];
	const channels = channelsQuery.data?.channels || [];

	const verifiedDomains = (domainData?.domains || [])
		.filter(
			(d) => d.status === "active" || d.systemVerified || d.userVerifiedDomain,
		)
		.map((d) => d.domain.toLowerCase());

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	const parseFromEmail = (input: string | null | undefined) => {
		if (!input) return "";
		const match = input.match(/<([^>]+)>/);
		if (match?.[1]) return match[1].trim();
		return input.trim();
	};

	const fromEmailAddress = parseFromEmail(fromEmail);
	const fromDomain = fromEmailAddress.includes("@")
		? fromEmailAddress.split("@")[1]?.toLowerCase() || ""
		: "";

	const isFromEmailValid = !fromEmail || emailRegex.test(fromEmailAddress);
	const isFromDomainVerified =
		!fromEmailAddress ||
		!isFromEmailValid ||
		verifiedDomains.includes(fromDomain);

	let fromError: ErrorDetails | null = null;
	if (fromEmail) {
		if (!isFromEmailValid) {
			fromError = {
				title: "Invalid Email Format",
				description:
					"Please enter a valid email address (e.g., sender@example.com).",
			};
		} else if (!isFromDomainVerified) {
			fromError = {
				title: "Domain Verification Required",
				description:
					"You cannot send from unverified domains. Please verify this domain to use it.",
				actionText: "Configure Domain Settings",
				actionLink: "/domain",
			};
		}
	}

	let formattedFromValue = fromEmail;
	if (fromName && fromEmail && !fromEmail.includes("<")) {
		formattedFromValue = `${fromName} <${fromEmail}>`;
	}

	const handleFromChange = (value: string) => {
		const match = value.match(/^(.*?)\s*<([^>]+)>$/);
		if (match) {
			setFromName(match[1]?.trim() || "");
			setFromEmail(match[2]?.trim() || "");
		} else {
			setFromEmail(value);
		}
	};

	const isReplyToValid = !replyTo || emailRegex.test(replyTo.trim());
	let replyToError: ErrorDetails | null = null;
	if (replyTo && !isReplyToValid) {
		replyToError = {
			title: "Invalid Reply-To Format",
			description:
				"Please enter a valid email address (e.g., replyto@example.com).",
		};
	}

	return (
		<div className="mx-auto mt-4 w-full max-w-160">
			{/* From Row */}
			<FieldRow id="campaign-send-details-from" label="From" required>
				<div className="relative flex w-full flex-1 items-center justify-between gap-2 text-label-sm text-text-sub-600">
					<input
						id="campaign-send-details-from"
						value={formattedFromValue}
						onChange={(e) => handleFromChange(e.target.value)}
						placeholder="Acme <acme@example.com>"
						className="flex-1 bg-transparent text-text-strong-950 outline-none placeholder:text-text-soft-400"
					/>
					<div className="flex items-center gap-2">
						{fromError && (
							<Tooltip.Provider delayDuration={0}>
								<Tooltip.Root>
									<Tooltip.Trigger asChild>
										<div className="flex cursor-pointer items-center justify-center text-error-base transition-colors hover:text-error-dark">
											<Icon name="cross-circle" className="h-4 w-4" />
										</div>
									</Tooltip.Trigger>
									<Tooltip.Content
										side="top"
										variant="light"
										size="medium"
										className="max-w-[300px]"
									>
										<ErrorTooltipContent error={fromError} />
									</Tooltip.Content>
								</Tooltip.Root>
							</Tooltip.Provider>
						)}
						{!showReplyTo && (
							<button
								type="button"
								onClick={() => setShowReplyTo(true)}
								className="font-medium text-paragraph-xs text-text-soft-400 transition-colors hover:text-text-strong-950"
							>
								Reply-To
							</button>
						)}
					</div>
				</div>
			</FieldRow>

			{/* Reply-To Row */}
			<AnimatePresence initial={false}>
				{showReplyTo && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2, ease: "easeInOut" }}
						className="overflow-hidden"
					>
						<FieldRow id="campaign-send-details-reply-to" label="Reply-To">
							<div className="relative flex w-full flex-1 items-center justify-between gap-2 text-label-sm text-text-sub-600">
								<input
									id="campaign-send-details-reply-to"
									value={replyTo}
									onChange={(e) => setReplyTo(e.target.value)}
									onBlur={() => {
										if (!replyTo.trim()) {
											setShowReplyTo(false);
										}
									}}
									placeholder="replyto@example.com"
									className="flex-1 bg-transparent text-label-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
								/>
								{replyToError && (
									<Tooltip.Provider delayDuration={0}>
										<Tooltip.Root>
											<Tooltip.Trigger asChild>
												<div className="flex cursor-pointer items-center justify-center text-error-base transition-colors hover:text-error-dark">
													<Icon name="cross-circle" className="h-4 w-4" />
												</div>
											</Tooltip.Trigger>
											<Tooltip.Content
												side="top"
												variant="light"
												size="medium"
												className="max-w-[300px]"
											>
												<ErrorTooltipContent error={replyToError} />
											</Tooltip.Content>
										</Tooltip.Root>
									</Tooltip.Provider>
								)}
							</div>
						</FieldRow>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Audience Row */}
			<FieldRow id="campaign-send-details-audience" label="To">
				<div className="flex w-full items-center gap-2 text-label-sm">
					<select
						value={audienceType}
						onChange={(e) => {
							const val = e.target.value as AudienceTargetType;
							if (val === "all") {
								setAudience("all", "", "All Contacts");
							} else if (val === "group") {
								const firstGroup = groups[0];
								setAudience(
									"group",
									firstGroup?.id || "",
									firstGroup?.name || "Group",
								);
							} else if (val === "channel") {
								const firstChannel = channels[0];
								setAudience(
									"channel",
									firstChannel?.id || "",
									firstChannel?.name || "Channel",
								);
							}
						}}
						className="rounded-md border border-stroke-soft-200 bg-bg-weak-50/50 px-2 py-0.5 font-medium text-text-strong-950 outline-none dark:border-stroke-soft-100/40 dark:bg-bg-soft-200 text-xs"
					>
						<option value="all">All Contacts</option>
						<option value="group">Contact Group</option>
						<option value="channel">Channel</option>
					</select>

					{audienceType === "group" && groups.length > 0 && (
						<select
							value={audienceTargetId}
							onChange={(e) => {
								const sel = groups.find((g) => g.id === e.target.value);
								setAudience("group", e.target.value, sel?.name || "Group");
							}}
							className="rounded-md border border-stroke-soft-200 bg-bg-weak-50/50 px-2 py-0.5 font-medium text-text-strong-950 outline-none dark:border-stroke-soft-100/40 dark:bg-bg-soft-200 text-xs"
						>
							{groups.map((g) => (
								<option key={g.id} value={g.id}>
									{g.name}
								</option>
							))}
						</select>
					)}

					{audienceType === "channel" && channels.length > 0 && (
						<select
							value={audienceTargetId}
							onChange={(e) => {
								const sel = channels.find((c) => c.id === e.target.value);
								setAudience("channel", e.target.value, sel?.name || "Channel");
							}}
							className="rounded-md border border-stroke-soft-200 bg-bg-weak-50/50 px-2 py-0.5 font-medium text-text-strong-950 outline-none dark:border-stroke-soft-100/40 dark:bg-bg-soft-200 text-xs"
						>
							{channels.map((c) => (
								<option key={c.id} value={c.id}>
									{c.name}
								</option>
							))}
						</select>
					)}
				</div>
			</FieldRow>

			{/* Subject Row */}
			<FieldRow id="campaign-send-details-subject" label="Subject" required>
				<input
					id="campaign-send-details-subject"
					value={subject}
					onChange={(e) => setSubject(e.target.value)}
					placeholder="Subject line..."
					className="w-full bg-transparent text-label-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
				/>
			</FieldRow>

			{/* Preview text Row */}
			<FieldRow
				id="campaign-send-details-preview-text"
				label="Preview"
			>
				<input
					id="campaign-send-details-preview-text"
					value={previewText}
					onChange={(e) => setPreviewText(e.target.value)}
					placeholder="Snippet displayed in inbox preview..."
					className="w-full bg-transparent text-label-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
				/>
			</FieldRow>
		</div>
	);
};
