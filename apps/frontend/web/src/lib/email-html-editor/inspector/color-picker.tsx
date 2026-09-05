"use client";

import { EditorFocusScope } from "@react-email/editor/ui";
import * as Popover from "@reloop/ui/popover";
import { useCurrentEditor } from "@tiptap/react";
import { useMemo } from "react";
import { HexAlphaColorPicker } from "react-colorful";
import { inspectorFieldClassName } from "./scrub-field";

/* ------------------------------------------------------------------ */
/* Color picker — swatch trigger + HexAlphaColorPicker + doc colors   */
/* ------------------------------------------------------------------ */
export function ColorPicker({
	value,
	onChange,
}: {
	value: string;
	onChange: (v: string) => void;
}) {
	const { editor } = useCurrentEditor();

	const normalizedValue = value?.startsWith("#")
		? value
		: value
			? `#${value}`
			: "#ffffff";

	const documentColors = useMemo(() => {
		const colors = new Set<string>();
		if (editor?.state?.doc) {
			editor.state.doc.descendants((node) => {
				if (node.marks) {
					for (const mark of node.marks) {
						if (mark.attrs?.color) colors.add(mark.attrs.color);
					}
				}
				if (node.attrs?.style && typeof node.attrs.style === "string") {
					const match = node.attrs.style.match(
						/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g,
					);
					if (match) {
						for (const c of match) colors.add(c);
					}
				}
			});
		}
		if (value) colors.add(value);
		const defaultPresets = [
			"#994444",
			"#64748b",
			"#2563eb",
			"#1e293b",
			"#e2e8f0",
			"#ffffff",
			"#000000",
		];
		for (const preset of defaultPresets) {
			if (colors.size >= 5) break;
			colors.add(preset);
		}
		return Array.from(colors).slice(0, 5);
	}, [editor, value]);

	return (
		<div className={`${inspectorFieldClassName} gap-2`}>
			<Popover.Root>
				<Popover.Trigger asChild>
					<button
						type="button"
						aria-label="Pick color"
						onMouseDown={(event) => event.preventDefault()}
						className="relative size-4 shrink-0 cursor-pointer overflow-hidden rounded-md border border-stroke-soft-200 focus:outline-none dark:border-stroke-soft-100/40"
						style={{ backgroundColor: normalizedValue }}
					/>
				</Popover.Trigger>
				<EditorFocusScope>
					<Popover.Content
						side="bottom"
						align="center"
						sideOffset={-4}
						collisionPadding={12}
						className="z-50 w-56 p-2"
						onOpenAutoFocus={(event) => event.preventDefault()}
						onCloseAutoFocus={(event) => event.preventDefault()}
					>
					<div className="flex flex-col gap-3">
						<HexAlphaColorPicker
							color={normalizedValue}
							onChange={onChange}
							className="custom-color-picker"
						/>

						{/* On this document */}
						<div className="flex flex-col gap-1.5 border-stroke-soft-200 border-t pt-2 dark:border-stroke-soft-100/40">
							<span className="text-text-sub-600 text-xs dark:text-text-soft-400">
								On this document:
							</span>
							<div className="flex items-center gap-1.5">
								{documentColors.map((c, i) => (
									<button
										key={i}
										type="button"
										onMouseDown={(event) => event.preventDefault()}
										onClick={() => onChange(c)}
										style={{ backgroundColor: c }}
										className="size-6 cursor-pointer rounded-md border border-stroke-soft-200 opacity-90 transition-opacity hover:opacity-100 focus:outline-none dark:border-stroke-soft-100/40"
										title={c}
									/>
								))}
							</div>
						</div>
					</div>
					<style jsx global>{`
						.custom-color-picker.react-colorful {
							width: 100% !important;
							height: auto !important;
							gap: 8px;
							position: relative;
							box-sizing: border-box;
						}
						.custom-color-picker .react-colorful__saturation {
							border-radius: 12px;
							height: 120px;
							border-bottom: none;
							width: 100%;
						}
						.custom-color-picker .react-colorful__hue,
						.custom-color-picker .react-colorful__alpha {
							height: 14px;
							border-radius: 9999px;
							width: 100%;
						}
						.custom-color-picker .react-colorful__pointer {
							width: 18px;
							height: 18px;
							border-width: 2px;
							border-color: #ffffff;
							box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
						}
					`}</style>
					</Popover.Content>
				</EditorFocusScope>
			</Popover.Root>
			<input
				value={value}
				placeholder="#000000"
				aria-label="Hex color"
				onChange={(e) => onChange(e.target.value)}
				className="min-w-0 flex-1 bg-transparent text-sm text-text-strong-950 tabular-nums outline-none placeholder:text-text-soft-400"
			/>
		</div>
	);
}
