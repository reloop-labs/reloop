"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Domain } from "#/features/domain/types";

export const isSendReceiveReady = (d: Domain) =>
	d.isSendingEmailEnabled && d.isReceivingEmailEnabled;

/** Derive a display name from an email handle: `billing.alerts` → `Billing Alerts`. */
export function deriveInboxDisplayName(handle: string): string {
	const words = handle
		.trim()
		.split(/[-._\s]+/)
		.filter(Boolean)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1));
	return words.length > 0 ? words.join(" ") : "Support";
}

interface EmailSuggestion {
	email: string;
	handle: string;
	domain: string;
	ready: boolean;
}

function splitEmailInput(value: string): {
	name: string;
	handle: string;
	domainQuery: string;
} {
	const trimmed = value.trim();
	// Industry-standard `Display Name <handle@domain>` format (closing bracket
	// optional while typing).
	const angleMatch = trimmed.match(/^(.*?)\s*<([^>]*)>?$/);
	if (angleMatch) {
		const namePart = angleMatch[1]?.trim() || "";
		const emailPart = angleMatch[2]?.trim() || "";
		const atIndex = emailPart.indexOf("@");
		if (atIndex === -1)
			return { name: namePart, handle: emailPart, domainQuery: "" };
		return {
			name: namePart,
			handle: emailPart.slice(0, atIndex),
			domainQuery: emailPart.slice(atIndex + 1).replace(/>+$/, ""),
		};
	}
	const atIndex = trimmed.indexOf("@");
	if (atIndex === -1) return { name: "", handle: trimmed, domainQuery: "" };
	return {
		name: "",
		handle: trimmed.slice(0, atIndex),
		domainQuery: trimmed.slice(atIndex + 1),
	};
}

export function InboxEmailAddressInput({
	id = "inbox-email-address",
	localPart,
	domain,
	displayName = "",
	verifiedDomains,
	isLoadingDomains = false,
	onChange,
	disabled = false,
	hasError = false,
	autoFocus = false,
	placeholder = "e.g. Support <support@domain.com>",
}: {
	id?: string;
	localPart: string;
	domain: string;
	displayName?: string;
	verifiedDomains: Domain[];
	isLoadingDomains?: boolean;
	onChange: (localPart: string, domain: string, name: string) => void;
	disabled?: boolean;
	hasError?: boolean;
	autoFocus?: boolean;
	placeholder?: string;
}) {
	const [inputValue, setInputValue] = useState(() =>
		localPart ? `${localPart}${domain ? `@${domain}` : ""}` : "",
	);
	const [isOpen, setIsOpen] = useState(false);
	const [highlightIndex, setHighlightIndex] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const listboxId = useId();

	// Keep the visible value in sync with form state while the user isn't typing.
	useEffect(() => {
		if (isOpen) return;
		let next = "";
		if (localPart) {
			const email = domain ? `${localPart}@${domain}` : localPart;
			const trimmedName = displayName.trim();
			next =
				trimmedName &&
				trimmedName.toLowerCase() !==
					deriveInboxDisplayName(localPart).toLowerCase()
					? `${trimmedName} <${email}>`
					: email;
		}
		setInputValue((prev) => (prev === next ? prev : next));
	}, [localPart, domain, displayName, isOpen]);

	const {
		name: typedName,
		handle: typedHandle,
		domainQuery,
	} = useMemo(() => splitEmailInput(inputValue), [inputValue]);

	const suggestions = useMemo((): EmailSuggestion[] => {
		const q = domainQuery.toLowerCase();
		const displayHandle = typedHandle || "support";
		return verifiedDomains
			.filter((d) => !q || d.domain.toLowerCase().includes(q))
			.slice(0, 8)
			.map((d) => ({
				email: `${displayHandle}@${d.domain}`,
				handle: displayHandle,
				domain: d.domain,
				ready: isSendReceiveReady(d),
			}));
	}, [verifiedDomains, typedHandle, domainQuery]);

	useEffect(() => {
		const onPointerDown = (e: PointerEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("pointerdown", onPointerDown);
		return () => document.removeEventListener("pointerdown", onPointerDown);
	}, []);

	const commitChange = (
		nextHandle: string,
		nextDomain: string,
		nextName: string,
	) => {
		const resolvedName = nextName.trim() || deriveInboxDisplayName(nextHandle);
		if (
			nextHandle !== localPart ||
			nextDomain !== domain ||
			resolvedName !== displayName
		) {
			onChange(nextHandle, nextDomain, resolvedName);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		setInputValue(val);
		setHighlightIndex(0);
		if (!isOpen) setIsOpen(true);

		const { name, handle, domainQuery: dq } = splitEmailInput(val);
		if (dq === "") {
			// Typing the handle (or just typed "@") — keep the current domain.
			commitChange(handle, domain, name);
			return;
		}
		const exact = verifiedDomains.find(
			(d) => d.domain.toLowerCase() === dq.toLowerCase(),
		);
		commitChange(handle, exact ? exact.domain : dq, name);
	};

	const handleSelect = (s: EmailSuggestion) => {
		const handle = s.handle === "support" && !typedHandle ? "" : s.handle;
		commitChange(handle, s.domain, typedName);
		setInputValue(
			typedName.trim() ? `${typedName.trim()} <${s.email}>` : s.email,
		);
		setIsOpen(false);
		inputRef.current?.focus();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!isOpen) {
			if (e.key === "ArrowDown") {
				setIsOpen(true);
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
			const picked = suggestions[highlightIndex];
			if (picked) {
				e.preventDefault();
				e.stopPropagation();
				handleSelect(picked);
			}
		} else if (e.key === "Escape") {
			setIsOpen(false);
		}
	};

	return (
		<div ref={containerRef} className="relative min-w-0">
			<Input.Root size="medium" hasError={hasError} className="min-w-0">
				<Input.Wrapper>
					<Input.Input
						ref={inputRef}
						id={id}
						value={inputValue}
						onChange={handleInputChange}
						onFocus={() => setIsOpen(true)}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						autoComplete="off"
						autoCapitalize="off"
						autoCorrect="off"
						spellCheck={false}
						maxLength={320}
						disabled={disabled}
						autoFocus={autoFocus}
						role="combobox"
						aria-expanded={isOpen}
						aria-controls={listboxId}
						aria-autocomplete="list"
						className="min-w-0"
					/>
					<button
						type="button"
						tabIndex={-1}
						aria-label="Toggle domain suggestions"
						onClick={() => {
							if (!disabled) {
								setIsOpen((v) => !v);
								inputRef.current?.focus();
							}
						}}
						className="flex shrink-0 items-center justify-center rounded-md p-1 text-text-sub-600 outline-none transition-colors hover:text-text-strong-950"
					>
						<Icon
							name="chevron-down"
							className={cn(
								"size-4 transition duration-200 ease-out",
								isOpen && "rotate-180 text-text-strong-950",
							)}
						/>
					</button>
				</Input.Wrapper>
			</Input.Root>

			<AnimatePresence>
				{isOpen && !disabled && (
					<motion.div
						id={listboxId}
						role="listbox"
						initial={{ opacity: 0, y: -4, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -4, scale: 0.98 }}
						transition={{ duration: 0.15, ease: "easeOut" }}
						className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-lg dark:border-stroke-soft-100/40 dark:bg-bg-soft-200"
					>
						{isLoadingDomains && suggestions.length === 0 ? (
							<div className="flex items-center justify-center gap-2.5 py-6 text-paragraph-xs text-text-sub-600">
								<Spinner size={16} />
								<span>Fetching verified domains...</span>
							</div>
						) : suggestions.length === 0 ? (
							<div className="px-3 py-5 text-center text-paragraph-xs text-text-sub-600">
								No matching domains. Keep typing or verify a domain first.
							</div>
						) : (
							<div className="max-h-56 overflow-y-auto">
								{suggestions.map((item, idx) => {
									const isSelected = idx === highlightIndex;
									return (
										<button
											key={item.email}
											type="button"
											role="option"
											aria-selected={isSelected}
											onMouseDown={(e) => {
												e.preventDefault();
												handleSelect(item);
											}}
											onMouseEnter={() => setHighlightIndex(idx)}
											className={cn(
												"flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left",
												isSelected
													? "bg-bg-weak-50 text-text-strong-950"
													: "text-text-sub-600 hover:bg-bg-weak-50/70",
											)}
										>
											<span className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-label-xs">
												{typedName.trim() && (
													<span className="shrink-0 font-medium text-text-strong-950">
														{typedName.trim()}
													</span>
												)}
												<span className="truncate text-text-sub-600">
													&lt;{item.email}&gt;
												</span>
											</span>
											{item.ready ? (
												<Icon
													name="check"
													className="h-3.5 w-3.5 shrink-0 text-text-sub-600"
												/>
											) : (
												<span className="shrink-0 rounded bg-bg-soft-200 px-1.5 py-0.25 font-medium text-[10px] text-text-sub-600">
													Setup needed
												</span>
											)}
										</button>
									);
								})}
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
