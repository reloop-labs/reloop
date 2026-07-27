import Link from "next/link";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Tooltip from "@reloop/ui/tooltip";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import type { DomainListResponse } from "#/features/domain/types";
import { useSWR } from "#/features/templates/editor/lib/use-swr-compat";
import { useEditorStore } from "./use-editor-store";

const fetcher = (url: string) =>
	fetch(url, { credentials: "include" }).then((res) => res.json());

interface FieldRowProps {
	label: string;
	children: React.ReactNode;
	hideBorder?: boolean;
	required?: boolean;
}

const FieldRow = ({ label, children, hideBorder, required }: FieldRowProps) => {
	return (
		<div
			className={cn(
				"flex items-center border-stroke-soft-200 border-b px-3 py-3 dark:border-stroke-soft-100/50",
				hideBorder && "border-b-0",
			)}
		>
			<label
				htmlFor={label}
				className="w-20 shrink-0 text-label-sm text-text-sub-600"
			>
				{label}
				{required && (
					<span className="ml-0.5 text-error-base text-paragraph-xs">*</span>
				)}
			</label>
			<div className="flex flex-1 items-center">{children}</div>
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
					<Link href={error.actionLink} className="inline-flex items-center gap-1 font-semibold text-paragraph-xs text-primary-base transition-colors hover:text-primary-hover hover:underline">
						{error.actionText}
						<Icon name="arrow-right" className="h-3 w-3" />
					</Link>
				</div>
			)}
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

	const { activeOrganization } = useActiveOrganization();
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
		<div className="mx-auto mt-4 w-full max-w-[600px] overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/50">
			{/* From Row */}
			<FieldRow label="From" required>
				<div className="relative flex w-full flex-1 items-center justify-between gap-2 text-label-sm text-text-sub-600">
					<input
						value={fromEmail}
						onChange={(e) => setFromEmail(e.target.value)}
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
						<FieldRow label="Reply-To">
							<div className="relative flex w-full flex-1 items-center justify-between gap-2 text-label-sm text-text-sub-600">
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

			{/* Preview Row */}
			<FieldRow label="Preview" required>
				<input
					value={previewText}
					onChange={(e) => setPreviewText(e.target.value)}
					placeholder="Preview text"
					className="flex-1 bg-transparent text-label-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
				/>
			</FieldRow>

			<FieldRow label="Subject" required hideBorder>
				<input
					value={subject}
					onChange={(e) => setSubject(e.target.value)}
					placeholder="Subject"
					className="flex-1 bg-transparent font-medium text-label-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
				/>
			</FieldRow>
		</div>
	);
};
