"use client";

import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import {
	type ClipboardEvent,
	type KeyboardEvent,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

interface EmailPillsInputProps {
	emails: string[];
	onChange: (emails: string[]) => void;
	placeholder?: string;
	disabled?: boolean;
	/** Optional suggestions (emails or "Name <email>") from loaded threads */
	suggestions?: string[];
}

export const parseEmail = (input: string) => {
	const match = input.match(/^(?:["']?([^"']+)["']?\s+)?<([^>]+)>$/);
	if (match) {
		return {
			name: match[1]?.trim() || "",
			email: match[2]?.trim() || "",
		};
	}
	return {
		name: "",
		email: input.trim(),
	};
};

export const validateEmail = (emailStr: string) => {
	const { email } = parseEmail(emailStr);
	return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
};

export const EmailPillsInput = ({
	emails,
	onChange,
	placeholder = "Add email address",
	disabled = false,
	suggestions = [],
}: EmailPillsInputProps) => {
	const [inputValue, setInputValue] = useState("");
	const [highlight, setHighlight] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);

	const filteredSuggestions = useMemo(() => {
		const q = inputValue.trim().toLowerCase();
		if (q.length < 1) return [];
		return suggestions
			.filter((s) => {
				const { email } = parseEmail(s);
				if (emails.some((e) => parseEmail(e).email === email)) return false;
				return s.toLowerCase().includes(q);
			})
			.slice(0, 6);
	}, [inputValue, suggestions, emails]);

	useEffect(() => {
		setHighlight(0);
	}, [filteredSuggestions.length]);

	const addEmails = (newEmailsStr: string) => {
		const initialSplit = newEmailsStr
			.split(/[,;]+/)
			.map((s) => s.trim())
			.filter(Boolean);
		const parsed: string[] = [];

		for (const item of initialSplit) {
			if (/<[^\s@]+@[^\s@]+\.[^\s@]+>/.test(item)) {
				parsed.push(item);
			} else {
				const spaceSplit = item
					.split(/\s+/)
					.map((s) => s.trim())
					.filter(Boolean);
				parsed.push(...spaceSplit);
			}
		}

		if (parsed.length === 0) return;

		const updated = [...emails, ...parsed].filter(
			(val, idx, self) => self.indexOf(val) === idx,
		);
		onChange(updated);
		setInputValue("");
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (disabled) return;

		if (filteredSuggestions.length > 0) {
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
			if (e.key === "Enter" || e.key === "Tab") {
				const pick = filteredSuggestions[highlight];
				if (pick) {
					e.preventDefault();
					addEmails(pick);
					return;
				}
			}
		}

		const shouldCommit =
			e.key === "Enter" ||
			e.key === "," ||
			e.key === ";" ||
			e.key === "Tab" ||
			(e.key === " " && inputValue.includes("@"));

		if (shouldCommit) {
			e.preventDefault();
			if (inputValue.trim()) addEmails(inputValue);
		} else if (e.key === "Backspace" && !inputValue && emails.length > 0) {
			onChange(emails.slice(0, -1));
		}
	};

	const handleBlur = () => {
		if (inputValue.trim()) addEmails(inputValue);
	};

	const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		addEmails(e.clipboardData.getData("text"));
	};

	const removeEmail = (indexToRemove: number) => {
		if (disabled) return;
		onChange(emails.filter((_, idx) => idx !== indexToRemove));
	};

	return (
		<div className="relative min-w-0 flex-1">
			<div
				onClick={() => inputRef.current?.focus()}
				className="flex min-h-[32px] cursor-text flex-wrap items-center gap-1.5 py-0.5"
			>
				<AnimatePresence initial={false}>
					{emails.map((emailStr, idx) => {
						const isValid = validateEmail(emailStr);
						const { name, email } = parseEmail(emailStr);
						const display = name || email.split("@")[0] || email;

						return (
							<motion.div
								key={`${emailStr}-${idx}`}
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								transition={{ duration: 0.15 }}
								className={cn(
									"inline-flex items-center gap-1.5 rounded-full border py-0.5 pr-1.5 pl-0.5 font-medium text-xs",
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
								<span className="max-w-[180px] truncate">{display}</span>
								<button
									type="button"
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
				<input
					ref={inputRef}
					type="text"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					onBlur={handleBlur}
					onPaste={handlePaste}
					disabled={disabled}
					placeholder={emails.length === 0 ? placeholder : ""}
					className="min-w-[120px] flex-1 bg-transparent py-1 text-mail-foreground outline-none placeholder:text-[#797979]"
				/>
			</div>

			{filteredSuggestions.length > 0 && (
				<div className="absolute top-full left-0 z-50 mt-1 max-h-48 w-full min-w-[240px] overflow-y-auto rounded-lg border border-mail-border bg-panel-light py-1 shadow-lg dark:bg-panel-dark">
					{filteredSuggestions.map((s, i) => {
						const { name, email } = parseEmail(s);
						return (
							<button
								key={s}
								type="button"
								className={cn(
									"flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-[var(--inbox-hover)]",
									i === highlight && "bg-[var(--inbox-hover)]",
								)}
								onMouseDown={(e) => {
									e.preventDefault();
									addEmails(s);
								}}
							>
								<div
									className={cn(
										"flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] text-white uppercase",
										getAvatarGradient(email),
									)}
								>
									{getAvatarInitial(name || null, email)}
								</div>
								<div className="min-w-0 flex-1">
									{name ? (
										<>
											<p className="truncate font-medium text-mail-foreground">
												{name}
											</p>
											<p className="truncate text-mail-muted text-xs">
												{email}
											</p>
										</>
									) : (
										<p className="truncate text-mail-foreground">{email}</p>
									)}
								</div>
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
};
