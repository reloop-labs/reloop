"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { AnimatePresence, motion } from "motion/react";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";

export type Suggestion = {
	value: string;
	/** Bold text on the left (defaults to `value`). */
	label?: string;
	/** Muted text on the right, e.g. the host for a provider. */
	hint?: string;
	/** Section heading shown above the first item of each group. */
	group?: string;
};

/**
 * Text input with a typeahead dropdown, same look and keys as the template
 * "From" field: ↑/↓ to move, Enter to pick, Esc to close.
 */
export function AutocompleteInput({
	id,
	value,
	onChange,
	onSelect,
	suggestions,
	placeholder,
	valid,
	disabled,
	autoFocus,
	hasError,
}: {
	id: string;
	value: string;
	onChange: (value: string) => void;
	onSelect?: (suggestion: Suggestion) => void;
	suggestions: Suggestion[];
	placeholder?: string;
	valid?: boolean;
	disabled?: boolean;
	autoFocus?: boolean;
	hasError?: boolean;
}) {
	const listboxId = useId();
	const containerRef = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);
	const [highlight, setHighlight] = useState(0);

	// Nothing useful to show when the only suggestion is what's already typed.
	const visible =
		suggestions.length === 1 && suggestions[0]?.value === value.trim()
			? []
			: suggestions;
	const showList = open && visible.length > 0;

	useEffect(() => {
		const onPointerDown = (e: PointerEvent) => {
			if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener("pointerdown", onPointerDown);
		return () => document.removeEventListener("pointerdown", onPointerDown);
	}, []);

	const pick = (s: Suggestion) => {
		onChange(s.value);
		onSelect?.(s);
		setOpen(false);
	};

	const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (!showList) {
			if (e.key === "ArrowDown" && visible.length > 0) {
				e.preventDefault();
				setOpen(true);
			}
			return;
		}
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setHighlight((i) => (i + 1) % visible.length);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setHighlight((i) => (i - 1 + visible.length) % visible.length);
		} else if (e.key === "Enter" || e.key === "Tab") {
			const s = visible[highlight];
			if (s && s.value !== value.trim()) {
				e.preventDefault();
				pick(s);
			} else {
				setOpen(false);
			}
		} else if (e.key === "Escape") {
			e.preventDefault();
			setOpen(false);
		}
	};

	return (
		<div ref={containerRef} className="relative">
			<Input.Root
				hasError={hasError}
				className={cn(
					"w-full rounded-xl",
					!hasError &&
						"has-[input:focus]:ring-text-strong-950/10 has-[input:focus]:before:ring-text-strong-950 dark:has-[input:focus]:ring-white/10 dark:has-[input:focus]:before:ring-white",
				)}
				size="small"
			>
				<Input.Wrapper>
					<Input.Input
						id={id}
						value={value}
						placeholder={placeholder}
						autoComplete="off"
						spellCheck={false}
						autoFocus={autoFocus}
						disabled={disabled}
						role="combobox"
						aria-expanded={showList}
						aria-controls={listboxId}
						aria-autocomplete="list"
						onFocus={() => setOpen(true)}
						onKeyDown={onKeyDown}
						onChange={(e) => {
							onChange(e.target.value);
							setHighlight(0);
							setOpen(true);
						}}
					/>
					{valid ? (
						<Input.Icon>
							<Icon name="check" className="h-4 w-4 text-green-500" />
						</Input.Icon>
					) : null}
				</Input.Wrapper>
			</Input.Root>

			<AnimatePresence>
				{showList ? (
					<motion.div
						id={listboxId}
						role="listbox"
						initial={{ opacity: 0, y: -4, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -4, scale: 0.98 }}
						transition={{ duration: 0.15, ease: "easeOut" }}
						className="absolute top-full left-0 z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 dark:border-stroke-soft-100/40 dark:bg-bg-soft-200"
					>
						<div className="max-h-60 overflow-y-auto">
							{visible.map((s, idx) => {
								const showGroup =
									s.group && s.group !== visible[idx - 1]?.group;
								const active = idx === highlight;
								return (
									<div key={`${s.group ?? ""}-${s.value}`}>
										{showGroup ? (
											<p className="px-2.5 pt-2 pb-1 font-medium text-[11px] text-text-soft-400 uppercase tracking-wider">
												{s.group}
											</p>
										) : null}
										<button
											type="button"
											role="option"
											aria-selected={active}
											onMouseDown={(e) => {
												// Keep focus in the input so the pick lands before blur.
												e.preventDefault();
												pick(s);
											}}
											onMouseEnter={() => setHighlight(idx)}
											className={cn(
												"flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left text-label-xs",
												active
													? "bg-bg-weak-50 text-text-strong-950 dark:bg-bg-sub-300/40"
													: "text-text-sub-600 hover:bg-bg-weak-50/70 dark:hover:bg-bg-sub-300/20",
											)}
										>
											<span className="truncate font-medium text-text-strong-950">
												{s.label ?? s.value}
											</span>
											{s.hint ? (
												<span className="shrink-0 truncate font-mono text-[11px] text-text-soft-400">
													{s.hint}
												</span>
											) : null}
										</button>
									</div>
								);
							})}
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}
