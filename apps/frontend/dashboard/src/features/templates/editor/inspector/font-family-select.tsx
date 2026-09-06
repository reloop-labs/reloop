"use client";

import { EditorFocusScope } from "@react-email/editor/ui";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Popover from "@reloop/ui/popover";
import { useMemo, useState } from "react";
import { inspectorFieldClassName } from "./scrub-field";

export interface FontOption {
	label: string;
	value: string;
	family: string;
	category: "web" | "system";
}

export const MODERN_WEB_FONTS: FontOption[] = [
	{
		label: "Inter",
		family: "Inter",
		value: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
		category: "web",
	},
	{
		label: "Plus Jakarta Sans",
		family: "Plus Jakarta Sans",
		value: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
		category: "web",
	},
	{
		label: "Roboto",
		family: "Roboto",
		value: "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
		category: "web",
	},
	{
		label: "Poppins",
		family: "Poppins",
		value: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
		category: "web",
	},
	{
		label: "Outfit",
		family: "Outfit",
		value: "Outfit, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
		category: "web",
	},
	{
		label: "DM Sans",
		family: "DM Sans",
		value: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
		category: "web",
	},
	{
		label: "Space Grotesk",
		family: "Space Grotesk",
		value: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
		category: "web",
	},
	{
		label: "Montserrat",
		family: "Montserrat",
		value: "Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
		category: "web",
	},
	{
		label: "Open Sans",
		family: "Open Sans",
		value: "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
		category: "web",
	},
	{
		label: "Lato",
		family: "Lato",
		value: "Lato, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
		category: "web",
	},
	{
		label: "Playfair Display",
		family: "Playfair Display",
		value: "'Playfair Display', Georgia, 'Times New Roman', serif",
		category: "web",
	},
	{
		label: "Merriweather",
		family: "Merriweather",
		value: "Merriweather, Georgia, 'Times New Roman', serif",
		category: "web",
	},
	{
		label: "Fira Code",
		family: "Fira Code",
		value: "'Fira Code', 'Courier New', Courier, monospace",
		category: "web",
	},
];

export const EMAIL_SAFE_SYSTEM_FONTS: FontOption[] = [
	{
		label: "Arial",
		family: "Arial",
		value: "Arial, Helvetica, sans-serif",
		category: "system",
	},
	{
		label: "Helvetica",
		family: "Helvetica",
		value: "Helvetica, Arial, sans-serif",
		category: "system",
	},
	{
		label: "Georgia",
		family: "Georgia",
		value: "Georgia, 'Times New Roman', serif",
		category: "system",
	},
	{
		label: "Times New Roman",
		family: "Times New Roman",
		value: "'Times New Roman', Times, serif",
		category: "system",
	},
	{
		label: "Trebuchet MS",
		family: "Trebuchet MS",
		value: "'Trebuchet MS', Helvetica, sans-serif",
		category: "system",
	},
	{
		label: "Verdana",
		family: "Verdana",
		value: "Verdana, Geneva, sans-serif",
		category: "system",
	},
	{
		label: "Tahoma",
		family: "Tahoma",
		value: "Tahoma, Geneva, sans-serif",
		category: "system",
	},
	{
		label: "Palatino",
		family: "Palatino",
		value: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
		category: "system",
	},
	{
		label: "Garamond",
		family: "Garamond",
		value: "Garamond, Baskerville, 'Times New Roman', serif",
		category: "system",
	},
	{
		label: "Courier New",
		family: "Courier New",
		value: "'Courier New', Courier, monospace",
		category: "system",
	},
];

export const ALL_FONTS: FontOption[] = [
	...MODERN_WEB_FONTS,
	...EMAIL_SAFE_SYSTEM_FONTS,
];

export const EMAIL_SAFE_FONTS = ALL_FONTS;

function cleanQuotes(str: string): string {
	return str.replace(/^['"]|['"]$/g, "").trim();
}

export function normalizeFontValue(raw: string | undefined): string {
	if (!raw) return "";
	const trimmed = raw.trim();
	const lower = trimmed.toLowerCase();

	// 1. Try exact match on full value (case-insensitive)
	const exactMatch = ALL_FONTS.find(
		(f) => f.value.toLowerCase() === lower,
	);
	if (exactMatch) return exactMatch.value;

	// 2. Extract the primary family name (first font in comma-separated stack)
	const primaryFamily = cleanQuotes(trimmed.split(",")[0] ?? "").toLowerCase();
	if (primaryFamily) {
		const familyMatch = ALL_FONTS.find(
			(f) =>
				f.family.toLowerCase() === primaryFamily ||
				cleanQuotes(f.value.split(",")[0] ?? "").toLowerCase() === primaryFamily,
		);
		if (familyMatch) return familyMatch.value;
	}

	return raw;
}

export function getFontDisplayLabel(raw: string | undefined): string {
	if (!raw) return "Font family";
	const trimmed = raw.trim();
	const lower = trimmed.toLowerCase();

	// 1. Try exact match on full value
	const exactMatch = ALL_FONTS.find(
		(f) => f.value.toLowerCase() === lower,
	);
	if (exactMatch) return exactMatch.label;

	// 2. Extract primary family name (first font in comma-separated stack)
	const firstRaw = cleanQuotes(trimmed.split(",")[0] ?? "");
	const primaryFamily = firstRaw.toLowerCase();

	if (primaryFamily) {
		const familyMatch = ALL_FONTS.find(
			(f) =>
				f.family.toLowerCase() === primaryFamily ||
				cleanQuotes(f.value.split(",")[0] ?? "").toLowerCase() === primaryFamily,
		);
		if (familyMatch) return familyMatch.label;
	}

	return firstRaw || "Font family";
}

export function FontFamilySelect({
	value,
	onChange,
}: {
	value: string;
	onChange: (v: string) => void;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const selectedValue = useMemo(() => normalizeFontValue(value), [value]);
	const displayLabel = useMemo(() => getFontDisplayLabel(value), [value]);

	return (
		<Popover.Root open={isOpen} onOpenChange={setIsOpen}>
			<Popover.Trigger asChild>
				<button
					type="button"
					onMouseDown={(e) => e.preventDefault()}
					onClick={() => setIsOpen((prev) => !prev)}
					className={cn(
						inspectorFieldClassName,
						"cursor-pointer justify-between text-left text-sm text-text-strong-950 font-normal outline-none select-none",
					)}
				>
					<span className="truncate">{displayLabel}</span>
					<Icon
						name="chevron-down"
						className={cn(
							"size-3.5 shrink-0 text-text-sub-600 transition-transform duration-150",
							isOpen && "rotate-180",
						)}
					/>
				</button>
			</Popover.Trigger>
			<EditorFocusScope>
				<Popover.Content
					side="bottom"
					align="start"
					sideOffset={4}
					collisionPadding={8}
					showArrow={false}
					onOpenAutoFocus={(e) => e.preventDefault()}
					onCloseAutoFocus={(e) => e.preventDefault()}
					className="z-50 max-h-72 w-56 overflow-y-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-md dark:border-stroke-soft-100/40 dark:bg-black"
				>
					<div className="flex flex-col gap-0.5">
						<div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-text-sub-600 uppercase">
							Modern Web Fonts
						</div>
						{MODERN_WEB_FONTS.map((opt) => {
							const isSelected = selectedValue === opt.value;
							return (
								<button
									key={opt.family}
									type="button"
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => {
										onChange(opt.value);
										setIsOpen(false);
									}}
									className={cn(
										"flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
										isSelected
											? "bg-bg-soft-200 font-medium text-text-strong-950 dark:bg-bg-soft-200"
											: "text-text-sub-600 hover:bg-bg-soft-200/50 hover:text-text-strong-950",
									)}
								>
									<span className="truncate" style={{ fontFamily: opt.value }}>
										{opt.label}
									</span>
									{isSelected && (
										<Icon name="check" className="size-3 text-primary-base" />
									)}
								</button>
							);
						})}

						<div className="my-1 border-t border-stroke-soft-100 dark:border-stroke-soft-100/40" />

						<div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-text-sub-600 uppercase">
							Email-Safe System Fonts
						</div>
						{EMAIL_SAFE_SYSTEM_FONTS.map((opt) => {
							const isSelected = selectedValue === opt.value;
							return (
								<button
									key={opt.family}
									type="button"
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => {
										onChange(opt.value);
										setIsOpen(false);
									}}
									className={cn(
										"flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
										isSelected
											? "bg-bg-soft-200 font-medium text-text-strong-950 dark:bg-bg-soft-200"
											: "text-text-sub-600 hover:bg-bg-soft-200/50 hover:text-text-strong-950",
									)}
								>
									<span className="truncate" style={{ fontFamily: opt.value }}>
										{opt.label}
									</span>
									{isSelected && (
										<Icon name="check" className="size-3 text-primary-base" />
									)}
								</button>
							);
						})}
					</div>
				</Popover.Content>
			</EditorFocusScope>
		</Popover.Root>
	);
}
