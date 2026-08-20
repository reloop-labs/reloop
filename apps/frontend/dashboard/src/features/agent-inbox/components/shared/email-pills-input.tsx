import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
	type ClipboardEvent,
	type KeyboardEvent,
	type PointerEvent,
	useEffect,
	useId,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import {
	formatRecipient,
	parseEmail,
	validateEmail,
} from "#/features/agent-inbox/lib/email-address";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";

export {
	parseEmail,
	validateEmail,
} from "#/features/agent-inbox/lib/email-address";

interface EmailPillsInputProps {
	emails: string[];
	onChange: (emails: string[]) => void;
	placeholder?: string;
	disabled?: boolean;
	/** Optional suggestions (emails or "Name <email>") from loaded threads */
	suggestions?: string[];
	/** Focus the text input when this becomes true (e.g. Cc/Bcc row revealed). */
	autoFocus?: boolean;
}

type DropdownPos = { top: number; left: number; width: number };

type ParsedSuggestion = {
	raw: string;
	name: string;
	email: string;
};

export const EmailPillsInput = ({
	emails,
	onChange,
	placeholder = "Add email address",
	disabled = false,
	suggestions = [],
	autoFocus = false,
}: EmailPillsInputProps) => {
	const shouldReduceMotion = useReducedMotion();
	const listboxId = useId();
	const optionIdPrefix = useId();
	const [inputValue, setInputValue] = useState("");
	const [highlight, setHighlight] = useState(0);
	const [listOpen, setListOpen] = useState(false);
	const [dropdownPos, setDropdownPos] = useState<DropdownPos | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const rootRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const optionRefs = useRef<Array<HTMLDivElement | null>>([]);
	/** Skip blur-commit when selecting a suggestion (pointerdown can blur before mousedown). */
	const ignoreBlurCommit = useRef(false);
	const blurCommitTimer = useRef<number | null>(null);
	const inputValueRef = useRef(inputValue);
	inputValueRef.current = inputValue;

	const selectedEmails = useMemo(
		() => new Set(emails.map((e) => parseEmail(e).email.toLowerCase())),
		[emails],
	);

	const filteredSuggestions = useMemo((): ParsedSuggestion[] => {
		const q = inputValue.trim().toLowerCase();
		if (q.length < 1) return [];
		const out: ParsedSuggestion[] = [];
		for (const s of suggestions) {
			const { name, email } = parseEmail(s);
			if (!email || selectedEmails.has(email.toLowerCase())) continue;
			const haystack = `${name} ${email} ${s}`.toLowerCase();
			if (!haystack.includes(q)) continue;
			out.push({ raw: formatRecipient(name, email), name, email });
			if (out.length >= 8) break;
		}
		return out;
	}, [inputValue, suggestions, selectedEmails]);

	const isListVisible = listOpen && filteredSuggestions.length > 0;

	useEffect(() => {
		setHighlight(0);
		if (filteredSuggestions.length > 0 && inputValue.trim().length > 0) {
			setListOpen(true);
		}
	}, [filteredSuggestions.length, inputValue]);

	useLayoutEffect(() => {
		if (!isListVisible) {
			setDropdownPos(null);
			return;
		}

		const update = () => {
			const el = rootRef.current;
			if (!el) return;
			const rect = el.getBoundingClientRect();
			const width = Math.min(Math.max(rect.width, 280), 420);
			const left = Math.min(rect.left, window.innerWidth - width - 8);
			setDropdownPos({
				top: rect.bottom + 6,
				left: Math.max(8, left),
				width,
			});
		};

		update();
		window.addEventListener("resize", update);
		window.addEventListener("scroll", update, true);
		return () => {
			window.removeEventListener("resize", update);
			window.removeEventListener("scroll", update, true);
		};
	}, [isListVisible, inputValue, emails.length]);

	useEffect(() => {
		if (!isListVisible) return;
		optionRefs.current[highlight]?.scrollIntoView({
			block: "nearest",
		});
	}, [highlight, isListVisible]);

	useEffect(() => {
		if (!autoFocus || disabled) return;
		inputRef.current?.focus();
	}, [autoFocus, disabled]);

	const addEmails = (newEmailsStr: string) => {
		const initialSplit = newEmailsStr
			.split(/[,;]+/)
			.map((s) => s.trim())
			.filter(Boolean);
		const parsed: string[] = [];

		for (const item of initialSplit) {
			if (/<[^>]+@[^>]+>/.test(item)) {
				const { name, email } = parseEmail(item);
				parsed.push(formatRecipient(name, email));
			} else {
				const spaceSplit = item
					.split(/\s+/)
					.map((s) => s.trim())
					.filter(Boolean);
				for (const part of spaceSplit) {
					const { name, email } = parseEmail(part);
					parsed.push(formatRecipient(name, email));
				}
			}
		}

		if (parsed.length === 0) return;

		const seen = new Set(emails.map((e) => parseEmail(e).email.toLowerCase()));
		const updated = [...emails];
		let added = false;
		for (const val of parsed) {
			const key = parseEmail(val).email.toLowerCase();
			if (!key || seen.has(key)) continue;
			seen.add(key);
			updated.push(val);
			added = true;
		}
		setInputValue("");
		setListOpen(false);
		setHighlight(0);
		// Avoid onChange when nothing was added (e.g. blur committing a typed
		// fragment like "s") — a stale closure can otherwise wipe recipients.
		if (added) onChange(updated);
	};

	const selectSuggestion = (suggestion: ParsedSuggestion) => {
		if (blurCommitTimer.current != null) {
			window.clearTimeout(blurCommitTimer.current);
			blurCommitTimer.current = null;
		}
		ignoreBlurCommit.current = true;
		addEmails(suggestion.raw);
		requestAnimationFrame(() => {
			inputRef.current?.focus();
			// Keep ignoring until after any deferred blur from the pointer event.
			ignoreBlurCommit.current = false;
		});
	};

	const handleSuggestionPointerDown = (
		e: PointerEvent,
		suggestion: ParsedSuggestion,
	) => {
		// Prevent input blur so the option click isn't racing a commit of the typed query.
		e.preventDefault();
		e.stopPropagation();
		selectSuggestion(suggestion);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (disabled) return;

		if (isListVisible) {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setHighlight((h) => (h + 1) % filteredSuggestions.length);
				return;
			}
			if (e.key === "ArrowUp") {
				e.preventDefault();
				setHighlight(
					(h) =>
						(h - 1 + filteredSuggestions.length) % filteredSuggestions.length,
				);
				return;
			}
			if (e.key === "Home") {
				e.preventDefault();
				setHighlight(0);
				return;
			}
			if (e.key === "End") {
				e.preventDefault();
				setHighlight(filteredSuggestions.length - 1);
				return;
			}
			if (e.key === "Enter") {
				e.preventDefault();
				const pick = filteredSuggestions[highlight];
				if (pick) selectSuggestion(pick);
				return;
			}
			if (e.key === "Tab") {
				const pick = filteredSuggestions[highlight];
				if (pick) {
					e.preventDefault();
					selectSuggestion(pick);
				}
				return;
			}
			if (e.key === "Escape") {
				e.preventDefault();
				setListOpen(false);
				return;
			}
		} else if (
			filteredSuggestions.length > 0 &&
			(e.key === "ArrowDown" || e.key === "ArrowUp")
		) {
			e.preventDefault();
			setListOpen(true);
			setHighlight(e.key === "ArrowUp" ? filteredSuggestions.length - 1 : 0);
			return;
		}

		const shouldCommit =
			e.key === "Enter" ||
			e.key === "," ||
			e.key === ";" ||
			(e.key === "Tab" && inputValue.trim().length > 0) ||
			(e.key === " " && inputValue.includes("@"));

		if (shouldCommit) {
			if (inputValue.trim()) {
				e.preventDefault();
				addEmails(inputValue);
			}
		} else if (e.key === "Backspace" && !inputValue && emails.length > 0) {
			onChange(emails.slice(0, -1));
		} else if (e.key === "Escape" && inputValue) {
			e.preventDefault();
			setInputValue("");
			setListOpen(false);
		}
	};

	const handleBlur = () => {
		if (ignoreBlurCommit.current) return;
		if (blurCommitTimer.current != null) {
			window.clearTimeout(blurCommitTimer.current);
		}
		// Close list; commit typed address after a tick so option clicks win.
		blurCommitTimer.current = window.setTimeout(() => {
			blurCommitTimer.current = null;
			if (ignoreBlurCommit.current) return;
			if (document.activeElement === inputRef.current) return;
			if (listRef.current?.contains(document.activeElement)) return;
			setListOpen(false);
			const pending = inputValueRef.current.trim();
			if (pending) addEmails(pending);
		}, 0);
	};

	const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		addEmails(e.clipboardData.getData("text"));
	};

	const removeEmail = (indexToRemove: number) => {
		if (disabled) return;
		onChange(emails.filter((_, idx) => idx !== indexToRemove));
	};

	const activeOptionId = isListVisible
		? `${optionIdPrefix}-${highlight}`
		: undefined;

	const suggestionsDropdown =
		isListVisible && dropdownPos
			? createPortal(
					<div
						ref={listRef}
						id={listboxId}
						role="listbox"
						aria-label="Recipient suggestions"
						data-compose-floating-ui="email-suggestions"
						style={{
							position: "fixed",
							top: dropdownPos.top,
							left: dropdownPos.left,
							width: dropdownPos.width,
							zIndex: 260,
						}}
						className={cn(
							"overflow-hidden rounded-xl border border-mail-border/60 bg-panel-light shadow-[0_12px_40px_rgba(0,0,0,0.12)]",
							"dark:border-mail-border/50 dark:bg-panel-dark dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]",
						)}
					>
						<div className="border-mail-border/40 border-b px-3 py-2">
							<p className="font-medium text-[11px] text-mail-muted uppercase tracking-wide">
								Suggestions
							</p>
						</div>
						<div className="max-h-56 overflow-y-auto p-1">
							{filteredSuggestions.map((s, i) => {
								const selected = i === highlight;
								return (
									<div
										key={s.email}
										ref={(el) => {
											optionRefs.current[i] = el;
										}}
										id={`${optionIdPrefix}-${i}`}
										role="option"
										tabIndex={-1}
										aria-selected={selected}
										className={cn(
											"flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors duration-100 ease-out",
											selected
												? "bg-mail-foreground/[0.07] ring-1 ring-mail-border/50 dark:bg-white/[0.08]"
												: "hover:bg-(--inbox-hover)",
										)}
										onMouseEnter={() => setHighlight(i)}
										onPointerDown={(e) => {
											handleSuggestionPointerDown(e, s);
										}}
									>
										<div
											className={cn(
												"flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold text-[11px] text-white uppercase",
												getAvatarGradient(s.email),
											)}
										>
											{getAvatarInitial(s.name || null, s.email)}
										</div>
										<div className="min-w-0 flex-1">
											{s.name ? (
												<>
													<p className="truncate font-medium text-[13px] text-mail-foreground leading-5">
														{s.name}
													</p>
													<p className="truncate text-[12px] text-mail-muted leading-4">
														{s.email}
													</p>
												</>
											) : (
												<p className="truncate font-medium text-[13px] text-mail-foreground">
													{s.email}
												</p>
											)}
										</div>
										{selected ? (
											<span className="shrink-0 rounded-md bg-mail-foreground/10 px-1.5 py-0.5 font-medium text-[10px] text-mail-muted">
												↵
											</span>
										) : null}
									</div>
								);
							})}
						</div>
						<div className="flex items-center gap-2 border-mail-border/40 border-t px-3 py-1.5 text-[10px] text-mail-muted">
							<span className="inline-flex items-center gap-1">
								<ActionKbd className="w-auto min-w-4 px-1">↑↓</ActionKbd>
								navigate
							</span>
							<span className="text-mail-border">·</span>
							<span className="inline-flex items-center gap-1">
								<ActionKbd className="w-auto min-w-4 px-1">↵</ActionKbd>
								select
							</span>
							<span className="text-mail-border">·</span>
							<span className="inline-flex items-center gap-1">
								<ActionKbd className="w-auto min-w-4 px-1">esc</ActionKbd>
								close
							</span>
						</div>
					</div>,
					document.body,
				)
			: null;

	return (
		<div ref={rootRef} className="relative min-w-0 flex-1">
			<div
				onClick={() => inputRef.current?.focus()}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						inputRef.current?.focus();
					}
				}}
				className="flex min-h-8 cursor-text flex-wrap items-center gap-1.5"
			>
				<AnimatePresence initial={false}>
					{emails.map((emailStr, idx) => {
						const isValid = validateEmail(emailStr);
						const { name, email } = parseEmail(emailStr);
						const display = email;

						return (
							<motion.div
								key={emailStr}
								layout={!shouldReduceMotion}
								initial={
									shouldReduceMotion
										? { opacity: 0 }
										: { opacity: 0, scale: 0.8 }
								}
								animate={
									shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }
								}
								exit={
									shouldReduceMotion
										? { opacity: 0 }
										: {
												opacity: 0,
												scale: 0.8,
												width: 0,
												paddingLeft: 0,
												paddingRight: 0,
												marginLeft: 0,
												marginRight: 0,
												borderWidth: 0,
											}
								}
								transition={
									shouldReduceMotion
										? { duration: 0.1 }
										: {
												layout: { type: "spring", stiffness: 600, damping: 48 },
												opacity: { duration: 0.12, ease: "easeOut" },
												scale: { duration: 0.12, ease: "easeOut" },
												default: { duration: 0.14, ease: [0.16, 1, 0.3, 1] },
											}
								}
								className={cn(
									"inline-flex items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full border py-0.5 pr-1.5 pl-0.5 font-medium text-xs",
									isValid
										? "border-mail-border/60 bg-mail-accent/40 text-mail-muted"
										: "border-red-200 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400",
								)}
							>
								<div
									className={cn(
										"flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-semibold text-[10px] text-white uppercase",
										getAvatarGradient(email),
									)}
								>
									{getAvatarInitial(name || null, email)}
								</div>
								<span className="max-w-[240px] truncate">{display}</span>
								<button
									type="button"
									aria-label={`Remove ${email}`}
									onClick={(e) => {
										e.stopPropagation();
										removeEmail(idx);
									}}
									disabled={disabled}
									className="shrink-0 rounded-full p-0.5 text-mail-muted transition-colors hover:bg-[var(--inbox-hover)] hover:text-mail-foreground"
								>
									<Icon name="cross" className="h-3 w-3" />
								</button>
							</motion.div>
						);
					})}
				</AnimatePresence>
				<motion.input
					layout={!shouldReduceMotion}
					transition={
						shouldReduceMotion
							? { duration: 0.1 }
							: {
									layout: { type: "spring", stiffness: 600, damping: 48 },
									default: { duration: 0.14, ease: [0.16, 1, 0.3, 1] },
								}
					}
					ref={inputRef}
					type="text"
					role="combobox"
					aria-expanded={isListVisible}
					aria-controls={listboxId}
					aria-autocomplete="list"
					aria-activedescendant={activeOptionId}
					aria-haspopup="listbox"
					autoComplete="off"
					autoCorrect="off"
					spellCheck={false}
					value={inputValue}
					onChange={(e) => {
						setInputValue(e.target.value);
						setListOpen(true);
					}}
					onKeyDown={handleKeyDown}
					onBlur={handleBlur}
					onPaste={handlePaste}
					disabled={disabled}
					placeholder={emails.length === 0 ? placeholder : ""}
					className="min-w-[120px] flex-1 bg-transparent py-0 text-[13px] text-mail-foreground outline-none placeholder:text-mail-muted"
				/>
			</div>
			{suggestionsDropdown}
		</div>
	);
};
