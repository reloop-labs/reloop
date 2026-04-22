"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as ColorPicker from "@reloop/ui/color-picker";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Popover from "@reloop/ui/popover";
import * as SegmentedControl from "@reloop/ui/segmented-control";
import * as Tooltip from "@reloop/ui/tooltip";
import { useState } from "react";
import { parseColor } from "react-aria-components";

// ============ Types ============
type BorderStyle = "none" | "solid" | "dashed" | "dotted";

// ============ Preset Colors ============
const PRESET_COLORS = [
	"#000000",
	"#1F2937",
	"#374151",
	"#4B5563",
	"#6B7280",
	"#9CA3AF",
	"#D1D5DB",
	"#E5E7EB",
	"#EF4444",
	"#F97316",
	"#EAB308",
	"#22C55E",
	"#3B82F6",
	"#8B5CF6",
	"#EC4899",
	"#06B6D4",
];

// ============ Radius Sub-Component ============
interface RadiusInputProps {
	label: string;
	corner: "tl" | "tr" | "bl" | "br";
	placeholder?: string;
}

const RadiusInput = ({
	label,
	corner,
	placeholder = "0",
}: RadiusInputProps) => {
	const cornerStyles = {
		tl: "rounded-tl-lg border-t-1 border-l-1",
		tr: "rounded-tr-lg border-t-1 border-r-1",
		bl: "rounded-bl-lg border-b-1 border-l-1",
		br: "rounded-br-lg border-b-1 border-r-1",
	};

	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<div className="flex-1">
					<Input.Root size="xsmall">
						<Input.Wrapper>
							<div
								className={cn(
									"h-3 w-3 border-text-sub-600",
									cornerStyles[corner],
								)}
							/>
							<Input.Input
								type="text"
								placeholder={placeholder}
								className="text-center"
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
			</Tooltip.Trigger>
			<Tooltip.Content
				size="xsmall"
				side="bottom"
				variant="light"
				className="text-xs"
			>
				{label}
			</Tooltip.Content>
		</Tooltip.Root>
	);
};

// ============ Main Component ============
export const InputBorder = () => {
	const [style, setStyle] = useState<BorderStyle>("none");
	const [color, setColor] = useState(parseColor("#000000"));
	const [isRadiusExpanded, setIsRadiusExpanded] = useState(false);
	const [isColorOpen, setIsColorOpen] = useState(false);

	const isDisabled = style === "none";

	return (
		<div className="flex flex-col gap-3">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Label.Root className="font-medium text-text-sub-600 text-xs">
					Border
				</Label.Root>
			</div>

			{/* Style & Width Row */}
			<div className="flex gap-1.5">
				{/* Width input */}
				<Input.Root size="xsmall" className="w-16">
					<Input.Wrapper>
						<Input.Icon
							as={Icon}
							name="menu"
							className="h-3.5 w-3.5 text-text-sub-600"
						/>
						<Input.Input
							type="text"
							placeholder="0"
							className="text-center"
							disabled={isDisabled}
						/>
					</Input.Wrapper>
				</Input.Root>

				{/* Border style segmented control */}
				<SegmentedControl.Root
					value={style}
					onValueChange={(value) => setStyle(value as BorderStyle)}
					className="flex-1"
				>
					<SegmentedControl.List>
						<SegmentedControl.Trigger value="none" className="text-xs">
							None
						</SegmentedControl.Trigger>
						<SegmentedControl.Trigger value="solid" className="text-xs">
							<div className="h-0.5 w-4 bg-current" />
						</SegmentedControl.Trigger>
						<SegmentedControl.Trigger value="dashed" className="text-xs">
							<div className="flex gap-0.5">
								<div className="h-0.5 w-1.5 bg-current" />
								<div className="h-0.5 w-1.5 bg-current" />
							</div>
						</SegmentedControl.Trigger>
						<SegmentedControl.Trigger value="dotted" className="text-xs">
							<div className="flex gap-0.5">
								<div className="h-1 w-1 rounded-full bg-current" />
								<div className="h-1 w-1 rounded-full bg-current" />
								<div className="h-1 w-1 rounded-full bg-current" />
							</div>
						</SegmentedControl.Trigger>
					</SegmentedControl.List>
				</SegmentedControl.Root>
			</div>

			{/* Color Row */}
			<div
				className={cn(
					"flex gap-1.5",
					isDisabled && "pointer-events-none opacity-50",
				)}
			>
				<ColorPicker.Root value={color} onChange={setColor}>
					<Popover.Root open={isColorOpen} onOpenChange={setIsColorOpen}>
						<Popover.Trigger asChild>
							<button
								type="button"
								className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stroke-soft-200/50 transition-all"
								disabled={isDisabled}
							>
								<ColorPicker.Swatch
									color={color}
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
								<ColorPicker.Slider channel="hue" colorSpace="hsb">
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
									<Icon name="eyedropper" className="h-4 w-4" />
								</ColorPicker.EyeDropperButton>
								<ColorPicker.Field className="flex-1">
									<Input.Root size="xsmall">
										<Input.Wrapper>
											<Input.Input
												placeholder="#000000"
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
							value={color.toString("hex")}
							onChange={(e) => {
								try {
									setColor(parseColor(e.target.value));
								} catch {
									// Invalid color, ignore
								}
							}}
							placeholder="#000000"
							className="font-mono text-xs"
							disabled={isDisabled}
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>

			{/* Radius Row */}
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between">
					<span className="text-text-sub-600 text-xs">Radius</span>
					<Button.Root
						variant="neutral"
						size="xsmall"
						mode="ghost"
						onClick={() => setIsRadiusExpanded(!isRadiusExpanded)}
						className={cn(
							"h-6 w-6 transition-colors",
							isRadiusExpanded && "bg-bg-weak-50 text-text-strong-950",
						)}
					>
						<Button.Icon
							as={Icon}
							name="section-rect"
							className="h-3.5 w-3.5"
						/>
					</Button.Root>
				</div>

				<div
					className={cn(
						"grid gap-1.5",
						isRadiusExpanded ? "grid-cols-4" : "grid-cols-1",
					)}
				>
					{isRadiusExpanded ? (
						<>
							<RadiusInput label="Top Left" corner="tl" />
							<RadiusInput label="Top Right" corner="tr" />
							<RadiusInput label="Bottom Left" corner="bl" />
							<RadiusInput label="Bottom Right" corner="br" />
						</>
					) : (
						<div className="flex-1">
							<Input.Root size="xsmall">
								<Input.Wrapper>
									<Input.Icon
										as={Icon}
										name="maximize"
										className="h-3.5 w-3.5 text-text-sub-600"
									/>
									<Input.Input
										type="text"
										placeholder="0"
										className="text-center"
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
