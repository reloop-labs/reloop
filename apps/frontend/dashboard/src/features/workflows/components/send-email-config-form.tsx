"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import * as Tooltip from "@reloop/ui/tooltip";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useDomainsQuery } from "#/features/domain/hooks/use-domains-query";
import {
	createTemplate,
	type Template,
	useTemplateDetailQuery,
	useTemplatesQuery,
} from "#/features/templates/hooks/use-templates-query";
import { queryKeys } from "#/lib/query-keys";
import type { SendEmailNodeData } from "../workflow-types";

interface SendEmailConfigFormProps {
	value: SendEmailNodeData;
	onChange: (data: SendEmailNodeData) => void;
	/** Prefix for label/input ids so multiple nodes can share the canvas. */
	idPrefix?: string;
}

const templateThumbnailSrc = (template: Template): string => {
	const bust = template.updatedAt
		? `?t=${encodeURIComponent(template.updatedAt)}`
		: "";
	if (template.thumbnailUrl) return `${template.thumbnailUrl}${bust}`;
	return `/api/template/v1/${template.id}/thumbnail${bust}`;
};

const TemplateThumb = ({ template }: { template: Template }) => {
	const [failed, setFailed] = useState(false);
	return (
		<div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#141419]">
			{failed ? (
				<div className="flex h-full w-full items-center justify-center text-text-soft-400">
					<Icon name="image-upload" className="h-5 w-5" />
				</div>
			) : (
				<img
					src={templateThumbnailSrc(template)}
					alt={`Preview of ${template.name}`}
					className="h-full w-full object-cover object-top"
					loading="lazy"
					decoding="async"
					onError={() => setFailed(true)}
				/>
			)}
			{template.status === "draft" ? (
				<span className="absolute top-1.5 right-1.5 rounded-full bg-bg-white-0/90 px-1.5 py-0.5 font-medium text-[10px] text-text-sub-600 shadow-2xs backdrop-blur-xs dark:bg-black/80 dark:text-white/70">
					Draft
				</span>
			) : null}
		</div>
	);
};

const TemplateDetailPreview = ({
	templateId,
	templateName,
	detail,
	isLoading,
}: {
	templateId: string;
	templateName: string;
	detail?: Template | null;
	isLoading: boolean;
}) => {
	const [failed, setFailed] = useState(false);
	const src = templateThumbnailSrc({
		id: templateId,
		updatedAt: detail?.updatedAt ?? "",
		thumbnailUrl: detail?.thumbnailUrl ?? null,
	} as Template);

	if (isLoading) {
		return (
			<div className="nodrag nopan nowheel flex aspect-[4/3] w-full cursor-default select-none items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 text-xs dark:border-stroke-soft-100/40 dark:bg-[#141419]">
				Loading preview…
			</div>
		);
	}

	if (failed) {
		return (
			<div className="nodrag nopan nowheel flex aspect-[4/3] w-full cursor-default select-none items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 text-text-soft-400 dark:border-stroke-soft-100/40 dark:bg-[#141419]">
				<Icon name="image-upload" className="pointer-events-none h-6 w-6" />
			</div>
		);
	}

	return (
		<div className="nodrag nopan nowheel cursor-default select-none overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#141419]">
			<img
				src={src}
				alt={`Preview of ${templateName}`}
				className="pointer-events-none max-h-72 w-full select-none object-cover object-top"
				loading="lazy"
				decoding="async"
				draggable={false}
				onError={() => setFailed(true)}
			/>
		</div>
	);
};

const TemplatePicker = ({
	value,
	onChange,
}: {
	value: SendEmailNodeData;
	onChange: (data: SendEmailNodeData) => void;
}) => {
	const queryClient = useQueryClient();
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [creating, setCreating] = useState(false);
	const templatesQuery = useTemplatesQuery();
	const templates = templatesQuery.data?.templates ?? [];

	const filtered = useMemo(() => {
		const q = search.toLowerCase().trim();
		if (!q) return templates;
		return templates.filter(
			(t) =>
				t.name.toLowerCase().includes(q) ||
				(t.subject?.toLowerCase().includes(q) ?? false),
		);
	}, [templates, search]);

	const selectTemplate = (template: Template) => {
		if (template.id === value.templateId) {
			onChange({ ...value, templateId: "" });
			return;
		}
		onChange({ ...value, templateId: template.id });
	};

	const handleCreateNew = async () => {
		if (creating) return;
		setCreating(true);
		try {
			const template = await createTemplate();
			await queryClient.invalidateQueries({
				queryKey: queryKeys.templates.all,
			});
			router.push(`/templates/${template.id}`);
		} catch {
			toast.error("Failed to create template");
			setCreating(false);
		}
	};

	return (
		<div className="space-y-2">
			<div className="relative">
				<Icon
					name="search"
					className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-4 w-4 text-text-soft-400"
				/>
				<input
					type="text"
					placeholder="Search templates..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					onKeyDown={(e) => e.stopPropagation()}
					aria-label="Search templates"
					className="w-full rounded-xl border border-stroke-soft-100 bg-bg-white-0 py-2 pr-3 pl-9 text-sm text-text-strong-950 outline-none placeholder:text-text-soft-400 focus:border-blue-500"
				/>
			</div>
			{templatesQuery.isLoading ? (
				<p className="px-1 py-4 text-center text-text-sub-600 text-xs">
					Loading templates…
				</p>
			) : filtered.length === 0 && templates.length === 0 ? (
				<p className="px-1 py-4 text-center text-text-sub-600 text-xs">
					No templates yet. Create your first one below.
				</p>
			) : filtered.length === 0 ? (
				<p className="px-1 py-4 text-center text-text-sub-600 text-xs">
					No templates match “{search.trim()}”.
				</p>
			) : null}
			<div className="nowheel scrollbar-thin grid max-h-64 grid-cols-2 gap-2 overflow-y-auto overflow-x-hidden overscroll-contain p-0.5">
				{filtered.map((template) => {
					const isSelected = value.templateId === template.id;
					return (
						<button
							key={template.id}
							type="button"
							onClick={() => selectTemplate(template)}
							aria-pressed={isSelected}
							title={template.name}
							className="group flex min-w-0 flex-col gap-1.5 rounded-xl p-1.5 text-left transition-colors hover:bg-bg-weak-50 dark:hover:bg-white/[0.06]"
						>
							<span
								className={cn(
									"relative block w-full overflow-hidden rounded-lg transition-all",
									isSelected &&
										"ring-2 ring-blue-500 ring-offset-1 ring-offset-bg-weak-50/50 dark:ring-offset-black/50",
								)}
							>
								<TemplateThumb template={template} />
								{isSelected ? (
									<span className="absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white shadow-xs">
										<Icon name="check" className="h-3 w-3" />
									</span>
								) : null}
							</span>
							<span className="w-full truncate px-0.5 font-medium text-text-strong-950 text-xs">
								{template.name}
							</span>
						</button>
					);
				})}
				<button
					type="button"
					onClick={() => void handleCreateNew()}
					disabled={creating}
					className="group flex min-w-0 flex-col gap-1.5 rounded-xl p-1.5 text-left transition-colors hover:bg-bg-weak-50 disabled:cursor-wait disabled:opacity-60 dark:hover:bg-white/[0.06]"
				>
					<span className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-lg border border-stroke-soft-200 border-dashed bg-bg-white-0 text-text-sub-600 transition-colors group-hover:border-blue-500 group-hover:text-text-strong-950 dark:border-stroke-soft-100/60 dark:bg-[#141419] dark:group-hover:border-blue-400 dark:group-hover:text-white">
						<Icon name="plus" className="h-5 w-5" />
						<span className="font-medium text-xs">
							{creating ? "Creating…" : "New template"}
						</span>
					</span>
					<span className="w-full truncate px-0.5 font-medium text-text-sub-600 text-xs transition-colors group-hover:text-text-strong-950 dark:group-hover:text-white">
						Create new
					</span>
				</button>
			</div>
		</div>
	);
};

type TemplateVersion = {
	id: string;
	version: number;
	subject?: string | null;
	fromEmail?: string | null;
	replyTo?: string | null;
	previewText?: string | null;
	content?: unknown;
	renderedHtml?: string | null;
	isMajor?: boolean;
};

const fetchVersions = async (
	templateId: string,
): Promise<TemplateVersion[]> => {
	const res = await fetch(`/api/template/v1/${templateId}/versions`, {
		credentials: "include",
	});
	if (!res.ok) throw new Error(`Failed to load versions (${res.status})`);
	return res.json() as Promise<TemplateVersion[]>;
};

interface ErrorDetails {
	title: string;
	description: string;
	actionText?: string;
	actionLink?: string;
}

const ErrorTooltipContent = ({ error }: { error: ErrorDetails }) => {
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

const getAppropriateSenderName = (
	handle: string,
	userName?: string | null,
	userEmail?: string | null,
	explicitName?: string,
) => {
	if (explicitName?.trim()) {
		return explicitName.trim();
	}

	const cleanHandle = handle.toLowerCase();
	const userHandle = userEmail?.split("@")[0]?.toLowerCase();

	if (userHandle && cleanHandle === userHandle) {
		return (
			userName || cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1)
		);
	}

	switch (cleanHandle) {
		case "team":
			return "Team";
		case "support":
		case "help":
			return "Support";
		case "notifications":
		case "alerts":
			return "Notifications";
		case "newsletter":
		case "news":
		case "updates":
			return "Newsletter";
		case "hello":
		case "hi":
		case "contact":
		case "info":
			return "Hello";
		case "billing":
			return "Billing";
		case "security":
			return "Security";
		default: {
			return cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1);
		}
	}
};

interface SuggestedSender {
	name: string;
	email: string;
	handle: string;
	domain: string;
	formatted: string;
}

interface WorkflowSenderSectionProps {
	persistedFrom: string;
	persistedReply: string;
	onSave: (data: { fromEmail: string; replyTo: string }) => Promise<void>;
	isSaving?: boolean;
	onDraftChange?: (draft: { from?: string; reply?: string }) => void;
}

const WorkflowSenderSection = ({
	persistedFrom,
	persistedReply,
	onSave,
	isSaving,
	onDraftChange,
}: WorkflowSenderSectionProps) => {
	const { user } = useActiveOrganization();
	const domainsQuery = useDomainsQuery({
		page: 1,
		limit: 100,
		q: "",
		status: [],
	});

	const [inputValue, setInputValue] = useState(persistedFrom);
	const [replyValue, setReplyValue] = useState(persistedReply);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [highlightIndex, setHighlightIndex] = useState(0);

	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const listboxId = useId();

	useEffect(() => {
		if (!isDropdownOpen) {
			setInputValue(persistedFrom);
		}
	}, [persistedFrom, isDropdownOpen]);

	useEffect(() => {
		setReplyValue(persistedReply);
	}, [persistedReply]);

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

	const parsedInput = useMemo(() => {
		const trimmed = inputValue.trim();
		const angleMatch = trimmed.match(/^(.*?)\s*<([^>]*)>?$/);
		if (angleMatch) {
			const namePart = angleMatch[1]?.trim() || "";
			const emailPart = angleMatch[2]?.trim() || "";
			const isComplete = Boolean(
				emailPart.includes("@") && emailPart.includes("."),
			);
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
				name: "",
				email: trimmed,
				handle: handlePart,
				domain: domainPart,
				isComplete,
				query: isComplete ? "" : trimmed.toLowerCase(),
			};
		}

		return {
			name: "",
			email: "",
			handle: trimmed,
			domain: "",
			isComplete: false,
			query: trimmed.toLowerCase(),
		};
	}, [inputValue]);

	const suggestions = useMemo((): SuggestedSender[] => {
		if (verifiedSendingDomains.length === 0) return [];

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

			if (typedHandle && !standardHandles.includes(typedHandle)) {
				const itemName = getAppropriateSenderName(
					typedHandle,
					user?.name,
					user?.email,
					parsedInput.name,
				);
				const customItem = {
					name: itemName,
					email: `${typedHandle}@${domainName}`,
					handle: typedHandle,
					domain: domainName,
					formatted: `${itemName} <${typedHandle}@${domainName}>`,
				};
				allDefaults.push(customItem);
				if (!typedDomain || domainName.includes(typedDomain)) {
					result.push(customItem);
				}
			}

			for (const handle of standardHandles) {
				const itemName = getAppropriateSenderName(
					handle,
					user?.name,
					user?.email,
					parsedInput.name,
				);
				const email = `${handle}@${domainName}`;
				const formatted = `${itemName} <${email}>`;
				const standardItem = {
					name: itemName,
					email,
					handle,
					domain: domainName,
					formatted,
				};

				allDefaults.push(standardItem);

				if (
					parsedInput.query &&
					!email.includes(parsedInput.query) &&
					!domainName.includes(parsedInput.query) &&
					!itemName.toLowerCase().includes(parsedInput.query)
				) {
					continue;
				}

				if (typedDomain && !domainName.includes(typedDomain)) {
					continue;
				}

				result.push(standardItem);
			}
		}

		const finalSuggestions = result.length > 0 ? result : allDefaults;
		return finalSuggestions.slice(0, 8);
	}, [verifiedSendingDomains, parsedInput, user?.name, user?.email]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		setInputValue(val);
		setHighlightIndex(0);
		if (!isDropdownOpen) {
			setIsDropdownOpen(true);
		}
		onDraftChange?.({ from: val });
	};

	const handleSelectSuggestion = (suggestion: SuggestedSender) => {
		const finalFormatted = suggestion.formatted;
		setInputValue(finalFormatted);
		onDraftChange?.({ from: finalFormatted });
		setIsDropdownOpen(false);
		inputRef.current?.focus();
		void onSave({ fromEmail: finalFormatted, replyTo: replyValue });
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		e.stopPropagation();
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
			e.preventDefault();
			if (suggestions.length > 0 && suggestions[highlightIndex]) {
				handleSelectSuggestion(suggestions[highlightIndex]);
			} else {
				setIsDropdownOpen(false);
				inputRef.current?.blur();
			}
		} else if (e.key === "Escape" || e.key === "Tab") {
			setIsDropdownOpen(false);
		}
	};

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

	const handleFromBlur = () => {
		if (inputValue !== persistedFrom) {
			void onSave({ fromEmail: inputValue, replyTo: replyValue });
		}
	};

	const handleReplyBlur = () => {
		if (replyValue !== persistedReply) {
			void onSave({ fromEmail: inputValue, replyTo: replyValue });
		}
	};

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const parseEmailAddress = (input: string) => {
		const match = input.match(/<([^>]+)>/);
		if (match?.[1]) return match[1].trim();
		return input.trim();
	};

	const fromEmailAddress = parseEmailAddress(inputValue);
	const fromDomain = fromEmailAddress.includes("@")
		? fromEmailAddress.split("@")[1]?.toLowerCase() || ""
		: "";

	const isFromEmailValid = !inputValue || emailRegex.test(fromEmailAddress);
	const isFromDomainVerified =
		!fromEmailAddress ||
		!isFromEmailValid ||
		verifiedDomainNames.includes(fromDomain);

	let fromError: ErrorDetails | null = null;
	if (inputValue.trim()) {
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

	const isReplyToValid =
		!replyValue.trim() || emailRegex.test(replyValue.trim());
	let replyToError: ErrorDetails | null = null;
	if (replyValue.trim() && !isReplyToValid) {
		replyToError = {
			title: "Invalid Reply-To Format",
			description:
				"Please enter a valid email address (e.g., replyto@example.com).",
		};
	}

	const fromMissing = inputValue.trim().length === 0;
	const isLoadingDomains =
		domainsQuery.isLoading || (isDropdownOpen && domainsQuery.isFetching);

	return (
		<div className="flex flex-col gap-2 rounded-xl bg-bg-weak-50/60 p-3">
			<div className="flex items-center justify-between">
				<p className="font-medium text-sm text-text-strong-950">From</p>
			</div>

			{/* From input with combobox suggestions */}
			<div
				ref={containerRef}
				className={cn(
					"nodrag relative flex w-full items-center justify-between gap-2 rounded-xl border bg-bg-white-0 px-3 py-2 text-sm transition-colors dark:border-stroke-soft-100/40 dark:bg-bg-sub-300",
					fromMissing || fromError
						? "border-error-base"
						: isDropdownOpen
							? "border-blue-500 ring-2 ring-blue-500/10"
							: "border-stroke-soft-100 hover:border-stroke-soft-200",
					isSaving && "opacity-60",
				)}
			>
				<input
					ref={inputRef}
					type="text"
					placeholder="Acme <acme@example.com>"
					value={inputValue}
					onChange={handleInputChange}
					onFocus={() => setIsDropdownOpen(true)}
					onKeyDown={handleKeyDown}
					onBlur={handleFromBlur}
					autoComplete="off"
					role="combobox"
					aria-expanded={isDropdownOpen}
					aria-controls={listboxId}
					aria-label="From email"
					aria-invalid={fromMissing || Boolean(fromError) || undefined}
					disabled={isSaving}
					className="w-full bg-transparent text-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
				/>

				<div className="flex shrink-0 items-center gap-2">
					{isLoadingDomains && (
						<div
							className="flex items-center justify-center text-text-soft-400"
							title="Loading sending domains..."
						>
							<Spinner size={14} />
						</div>
					)}

					{fromError && (
						<Tooltip.Provider delayDuration={0}>
							<Tooltip.Root>
								<Tooltip.Trigger asChild>
									<button
										type="button"
										className="flex cursor-pointer items-center justify-center text-error-base transition-colors hover:text-error-dark"
										tabIndex={-1}
									>
										<Icon name="cross-circle" className="h-4 w-4" />
									</button>
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
							className="nodrag absolute top-full left-0 z-50 mt-1.5 w-full min-w-[280px] max-w-full overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-lg dark:border-stroke-soft-100/40 dark:bg-bg-soft-200"
							onMouseDown={(e) => e.stopPropagation()}
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
										enabled to send emails.
									</p>
									<Link
										href="/domain"
										className="inline-flex items-center gap-1 font-semibold text-paragraph-xs text-primary-base transition-colors hover:text-primary-hover hover:underline"
									>
										Configure Domain Settings
										<Icon name="arrow-right" className="h-3 w-3" />
									</Link>
								</div>
							) : (
								<div className="max-h-56 overflow-y-auto">
									{suggestions.map((item, idx) => {
										const isSelected = idx === highlightIndex;
										return (
											<button
												key={`${item.email}-${idx}`}
												type="button"
												role="option"
												aria-selected={isSelected}
												onMouseDown={(e) => {
													e.preventDefault();
													handleSelectSuggestion(item);
												}}
												onMouseEnter={() => setHighlightIndex(idx)}
												className={cn(
													"flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
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

			{fromMissing && (
				<p className="px-1 text-error-base text-xs">From is required</p>
			)}

			{/* Reply to input */}
			<div
				className={cn(
					"nodrag relative flex w-full items-center justify-between gap-2 rounded-xl border bg-bg-white-0 px-3 py-2 text-sm transition-colors dark:border-stroke-soft-100/40 dark:bg-bg-sub-300",
					replyToError
						? "border-error-base"
						: "border-stroke-soft-100 focus-within:border-blue-500 hover:border-stroke-soft-200",
					isSaving && "opacity-60",
				)}
			>
				<input
					type="text"
					placeholder="Reply to (optional)"
					value={replyValue}
					onChange={(e) => {
						setReplyValue(e.target.value);
						onDraftChange?.({ reply: e.target.value });
					}}
					onBlur={handleReplyBlur}
					onKeyDown={(e) => {
						e.stopPropagation();
						if (e.key === "Enter") {
							e.currentTarget.blur();
						}
					}}
					aria-label="Reply to email"
					disabled={isSaving}
					className="w-full bg-transparent text-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
				/>
				{replyToError && (
					<Tooltip.Provider delayDuration={0}>
						<Tooltip.Root>
							<Tooltip.Trigger asChild>
								<button
									type="button"
									className="flex cursor-pointer items-center justify-center text-error-base transition-colors hover:text-error-dark"
									tabIndex={-1}
								>
									<Icon name="cross-circle" className="h-4 w-4" />
								</button>
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
		</div>
	);
};

const SelectedTemplateView = ({
	templateId,
	templateName,
	onBack,
}: {
	templateId: string;
	templateName: string;
	onBack: () => void;
}) => {
	const queryClient = useQueryClient();
	const [tab, setTab] = useState<"preview" | "settings">("preview");
	const [publishing, setPublishing] = useState(false);
	const [savingSender, setSavingSender] = useState(false);
	const [fromDraft, setFromDraft] = useState<string | null>(null);
	const [replyDraft, setReplyDraft] = useState<string | null>(null);

	const detailQuery = useTemplateDetailQuery(templateId);
	const versionsQuery = useQuery({
		queryKey: [...queryKeys.templates.all, "versions", templateId],
		queryFn: () => fetchVersions(templateId),
	});
	const detail = detailQuery.data;
	const versions = useMemo(
		() => [...(versionsQuery.data ?? [])].sort((a, b) => b.version - a.version),
		[versionsQuery.data],
	);
	const latest = versions[0];
	const status = detail?.status ?? "draft";
	const isDraft = status !== "published";

	const resolvedFrom =
		fromDraft ?? latest?.fromEmail ?? detail?.fromEmail ?? "";
	const resolvedReply = replyDraft ?? latest?.replyTo ?? detail?.replyTo ?? "";

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset draft on templateId switch
	useEffect(() => {
		setFromDraft(null);
		setReplyDraft(null);
		setTab("preview");
	}, [templateId]);

	const invalidateTemplate = async () => {
		await queryClient.invalidateQueries({
			queryKey: queryKeys.templates.list(),
		});
		await queryClient.invalidateQueries({
			queryKey: queryKeys.templates.detail(templateId),
		});
		await queryClient.invalidateQueries({
			queryKey: [...queryKeys.templates.all, "versions", templateId],
		});
	};

	const saveSenderDirect = async (data: {
		fromEmail: string;
		replyTo: string;
	}) => {
		setSavingSender(true);
		try {
			const res = await fetch(`/api/template/v1/${templateId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					fromEmail: data.fromEmail,
					replyTo: data.replyTo,
				}),
			});
			if (!res.ok) throw new Error(`Save failed (${res.status})`);
			setFromDraft(null);
			setReplyDraft(null);
			await invalidateTemplate();
		} catch {
			toast.error("Failed to save sender");
		} finally {
			setSavingSender(false);
		}
	};

	const handlePublish = async () => {
		if (publishing) return;
		const source = latest;
		if (!source) {
			toast.error("Nothing to publish yet — edit the template first");
			return;
		}
		setPublishing(true);
		try {
			const res = await fetch(`/api/template/v1/${templateId}/versions`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					content: source.content ?? [],
					renderedHtml: source.renderedHtml ?? undefined,
					subject:
						source.subject ?? detail?.subject ?? templateName ?? undefined,
					fromEmail: resolvedFrom || undefined,
					replyTo: resolvedReply || undefined,
					previewText: source.previewText ?? detail?.previewText ?? undefined,
					isMajor: true,
				}),
			});
			if (!res.ok) throw new Error(`Publish failed (${res.status})`);
			await invalidateTemplate();
			toast.success("Template published");
		} catch {
			toast.error("Failed to publish template");
		} finally {
			setPublishing(false);
		}
	};

	return (
		<div className="flex flex-col gap-2.5">
			<button
				type="button"
				onClick={onBack}
				className="inline-flex w-fit cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 font-medium text-text-sub-600 text-xs transition-colors hover:text-text-strong-950"
			>
				<Icon name="chevron-left" className="h-3.5 w-3.5" />
				<span className="max-w-[260px] truncate">{templateName}</span>
			</button>

			<div
				role="tablist"
				aria-label="Template view"
				className="grid grid-cols-2 gap-1 rounded-full bg-bg-weak-50 p-1"
			>
				{(["preview", "settings"] as const).map((t) => (
					<button
						key={t}
						type="button"
						role="tab"
						aria-selected={tab === t}
						onClick={() => setTab(t)}
						className={cn(
							"cursor-pointer rounded-full py-1.5 font-medium text-sm capitalize transition-all",
							tab === t
								? "bg-bg-white-0 text-text-strong-950 shadow-sm"
								: "text-text-sub-600 hover:text-text-strong-950",
						)}
					>
						{t}
					</button>
				))}
			</div>

			{isDraft ? (
				<div className="flex items-center justify-between gap-2 rounded-xl bg-bg-weak-50 py-1.5 pr-1.5 pl-3">
					<p className="min-w-0 flex-1 truncate text-text-sub-600 text-xs">
						Draft template. Publish before use
					</p>
					<button
						type="button"
						onClick={() => void handlePublish()}
						disabled={publishing || detailQuery.isLoading}
						className="shrink-0 cursor-pointer rounded-full bg-black px-4 py-1.5 font-medium text-sm text-white transition-opacity disabled:cursor-wait disabled:opacity-60 dark:bg-white dark:text-black"
					>
						{publishing ? "Publishing…" : "Publish"}
					</button>
				</div>
			) : null}

			{tab === "preview" ? (
				<TemplateDetailPreview
					key={`${templateId}-${detail?.updatedAt ?? ""}`}
					templateId={templateId}
					templateName={templateName}
					detail={detail}
					isLoading={detailQuery.isLoading}
				/>
			) : (
				<WorkflowSenderSection
					persistedFrom={resolvedFrom}
					persistedReply={resolvedReply}
					onSave={saveSenderDirect}
					isSaving={savingSender}
					onDraftChange={(draft) => {
						if (draft.from !== undefined) setFromDraft(draft.from);
						if (draft.reply !== undefined) setReplyDraft(draft.reply);
					}}
				/>
			)}
		</div>
	);
};

export const SendEmailConfigForm = ({
	value,
	onChange,
}: SendEmailConfigFormProps) => {
	const templatesQuery = useTemplatesQuery();
	const selectedName = useMemo(
		() =>
			templatesQuery.data?.templates.find((t) => t.id === value.templateId)
				?.name ?? "Template",
		[templatesQuery.data, value.templateId],
	);

	if (value.templateId) {
		return (
			<SelectedTemplateView
				templateId={value.templateId}
				templateName={selectedName}
				onBack={() => onChange({ ...value, templateId: "" })}
			/>
		);
	}
	return <TemplatePicker value={value} onChange={onChange} />;
};
