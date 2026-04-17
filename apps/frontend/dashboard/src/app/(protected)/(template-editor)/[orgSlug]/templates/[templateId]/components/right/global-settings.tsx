"use client";

import * as ColorPicker from "@reloop/ui/color-picker";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Popover from "@reloop/ui/popover";
import * as SegmentedControl from "@reloop/ui/segmented-control";
import { useState } from "react";
import { parseColor } from "react-aria-components";
import { useEditorStore } from "../../editor/use-editor-store";

const PRESET_COLORS = [
	"#FFFFFF",
	"#F3F4F6",
	"#E5E7EB",
	"#D1D5DB",
	"#000000",
	"#1F2937",
	"#374151",
	"#4B5563",
	"#EF4444",
	"#F97316",
	"#EAB308",
	"#22C55E",
	"#3B82F6",
	"#8B5CF6",
	"#EC4899",
	"#06B6D4",
];

const FONT_OPTIONS = [
	{ value: "Inter, sans-serif", label: "Inter" },
	{ value: "Arial, sans-serif", label: "Arial" },
	{ value: "Georgia, serif", label: "Georgia" },
	{ value: "Times New Roman, serif", label: "Times New Roman" },
	{ value: "Helvetica, sans-serif", label: "Helvetica" },
	{ value: "Verdana, sans-serif", label: "Verdana" },
	{ value: "system-ui, sans-serif", label: "System UI" },
];

interface ColorFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
}

const ColorField = ({ label, value, onChange }: ColorFieldProps) => {
	const [isOpen, setIsOpen] = useState(false);

	let colorObj = parseColor("#FFFFFF");
	try {
		colorObj = parseColor(value || "#FFFFFF");
	} catch {
		// Fallback already set
	}

	return (
		<div className="flex flex-col gap-2">
			<Label.Root className="font-medium text-text-sub-600 text-xs">
				{label}
			</Label.Root>
			<div className="flex gap-1.5">
				<ColorPicker.Root
					value={colorObj}
					onChange={(c) => onChange(c.toString("hex"))}
				>
					<Popover.Root open={isOpen} onOpenChange={setIsOpen}>
						<Popover.Trigger asChild>
							<button
								type="button"
								className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stroke-soft-200/50 transition-all"
							>
								<ColorPicker.Swatch
									color={colorObj}
									className="h-full w-full rounded-none"
								/>
							</button>
						</Popover.Trigger>
						<Popover.Content
							sideOffset={0}
							align="start"
							className="w-[240px] p-3"
						>
							<ColorPicker.Area
								colorSpace="hsb"
								xChannel="saturation"
								yChannel="brightness"
							>
								<ColorPicker.Thumb className="size-4 rounded-full border-2 border-white shadow-md" />
							</ColorPicker.Area>
							<div className="mt-3">
								<ColorPicker.Slider
									channel="hue"
									colorSpace="hsb"
								>
									<ColorPicker.SliderTrack>
										<ColorPicker.Thumb />
									</ColorPicker.SliderTrack>
								</ColorPicker.Slider>
							</div>
							<div className="mt-3 border-stroke-soft-200 border-t pt-3">
								<ColorPicker.SwatchPicker>
									{PRESET_COLORS.map((presetColor) => (
										<ColorPicker.SwatchPickerItem
											key={presetColor}
											color={presetColor}
										>
											<ColorPicker.Swatch />
										</ColorPicker.SwatchPickerItem>
									))}
								</ColorPicker.SwatchPicker>
							</div>
							<div className="mt-3 flex items-center gap-2">
								<ColorPicker.EyeDropperButton className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-200 text-text-sub-600 transition-colors hover:bg-bg-weak-50">
									<Icon
										name="eyedropper"
										className="h-4 w-4"
									/>
								</ColorPicker.EyeDropperButton>
								<ColorPicker.Field className="flex-1">
									<Input.Root size="xsmall">
										<Input.Wrapper>
											<Input.Input
												placeholder="#FFFFFF"
												className="font-mono text-xs"
											/>
										</Input.Wrapper>
									</Input.Root>
								</ColorPicker.Field>
							</div>
						</Popover.Content>
					</Popover.Root>
				</ColorPicker.Root>

				<Input.Root size="xsmall" className="flex-1">
					<Input.Wrapper>
						<Input.Input
							type="text"
							value={value}
							onChange={(e) => onChange(e.target.value)}
							placeholder="#FFFFFF"
							className="font-mono text-xs"
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>
		</div>
	);
};

export const GlobalSettings = () => {
	const globalSettings = useEditorStore((s) => s.globalSettings);
	const updateGlobalSettings = useEditorStore(
		(s) => s.updateGlobalSettings,
	);

	return (
		<div className="flex flex-col">
			{/* Section header */}
			<div className="border-stroke-soft-100/50 border-b px-4 py-3">
				<div className="flex items-center gap-2">
					<Icon
						name="settings-2"
						className="h-4 w-4 text-text-sub-600"
					/>
					<p className="font-medium text-sm text-text-strong-950">
						Page Settings
					</p>
				</div>
			</div>

			<div className="space-y-5 px-4 py-4">
				{/* Content Width */}
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between">
						<Label.Root className="font-medium text-text-sub-600 text-xs">
							Content Width
						</Label.Root>
						<span className="font-mono text-[11px] text-text-soft-400">
							{globalSettings.contentWidth}px
						</span>
					</div>
					<input
						type="range"
						min={400}
						max={800}
						step={10}
						value={globalSettings.contentWidth}
						onChange={(e) =>
							updateGlobalSettings({
								contentWidth: Number(e.target.value),
							})
						}
						className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-bg-weak-50 accent-bg-strong-950"
					/>
				</div>

				{/* Content Alignment */}
				<div className="flex flex-col gap-2">
					<Label.Root className="font-medium text-text-sub-600 text-xs">
						Alignment
					</Label.Root>
					<SegmentedControl.Root
						value={globalSettings.contentAlign}
						onValueChange={(v) =>
							updateGlobalSettings({ contentAlign: v as "left" | "center" | "right" })
						}
					>
						<SegmentedControl.List>
							<SegmentedControl.Trigger value="left">
								<Icon name="align-left" className="h-3.5 w-3.5" />
							</SegmentedControl.Trigger>
							<SegmentedControl.Trigger value="center">
								<Icon name="align-center" className="h-3.5 w-3.5" />
							</SegmentedControl.Trigger>
							<SegmentedControl.Trigger value="right">
								<Icon name="align-right" className="h-3.5 w-3.5" />
							</SegmentedControl.Trigger>
						</SegmentedControl.List>
					</SegmentedControl.Root>
				</div>

				{/* Background Color */}
				<ColorField
					label="Page Background"
					value={globalSettings.backgroundColor}
					onChange={(c) =>
						updateGlobalSettings({ backgroundColor: c })
					}
				/>

				{/* Content Background Color */}
				<ColorField
					label="Content Background"
					value={globalSettings.contentBackgroundColor}
					onChange={(c) =>
						updateGlobalSettings({
							contentBackgroundColor: c,
						})
					}
				/>

				{/* Default Font */}
				<div className="flex flex-col gap-2">
					<Label.Root className="font-medium text-text-sub-600 text-xs">
						Default Font
					</Label.Root>
					<select
						value={globalSettings.fontFamily}
						onChange={(e) =>
							updateGlobalSettings({
								fontFamily: e.target.value,
							})
						}
						className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-1.5 text-sm text-text-strong-950 outline-none transition-colors focus:border-primary-base"
					>
						{FONT_OPTIONS.map((font) => (
							<option key={font.value} value={font.value}>
								{font.label}
							</option>
						))}
					</select>
				</div>

				{/* Text Color */}
				<ColorField
					label="Default Text Color"
					value={globalSettings.textColor}
					onChange={(c) =>
						updateGlobalSettings({ textColor: c })
					}
				/>

				{/* Link Color */}
				<ColorField
					label="Link Color"
					value={globalSettings.linkColor}
					onChange={(c) =>
						updateGlobalSettings({ linkColor: c })
					}
				/>
			</div>
		</div>
	);
};
