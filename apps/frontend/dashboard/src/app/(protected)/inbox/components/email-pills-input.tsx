"use client";

import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { type KeyboardEvent, type ClipboardEvent, useRef, useState } from "react";

interface EmailPillsInputProps {
	emails: string[];
	onChange: (emails: string[]) => void;
	placeholder?: string;
	disabled?: boolean;
}

export const parseEmail = (input: string) => {
	// Matches: "Name" <email@domain.com> or Name <email@domain.com> or email@domain.com
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
}: EmailPillsInputProps) => {
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const addEmails = (newEmailsStr: string) => {
		// First split by commas and semicolons
		const initialSplit = newEmailsStr
			.split(/[,;]+/)
			.map((s) => s.trim())
			.filter(Boolean);
		const parsed: string[] = [];

		for (const item of initialSplit) {
			// Check if it has a <email> format: e.g. "John Doe <john@example.com>"
			if (/<[^\s@]+@[^\s@]+\.[^\s@]+>/.test(item)) {
				parsed.push(item);
			} else {
				// If not, it might be space separated email list (e.g. "foo@bar.com baz@bar.com")
				const spaceSplit = item
					.split(/\s+/)
					.map((s) => s.trim())
					.filter(Boolean);
				parsed.push(...spaceSplit);
			}
		}

		if (parsed.length === 0) return;

		// Filter out duplicates in current list
		const updated = [...emails, ...parsed].filter(
			(val, idx, self) => self.indexOf(val) === idx
		);
		onChange(updated);
		setInputValue("");
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (disabled) return;

		// Commit on Enter, Comma, Semicolon, Tab, or Space (only if the typed input contains '@')
		const shouldCommit =
			e.key === "Enter" ||
			e.key === "," ||
			e.key === ";" ||
			e.key === "Tab" ||
			(e.key === " " && inputValue.includes("@"));

		if (shouldCommit) {
			e.preventDefault();
			if (inputValue.trim()) {
				addEmails(inputValue);
			}
		} else if (e.key === "Backspace" && !inputValue && emails.length > 0) {
			// Remove last pill
			onChange(emails.slice(0, -1));
		}
	};

	const handleBlur = () => {
		if (inputValue.trim()) {
			addEmails(inputValue);
		}
	};

	const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const pastedText = e.clipboardData.getData("text");
		addEmails(pastedText);
	};

	const removeEmail = (indexToRemove: number) => {
		if (disabled) return;
		onChange(emails.filter((_, idx) => idx !== indexToRemove));
	};

	return (
		<div
			onClick={() => inputRef.current?.focus()}
			className="flex flex-1 flex-wrap items-center gap-1.5 min-h-[32px] cursor-text py-0.5"
		>
			<AnimatePresence initial={false}>
				{emails.map((emailStr, idx) => {
					const isValid = validateEmail(emailStr);
					const { name, email } = parseEmail(emailStr);

					return (
						<motion.div
							key={`${emailStr}-${idx}`}
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							transition={{ duration: 0.15 }}
							className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 text-xs font-medium border shadow-xs transition-colors ${
								isValid
									? "bg-bg-weak-50 text-text-sub-600 border-stroke-soft-100 dark:bg-neutral-800/40 dark:text-neutral-300 dark:border-neutral-700/60"
									: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50"
							}`}
						>
							{!isValid && (
								<svg
									className="h-3.5 w-3.5 text-red-500 shrink-0"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.5"
								>
									<line x1="12" y1="9" x2="12" y2="13" />
									<line x1="12" y1="17" x2="12.01" y2="17" />
									<circle cx="12" cy="12" r="10" />
								</svg>
							)}
							{name ? (
								<span className="truncate max-w-[280px]">
									<span className="font-semibold text-text-strong-950 dark:text-white mr-1">
										{name}
									</span>
									<span className="text-text-soft-400 dark:text-neutral-500 font-normal">
										&lt;{email}&gt;
									</span>
								</span>
							) : (
								<span className="truncate max-w-[200px]">{email}</span>
							)}
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									removeEmail(idx);
								}}
								disabled={disabled}
								className={`hover:bg-black/5 dark:hover:bg-white/10 rounded-full p-0.5 -mr-1 transition-colors shrink-0 ${
									isValid
										? "text-text-soft-400 hover:text-text-strong-950 dark:hover:text-white"
										: "text-red-400 hover:text-red-700 dark:hover:text-red-300"
								}`}
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
				className="min-w-[120px] flex-1 bg-transparent text-text-strong-950 placeholder-text-soft-400 outline-none dark:text-white py-1"
			/>
		</div>
	);
};
