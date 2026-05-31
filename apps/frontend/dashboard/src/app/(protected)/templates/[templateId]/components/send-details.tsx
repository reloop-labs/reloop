"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import type { DomainListResponse } from "@fe/dashboard/types/api.types";
import { cn } from "@reloop/ui/cn";
import * as Tooltip from "@reloop/ui/tooltip";
import { XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { useEditorStore } from "./use-editor-store";

const fetcher = (url: string) =>
	fetch(url, { credentials: "include" }).then((res) => res.json());

interface FieldRowProps {
	label: string;
	children: React.ReactNode;
	hideBorder?: boolean;
}

const FieldRow = ({ label, children, hideBorder }: FieldRowProps) => {
	return (
		<div
			className={cn(
				"flex items-center border-stroke-soft-200 border-b px-3 py-3",
				hideBorder && "border-b-0",
			)}
		>
			<label
				htmlFor={label}
				className="w-20 shrink-0 text-sm text-text-sub-600"
			>
				{label}
			</label>
			<div className="flex flex-1 items-center">{children}</div>
		</div>
	);
};

export const SendDetails = () => {
	const fromEmail = useEditorStore((s) => s.fromEmail);
	const setFromEmail = useEditorStore((s) => s.setFromEmail);
	const replyTo = useEditorStore((s) => s.replyTo);
	const setReplyTo = useEditorStore((s) => s.setReplyTo);
	const previewText = useEditorStore((s) => s.previewText);
	const setPreviewText = useEditorStore((s) => s.setPreviewText);
	const subject = useEditorStore((s) => s.subject);
	const setSubject = useEditorStore((s) => s.setSubject);

	const [showReplyTo, setShowReplyTo] = useState(false);
	const replyToInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (replyTo) {
			setShowReplyTo(true);
		}
	}, [replyTo]);

	useEffect(() => {
		if (showReplyTo) {
			replyToInputRef.current?.focus();
		}
	}, [showReplyTo]);

	const { activeOrganization } = useUserOrganization();
	const { data: domainData } = useSWR<DomainListResponse>(
		activeOrganization?.id
			? `/api/domain/v1/list?organizationId=${activeOrganization.id}`
			: null,
		fetcher,
	);

	const verifiedDomains = (domainData?.domains || [])
		.filter(
			(d) => d.status === "active" || d.systemVerified || d.userVerifiedDomain,
		)
		.map((d) => d.domain.toLowerCase());

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	const parseFromEmail = (input: string | null | undefined) => {
		if (!input) return "";
		const match = input.match(/<([^>]+)>/);
		if (match && match[1]) return match[1].trim();
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

	let fromError: string | null = null;
	if (fromEmail) {
		if (!isFromEmailValid) {
			fromError = "Invalid from email address.";
		} else if (!isFromDomainVerified) {
			fromError = "You can only use verified domains.";
		}
	}

	const isReplyToValid = !replyTo || emailRegex.test(replyTo.trim());
	let replyToError: string | null = null;
	if (replyTo && !isReplyToValid) {
		replyToError = "Invalid reply-to email address.";
	}

	return (
		<div className="mx-auto mt-4 w-full max-w-[600px] overflow-hidden rounded-2xl border border-stroke-soft-200">
			{/* From Row */}
			<FieldRow label="From">
				<div className="relative flex w-full flex-1 items-center justify-between gap-2 text-sm text-text-sub-600">
					<input
						value={fromEmail}
						onChange={(e) => setFromEmail(e.target.value)}
						placeholder="Acme <acme@example.com>"
						className="flex-1 bg-transparent text-text-strong-950 outline-none placeholder:text-text-soft-400"
					/>
					<div className="flex items-center gap-2">
						{fromError && (
							<Tooltip.Root>
								<Tooltip.Trigger asChild>
									<div className="flex cursor-pointer items-center justify-center text-red-500 transition-transform hover:scale-105 dark:text-red-400">
										<XCircle size={15} />
									</div>
								</Tooltip.Trigger>
								<Tooltip.Content side="top">{fromError}</Tooltip.Content>
							</Tooltip.Root>
						)}
						{!showReplyTo && (
							<button
								type="button"
								onClick={() => setShowReplyTo(true)}
								className="font-medium text-[13px] text-text-soft-400 transition-colors hover:text-text-strong-950"
							>
								Reply-To
							</button>
						)}
					</div>
				</div>
			</FieldRow>

			{/* Reply-To Row */}
			{showReplyTo && (
				<FieldRow label="Reply-To">
					<div className="relative flex w-full flex-1 items-center justify-between gap-2 text-sm text-text-sub-600">
						<input
							ref={replyToInputRef}
							value={replyTo}
							onChange={(e) => setReplyTo(e.target.value)}
							onBlur={() => {
								if (!replyTo.trim()) {
									setShowReplyTo(false);
								}
							}}
							placeholder="replyto@example.com"
							className="flex-1 bg-transparent text-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
						/>
						{replyToError && (
							<Tooltip.Root>
								<Tooltip.Trigger asChild>
									<div className="flex cursor-pointer items-center justify-center text-red-500 transition-transform hover:scale-105 dark:text-red-400">
										<XCircle size={15} />
									</div>
								</Tooltip.Trigger>
								<Tooltip.Content side="top">{replyToError}</Tooltip.Content>
							</Tooltip.Root>
						)}
					</div>
				</FieldRow>
			)}

			{/* Preview Row */}
			<FieldRow label="Preview">
				<input
					value={previewText}
					onChange={(e) => setPreviewText(e.target.value)}
					placeholder="Preview text"
					className="flex-1 bg-transparent text-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
				/>
			</FieldRow>

			<FieldRow label="Subject" hideBorder>
				<input
					value={subject}
					onChange={(e) => setSubject(e.target.value)}
					placeholder="Subject"
					className="flex-1 bg-transparent font-medium text-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
				/>
			</FieldRow>
		</div>
	);
};
