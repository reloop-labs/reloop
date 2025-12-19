"use client";

import * as Button from "@reloop/ui/button";
import * as ColorPicker from "@reloop/ui/color-picker";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Popover from "@reloop/ui/popover";
import { useState } from "react";
import { parseColor } from "react-aria-components";

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

export const InputBackgroundColor = () => {
	const [color, setColor] = useState(parseColor("#FFFFFF"));
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<Label.Root className="font-medium text-text-sub-600 text-xs">
					Background
				</Label.Root>
			</div>

			<div className="flex gap-1.5">
				<ColorPicker.Root value={color} onChange={setColor}>
					<Popover.Root open={isOpen} onOpenChange={setIsOpen}>
						<Popover.Trigger asChild>
							<button
								type="button"
								className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stroke-soft-200/50 transition-all"
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
							{/* Color Area */}
							<ColorPicker.Area
								colorSpace="hsb"
								xChannel="saturation"
								yChannel="brightness"
							>
								<ColorPicker.Thumb className="size-4 rounded-full border-2 border-white shadow-md" />
							</ColorPicker.Area>

							{/* Hue Slider */}
							<div className="mt-3">
								<ColorPicker.Slider channel="hue" colorSpace="hsb">
									<ColorPicker.SliderTrack>
										<ColorPicker.Thumb />
									</ColorPicker.SliderTrack>
								</ColorPicker.Slider>
							</div>

							{/* Alpha Slider */}
							<div className="mt-2">
								<ColorPicker.Slider channel="alpha">
									<ColorPicker.SliderTrack>
										<ColorPicker.Thumb />
									</ColorPicker.SliderTrack>
								</ColorPicker.Slider>
							</div>

							{/* Preset Colors */}
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

							{/* Hex Input */}
							<div className="mt-3 flex items-center gap-2">
								<ColorPicker.EyeDropperButton className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-200 text-text-sub-600 transition-colors hover:bg-bg-weak-50">
									<Icon name="eyedropper" className="h-4 w-4" />
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
							value={color.toString("hex")}
							onChange={(e) => {
								try {
									setColor(parseColor(e.target.value));
								} catch {
									// Invalid color, ignore
								}
							}}
							placeholder="#FFFFFF"
							className="font-mono text-xs"
						/>
					</Input.Wrapper>
				</Input.Root>

				<Button.Root
					variant="neutral"
					size="xsmall"
					mode="ghost"
					className="h-8 w-8"
					onClick={() => setColor(parseColor("#FFFFFF"))}
				>
					<Button.Icon as={Icon} name="refresh-cw-1" className="h-3.5 w-3.5" />
				</Button.Root>
			</div>
		</div>
	);
};
