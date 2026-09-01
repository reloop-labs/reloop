"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import * as Tooltip from "@reloop/ui/tooltip";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import type React from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useDomainsQuery } from "#/features/domain/hooks/use-domains-query";
import { useCampaignEditorStore } from "../campaign-editor-store";
import { CampaignFieldRow } from "./campaign-field-row";

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

interface SuggestedSender {
	name: string;
	email: string;
	handle: string;
	domain: string;
	formatted: string;
}

export const CampaignFromField = () => {
	const fromName = useCampaignEditorStore((s) => s.fromName);
	const setFromName = useCampaignEditorStore((s) => s.setFromName);
	const fromEmail = useCampaignEditorStore((s) => s.fromEmail);
	const setFromEmail = useCampaignEditorStore((s) => s.setFromEmail);
	const replyTo = useCampaignEditorStore((s) => s.replyTo);
	const setReplyTo = useCampaignEditorStore((s) => s.setReplyTo);

	const { user, activeOrganization } = useActiveOrganization();

	// Fetch organization domains
	const domainsQuery = useDomainsQuery({
		page: 1,
		limit: 100,
		q: "",
		status: [],
	});

	const [showReplyTo, setShowReplyTo] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [highlightIndex, setHighlightIndex] = useState(0);

	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const listboxId = useId();

	useEffect(() => {
		if (replyTo) {
			setShowReplyTo(true);
		}
	}, [replyTo]);

	// Filter domains that have sending enabled & verified
	const verifiedSendingDomains = useMemo(() => {
		const list = domainsQuery.data?.domains || [];
		return list.filter((d) => {
			const isVerified =
				d.status === "active" || d.systemVerified || d.userVerifiedDomain;
			const isSending = d.isSendingEmailEnabled !== false;
			return isVerified && isSending;
		});
	}, [domainsQuery.data?.domains]);

	const verifiedDomainNames = useMemo(
		() => verifiedSendingDomains.map((d) => d.domain.toLowerCase()),
		[verifiedSendingDomains],
	);

	// Compute initial / controlled input value
	const getDisplayValue = () => {
		if (fromName && fromEmail && !fromEmail.includes("<")) {
			return `${fromName} <${fromEmail}>`;
		}
		return fromEmail || fromName || "";
	};

	const [inputValue, setInputValue] = useState(getDisplayValue);

	// Sync input with external store changes when not focused
	useEffect(() => {
		if (!isDropdownOpen) {
			setInputValue(getDisplayValue());
		}
	}, [fromName, fromEmail, isDropdownOpen]);

	// Parse input into name, handle/prefix, and email query
	const parsedInput = useMemo(() => {
		const trimmed = inputValue.trim();
		const angleMatch = trimmed.match(/^(.*?)\s*<([^>]*)>?$/);
		if (angleMatch) {
			const namePart = angleMatch[1]?.trim() || "";
			const emailPart = angleMatch[2]?.trim() || "";
			const isComplete = Boolean(emailPart.includes("@") && emailPart.includes("."));
			const [handlePart = "", domainPart = ""] = emailPart.split("@");
			return {
				name: namePart,
				email: emailPart,
				handle: handlePart,
				domain: domainPart,
				isComplete,
				query: isComplete ? "" : emailPart.toLowerCase(),
			};
		}

		if (trimmed.includes("@")) {
			const isComplete = Boolean(trimmed.includes("."));
			const [handlePart = "", domainPart = ""] = trimmed.split("@");
			return {
				name: fromName || "",
				email: trimmed,
				handle: handlePart,
				domain: domainPart,
				isComplete,
				query: isComplete ? "" : trimmed.toLowerCase(),
			};
		}

		return {
			name: trimmed,
			email: "",
			handle: "",
			domain: "",
			isComplete: false,
			query: "",
		};
	}, [inputValue, fromName]);

	// Generate dynamic email suggestions based on verified sending domains
	const suggestions = useMemo((): SuggestedSender[] => {
		if (verifiedSendingDomains.length === 0) return [];

		// Determine base sender name
		const defaultName =
			parsedInput.name ||
			fromName ||
			activeOrganization?.name ||
			user?.name ||
			"Team";

		// Common handle prefixes
		const standardHandles = [
			"team",
			"hello",
			"newsletter",
			"notifications",
			"support",
		];

		const userHandle = user?.email?.split("@")[0]?.toLowerCase();
		if (userHandle && !standardHandles.includes(userHandle)) {
			standardHandles.unshift(userHandle);
		}

		const typedHandle = parsedInput.handle.toLowerCase();
		const typedDomain = parsedInput.domain.toLowerCase();

		const result: SuggestedSender[] = [];
		const allDefaults: SuggestedSender[] = [];

		for (const domainObj of verifiedSendingDomains) {
			const domainName = domainObj.domain.toLowerCase();

			// If user typed a custom handle that's not standard, suggest it
			if (typedHandle && !standardHandles.includes(typedHandle)) {
				const customItem = {
					name: defaultName,
					email: `${typedHandle}@${domainName}`,
					handle: typedHandle,
					domain: domainName,
					formatted: `${defaultName} <${typedHandle}@${domainName}>`,
				};
				allDefaults.push(customItem);
				if (!typedDomain || domainName.includes(typedDomain)) {
					result.push(customItem);
				}
			}

			// Add standard suggestions
			for (const handle of standardHandles) {
				const email = `${handle}@${domainName}`;
				const formatted = `${defaultName} <${email}>`;
				const standardItem = {
					name: defaultName,
					email,
					handle,
					domain: domainName,
					formatted,
				};

				allDefaults.push(standardItem);

				// Filter by query if user is actively searching
				if (
					parsedInput.query &&
					!email.includes(parsedInput.query) &&
					!domainName.includes(parsedInput.query) &&
					!defaultName.toLowerCase().includes(parsedInput.query)
				) {
					continue;
				}

				if (typedDomain && !domainName.includes(typedDomain)) {
					continue;
				}

				result.push(standardItem);
			}
		}

		// If query filtered out everything, fallback to showing all default suggestions
		const finalSuggestions = result.length > 0 ? result : allDefaults;
		return finalSuggestions.slice(0, 8);
	}, [
		verifiedSendingDomains,
		parsedInput,
		fromName,
		activeOrganization?.name,
		user?.name,
		user?.email,
	]);

	// Auto-correct & update store as the user types
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		setInputValue(val);
		setHighlightIndex(0);
		if (!isDropdownOpen) {
			setIsDropdownOpen(true);
		}

		// Real-time parsing and auto-correction into store
		const match = val.match(/^(.*?)\s*<([^>]+)>?$/);
		if (match) {
			const name = match[1]?.trim() || "";
			const email = match[2]?.replace(/>$/, "").trim() || "";
			setFromName(name);
			setFromEmail(email);
		} else if (val.includes("@")) {
			const email = val.trim();
			setFromEmail(email);
			if (!fromName && activeOrganization?.name) {
				setFromName(activeOrganization.name);
			}
		} else {
			setFromName(val.trim());
		}
	};

	// Apply selected suggestion with auto-correction
	const handleSelectSuggestion = (suggestion: SuggestedSender) => {
		// Use user's typed name if provided, otherwise fallback to suggestion's name
		const resolvedName =
			parsedInput.name ||
			fromName ||
			suggestion.name ||
			activeOrganization?.name ||
			"";

		const finalFormatted = resolvedName
			? `${resolvedName} <${suggestion.email}>`
			: suggestion.email;

		setFromName(resolvedName);
		setFromEmail(suggestion.email);
		setInputValue(finalFormatted);
		setIsDropdownOpen(false);
		inputRef.current?.focus();
	};

	// Keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!isDropdownOpen) {
			if (e.key === "ArrowDown" || e.key === "Enter") {
				setIsDropdownOpen(true);
				e.preventDefault();
			}
			return;
		}

		if (e.key === "ArrowDown") {
			e.preventDefault();
			setHighlightIndex((prev) =>
				suggestions.length > 0 ? (prev + 1) % suggestions.length : 0,
			);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setHighlightIndex((prev) =>
				suggestions.length > 0
					? (prev - 1 + suggestions.length) % suggestions.length
					: 0,
			);
		} else if (e.key === "Enter") {
			if (suggestions.length > 0 && suggestions[highlightIndex]) {
				e.preventDefault();
				handleSelectSuggestion(suggestions[highlightIndex]);
			}
		} else if (e.key === "Escape") {
			setIsDropdownOpen(false);
		} else if (e.key === "Tab") {
			setIsDropdownOpen(false);
		}
	};

	// Close on click outside
	useEffect(() => {
		const handleClickOutside = (e: PointerEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		};

		document.addEventListener("pointerdown", handleClickOutside);
		return () => {
			document.removeEventListener("pointerdown", handleClickOutside);
		};
	}, []);

	// Validation
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
		verifiedDomainNames.includes(fromDomain);

	let fromError: ErrorDetails | null = null;
	if (fromEmail) {
		if (!isFromEmailValid) {
			fromError = {
				title: "Invalid Email Format",
				description:
					"Please enter a valid email address (e.g., sender@example.com).",
			};
		} else if (!isFromDomainVerified && !domainsQuery.isLoading) {
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

	const isLoadingDomains =
		domainsQuery.isLoading || (isDropdownOpen && domainsQuery.isFetching);

	return (
		<>
			{/* From Row */}
			<CampaignFieldRow
				id="campaign-send-details-from"
				label="From"
				required
				infoTooltip={{
					title: "Sender Identity",
					description:
						"Sender name and email address that will be displayed in the recipient's inbox.",
				}}
			>
				<div
					ref={containerRef}
					className="relative flex w-full flex-1 items-center justify-between gap-2 text-label-sm text-text-sub-600"
				>
					<div className="relative flex flex-1 items-center">
						<input
							ref={inputRef}
							id="campaign-send-details-from"
							value={inputValue}
							onChange={handleInputChange}
							onFocus={() => setIsDropdownOpen(true)}
							onKeyDown={handleKeyDown}
							placeholder="Acme <acme@example.com>"
							autoComplete="off"
							role="combobox"
							aria-expanded={isDropdownOpen}
							aria-controls={listboxId}
							className="w-full bg-transparent text-text-strong-950 outline-none placeholder:text-text-soft-400"
						/>
					</div>

					<div className="flex items-center gap-2">
						{/* Loading indicator while fetching domains */}
						{isLoadingDomains && (
							<div
								className="flex items-center justify-center text-text-soft-400 transition-opacity"
								title="Loading sending domains..."
							>
								<Spinner size={14} />
							</div>
						)}

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

					{/* Suggestions Dropdown */}
					<AnimatePresence>
						{isDropdownOpen && (
							<motion.div
								id={listboxId}
								role="listbox"
								initial={{ opacity: 0, y: -4, scale: 0.98 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								exit={{ opacity: 0, y: -4, scale: 0.98 }}
								transition={{ duration: 0.15, ease: "easeOut" }}
								className="absolute top-full left-0 z-50 mt-2.5 w-full min-w-[320px] max-w-[420px] overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 dark:border-stroke-soft-100/40 dark:bg-bg-soft-200"
							>
								{isLoadingDomains && suggestions.length === 0 ? (
									<div className="flex items-center justify-center gap-2.5 py-6 text-paragraph-xs text-text-sub-600">
										<Spinner size={16} />
										<span>Fetching verified sending domains...</span>
									</div>
								) : verifiedSendingDomains.length === 0 ? (
									<div className="flex flex-col gap-2 p-3 text-left">
										<div className="flex items-center gap-2 text-text-sub-600">
											<Icon
												name="alert-circle"
												className="h-4 w-4 text-warning-base"
											/>
											<span className="font-medium text-label-xs text-text-strong-950">
												No Sending Domains Found
											</span>
										</div>
										<p className="text-paragraph-xs text-text-sub-600">
											You must have at least one verified domain with sending
											enabled to dispatch campaigns.
										</p>
									</div>
								) : (
									<div className="max-h-56 overflow-y-auto">
										{suggestions.map((item, idx) => {
											const isSelected = idx === highlightIndex;
											const isExactMatch =
												fromEmail.toLowerCase() === item.email.toLowerCase();

											return (
												<button
													key={`${item.email}-${idx}`}
													type="button"
													role="option"
													aria-selected={isSelected}
													onMouseDown={(e) => {
														e.preventDefault(); // Prevent input blur before click handler
														handleSelectSuggestion(item);
													}}
													onMouseEnter={() => setHighlightIndex(idx)}
													className={cn(
														"flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left",
														isSelected
															? "bg-bg-weak-50 text-text-strong-950 dark:bg-bg-sub-300/40"
															: "text-text-sub-600 hover:bg-bg-weak-50/70 dark:hover:bg-bg-sub-300/20",
													)}
												>
													<div className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-label-xs">
														<span className="shrink-0 font-medium text-text-strong-950">
															{item.name}
														</span>
														<span className="truncate text-text-sub-600">
															&lt;{item.email}&gt;
														</span>
													</div>
												</button>
											);
										})}
									</div>
								)}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</CampaignFieldRow>

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
						<CampaignFieldRow
							id="campaign-send-details-reply-to"
							label="Reply-To"
							infoTooltip={{
								title: "Reply-To Address",
								description:
									"Optional email address where recipient replies will be delivered.",
							}}
						>
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
						</CampaignFieldRow>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
};
