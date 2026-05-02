import * as ColorPickerUI from "@reloop/ui/color-picker";
import * as Input from "@reloop/ui/input";
import * as Popover from "@reloop/ui/popover";

export function ColorPicker({
	value,
	onChange,
}: {
	value: string;
	onChange: (v: string) => void;
}) {
	return (
		<div className="flex items-center gap-1">
			<Popover.Root>
				<Popover.Trigger asChild>
					<button
						type="button"
						className="h-5 w-5 shrink-0 rounded border border-(--re-border) cursor-pointer"
						style={{ backgroundColor: value || "#000000" }}
					/>
				</Popover.Trigger>
				<Popover.Content className="w-64 p-3">
					<ColorPickerUI.Root
						value={value}
						onChange={(c) => onChange(c.toString("hex"))}
					>
						<div className="flex flex-col gap-3">
							<ColorPickerUI.Area
								colorSpace="hsb"
								xChannel="saturation"
								yChannel="brightness"
							>
								<ColorPickerUI.Thumb />
							</ColorPickerUI.Area>
							<ColorPickerUI.Slider colorSpace="hsb" channel="hue">
								<ColorPickerUI.SliderTrack />
								<ColorPickerUI.Thumb />
							</ColorPickerUI.Slider>
							<div className="flex items-center gap-2">
								<ColorPickerUI.Swatch color={value} />
								<Input.Root size="xsmall" className="flex-1">
									<Input.Wrapper>
										<Input.Input
											value={value}
											onChange={(e) => onChange(e.target.value)}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
						</div>
					</ColorPickerUI.Root>
				</Popover.Content>
			</Popover.Root>
			<Input.Root size="xsmall" className="w-20">
				<Input.Wrapper>
					<Input.Input
						value={value}
						onChange={(e) => onChange(e.target.value)}
					/>
				</Input.Wrapper>
			</Input.Root>
		</div>
	);
}
