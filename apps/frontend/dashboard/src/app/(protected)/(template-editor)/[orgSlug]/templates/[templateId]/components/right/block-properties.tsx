"use client";

import type { TemplateBlock } from "@reloop/db/schema";
import * as Button from "@reloop/ui/button";

import * as ColorPicker from "@reloop/ui/color-picker";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Popover from "@reloop/ui/popover";
import * as SegmentedControl from "@reloop/ui/segmented-control";
import * as Switch from "@reloop/ui/switch";
import { useState } from "react";
import { parseColor } from "react-aria-components";
import type {
	ButtonProps,
	ColumnsProps,
	DividerProps,
	HeadingProps,
	HtmlProps,
	ImageProps,
	SectionProps,
	SpacerProps,
	TextProps,
} from "../../editor/block-types";
import { useEditorStore } from "../../editor/use-editor-store";

// ============ Reusable Property Controls ============

interface PropFieldProps {
	label: string;
	children: React.ReactNode;
}

const PropField = ({ label, children }: PropFieldProps) => (
	<div className="flex flex-col gap-1.5">
		<Label.Root className="font-medium text-text-sub-600 text-xs">
			{label}
		</Label.Root>
		{children}
	</div>
);

interface ColorInputProps {
	value: string;
	onChange: (value: string) => void;
}

const PRESET_COLORS = [
	"#000000",
	"#1F2937",
	"#374151",
	"#4B5563",
	"#FFFFFF",
	"#F3F4F6",
	"#E5E7EB",
	"#D1D5DB",
	"#EF4444",
	"#F97316",
	"#EAB308",
	"#22C55E",
	"#3B82F6",
	"#8B5CF6",
	"#EC4899",
	"#06B6D4",
];

const ColorInput = ({ value, onChange }: ColorInputProps) => {
	const [isOpen, setIsOpen] = useState(false);
	let colorObj: ReturnType<typeof parseColor>;
	try {
		colorObj = parseColor(value || "#000000");
	} catch {
		colorObj = parseColor("#000000");
	}

	return (
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
								{PRESET_COLORS.map((c) => (
									<ColorPicker.SwatchPickerItem
										key={c}
										color={c}
									>
										<ColorPicker.Swatch />
									</ColorPicker.SwatchPickerItem>
								))}
							</ColorPicker.SwatchPicker>
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
						placeholder="#000000"
						className="font-mono text-xs"
					/>
				</Input.Wrapper>
			</Input.Root>
		</div>
	);
};

const AlignButtons = ({
	value,
	onChange,
}: { value: string; onChange: (v: string) => void }) => (
	<SegmentedControl.Root
		value={value}
		onValueChange={onChange}
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
);

// ============ Type-Specific Property Panels ============

interface BlockPropsEditorProps {
	block: TemplateBlock;
	update: (props: Record<string, unknown>) => void;
}

const HEADING_DEFAULT_SIZES: Record<number, number> = {
	1: 32,
	2: 24,
	3: 20,
};

const FONT_OPTIONS = [
	{ value: "Inter, sans-serif", label: "Inter" },
	{ value: "Arial, sans-serif", label: "Arial" },
	{ value: "Georgia, serif", label: "Georgia" },
	{ value: "Times New Roman, serif", label: "Times New Roman" },
	{ value: "Helvetica, sans-serif", label: "Helvetica" },
	{ value: "Verdana, sans-serif", label: "Verdana" },
	{ value: "system-ui, sans-serif", label: "System UI" },
];

const HeadingProperties = ({ block, update }: BlockPropsEditorProps) => {
	const props = block.props as unknown as HeadingProps;
	const [fontSizeInput, setFontSizeInput] = useState(String(props.fontSize));

	// Keep local input in sync when props change externally (e.g. level change)
	const prevFontSize = props.fontSize;
	if (Number(fontSizeInput) !== prevFontSize && document.activeElement?.closest('[data-font-size-input]') === null) {
		setFontSizeInput(String(prevFontSize));
	}

	return (
		<div className="space-y-4">
			<PropField label="Level">
				<SegmentedControl.Root
					value={String(props.level)}
					onValueChange={(v) => {
						const newLevel = Number(v);
						const currentDefault = HEADING_DEFAULT_SIZES[props.level] || 32;
						const isCustomSize = props.fontSize !== currentDefault;
						if (isCustomSize) {
							// User has a custom font size — keep it
							update({ level: newLevel });
						} else {
							// Font size was at default — switch to the new level's default
							const newFontSize = HEADING_DEFAULT_SIZES[newLevel] || 32;
							setFontSizeInput(String(newFontSize));
							update({ level: newLevel, fontSize: newFontSize });
						}
					}}
				>
					<SegmentedControl.List>
						<SegmentedControl.Trigger value="1" className="text-xs">
							H1
						</SegmentedControl.Trigger>
						<SegmentedControl.Trigger value="2" className="text-xs">
							H2
						</SegmentedControl.Trigger>
						<SegmentedControl.Trigger value="3" className="text-xs">
							H3
						</SegmentedControl.Trigger>
					</SegmentedControl.List>
				</SegmentedControl.Root>
			</PropField>
			<PropField label="Font Family">
				<select
					value={props.fontFamily}
					onChange={(e) =>
						update({ fontFamily: e.target.value })
					}
					className="w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-1.5 text-sm text-text-strong-950 outline-none transition-colors focus:border-primary-base"
				>
					{FONT_OPTIONS.map((font) => (
						<option key={font.value} value={font.value}>
							{font.label}
						</option>
					))}
				</select>
			</PropField>
			<PropField label="Font Size">
				<Input.Root size="xsmall">
					<Input.Wrapper>
						<Input.Input
							data-font-size-input
							type="number"
							min={1}
							value={fontSizeInput}
							onChange={(e) => {
								setFontSizeInput(e.target.value);
								const num = Number(e.target.value);
								if (e.target.value !== '' && num > 0) {
									update({ fontSize: num });
								}
							}}
							onBlur={() => {
								const num = Number(fontSizeInput);
								if (!fontSizeInput || num <= 0) {
									const fallback = HEADING_DEFAULT_SIZES[props.level] || 32;
									setFontSizeInput(String(fallback));
									update({ fontSize: fallback });
								}
							}}
						/>
					</Input.Wrapper>
				</Input.Root>
			</PropField>
			<PropField label="Color">
				<ColorInput
					value={props.color}
					onChange={(c) => update({ color: c })}
				/>
			</PropField>
			<PropField label="Alignment">
				<AlignButtons
					value={props.align}
					onChange={(v) => update({ align: v })}
				/>
			</PropField>
		</div>
	);
};

const TextProperties = ({ block, update }: BlockPropsEditorProps) => {
	const props = block.props as unknown as TextProps;
	return (
		<div className="space-y-4">
			<PropField label="Font Size">
				<Input.Root size="xsmall">
					<Input.Wrapper>
						<Input.Input
							type="number"
							value={props.fontSize}
							onChange={(e) =>
								update({ fontSize: Number(e.target.value) })
							}
						/>
					</Input.Wrapper>
				</Input.Root>
			</PropField>
			<PropField label="Line Height">
				<Input.Root size="xsmall">
					<Input.Wrapper>
						<Input.Input
							type="number"
							step="0.1"
							value={props.lineHeight}
							onChange={(e) =>
								update({
									lineHeight: Number(e.target.value),
								})
							}
						/>
					</Input.Wrapper>
				</Input.Root>
			</PropField>
			<PropField label="Color">
				<ColorInput
					value={props.color}
					onChange={(c) => update({ color: c })}
				/>
			</PropField>
			<PropField label="Alignment">
				<AlignButtons
					value={props.align}
					onChange={(v) => update({ align: v })}
				/>
			</PropField>
		</div>
	);
};

const ButtonProperties = ({ block, update }: BlockPropsEditorProps) => {
	const props = block.props as unknown as ButtonProps;
	return (
		<div className="space-y-4">
			<PropField label="Button Text">
				<Input.Root size="xsmall">
					<Input.Wrapper>
						<Input.Input
							type="text"
							value={props.text}
							onChange={(e) =>
								update({ text: e.target.value })
							}
						/>
					</Input.Wrapper>
				</Input.Root>
			</PropField>
			<PropField label="URL">
				<Input.Root size="xsmall">
					<Input.Wrapper>
						<Input.Icon
							as={Icon}
							name="link-1"
							className="h-3.5 w-3.5 text-text-sub-600"
						/>
						<Input.Input
							type="text"
							value={props.url}
							onChange={(e) =>
								update({ url: e.target.value })
							}
							placeholder="https://"
						/>
					</Input.Wrapper>
				</Input.Root>
			</PropField>
			<PropField label="Background Color">
				<ColorInput
					value={props.bgColor}
					onChange={(c) => update({ bgColor: c })}
				/>
			</PropField>
			<PropField label="Text Color">
				<ColorInput
					value={props.textColor}
					onChange={(c) => update({ textColor: c })}
				/>
			</PropField>
			<PropField label="Border Radius">
				<Input.Root size="xsmall">
					<Input.Wrapper>
						<Input.Input
							type="number"
							value={props.borderRadius}
							onChange={(e) =>
								update({
									borderRadius: Number(e.target.value),
								})
							}
						/>
					</Input.Wrapper>
				</Input.Root>
			</PropField>
			<PropField label="Alignment">
				<AlignButtons
					value={props.align}
					onChange={(v) => update({ align: v })}
				/>
			</PropField>
			<PropField label="Full Width">
				<div className="flex items-center gap-2">
					<Switch.Root
						checked={props.fullWidth}
						onCheckedChange={(checked) =>
							update({ fullWidth: checked })
						}
					/>
					<span className="text-xs text-text-sub-600">
						{props.fullWidth ? "On" : "Off"}
					</span>
				</div>
			</PropField>
		</div>
	);
};

const ImageProperties = ({ block, update }: BlockPropsEditorProps) => {
	const props = block.props as unknown as ImageProps;
	return (
		<div className="space-y-4">
			<PropField label="Image URL">
				<Input.Root size="xsmall">
					<Input.Wrapper>
						<Input.Icon
							as={Icon}
							name="image-1"
							className="h-3.5 w-3.5 text-text-sub-600"
						/>
						<Input.Input
							type="text"
							value={props.src}
							onChange={(e) =>
								update({ src: e.target.value })
							}
							placeholder="https://..."
						/>
					</Input.Wrapper>
				</Input.Root>
			</PropField>
			<PropField label="Alt Text">
				<Input.Root size="xsmall">
					<Input.Wrapper>
						<Input.Input
							type="text"
							value={props.alt}
							onChange={(e) =>
								update({ alt: e.target.value })
							}
							placeholder="Image description"
						/>
					</Input.Wrapper>
				</Input.Root>
			</PropField>
			<div className="grid grid-cols-2 gap-2">
				<PropField label="Width">
					<Input.Root size="xsmall">
						<Input.Wrapper>
							<Input.Input
								type="text"
								value={props.width}
								onChange={(e) =>
									update({ width: e.target.value })
								}
								placeholder="100%"
							/>
						</Input.Wrapper>
					</Input.Root>
				</PropField>
				<PropField label="Height">
					<Input.Root size="xsmall">
						<Input.Wrapper>
							<Input.Input
								type="text"
								value={props.height}
								onChange={(e) =>
									update({ height: e.target.value })
								}
								placeholder="auto"
							/>
						</Input.Wrapper>
					</Input.Root>
				</PropField>
			</div>
			<PropField label="Link URL">
				<Input.Root size="xsmall">
					<Input.Wrapper>
						<Input.Icon
							as={Icon}
							name="link-1"
							className="h-3.5 w-3.5 text-text-sub-600"
						/>
						<Input.Input
							type="text"
							value={props.link}
							onChange={(e) =>
								update({ link: e.target.value })
							}
							placeholder="https://..."
						/>
					</Input.Wrapper>
				</Input.Root>
			</PropField>
			<PropField label="Alignment">
				<AlignButtons
					value={props.align}
					onChange={(v) => update({ align: v })}
				/>
			</PropField>
		</div>
	);
};

const DividerProperties = ({ block, update }: BlockPropsEditorProps) => {
	const props = block.props as unknown as DividerProps;
	return (
		<div className="space-y-4">
			<PropField label="Style">
				<SegmentedControl.Root
					value={props.style}
					onValueChange={(v) => update({ style: v })}
				>
					<SegmentedControl.List>
						<SegmentedControl.Trigger
							value="solid"
							className="text-xs"
						>
							<div className="h-0.5 w-4 bg-current" />
						</SegmentedControl.Trigger>
						<SegmentedControl.Trigger
							value="dashed"
							className="text-xs"
						>
							<div className="flex gap-0.5">
								<div className="h-0.5 w-1.5 bg-current" />
								<div className="h-0.5 w-1.5 bg-current" />
							</div>
						</SegmentedControl.Trigger>
						<SegmentedControl.Trigger
							value="dotted"
							className="text-xs"
						>
							<div className="flex gap-0.5">
								<div className="h-1 w-1 rounded-full bg-current" />
								<div className="h-1 w-1 rounded-full bg-current" />
								<div className="h-1 w-1 rounded-full bg-current" />
							</div>
						</SegmentedControl.Trigger>
					</SegmentedControl.List>
				</SegmentedControl.Root>
			</PropField>
			<PropField label="Thickness">
				<Input.Root size="xsmall">
					<Input.Wrapper>
						<Input.Input
							type="number"
							min={1}
							value={props.thickness}
							onChange={(e) =>
								update({
									thickness: Number(e.target.value),
								})
							}
						/>
					</Input.Wrapper>
				</Input.Root>
			</PropField>
			<PropField label="Color">
				<ColorInput
					value={props.color}
					onChange={(c) => update({ color: c })}
				/>
			</PropField>
			<PropField label="Width">
				<Input.Root size="xsmall">
					<Input.Wrapper>
						<Input.Input
							type="text"
							value={props.width}
							onChange={(e) =>
								update({ width: e.target.value })
							}
							placeholder="100%"
						/>
					</Input.Wrapper>
				</Input.Root>
			</PropField>
		</div>
	);
};

const SpacerProperties = ({ block, update }: BlockPropsEditorProps) => {
	const props = block.props as unknown as SpacerProps;
	return (
		<div className="space-y-4">
			<PropField label="Height">
				<div className="flex items-center gap-2">
					<Input.Root size="xsmall" className="flex-1">
						<Input.Wrapper>
							<Input.Input
								type="number"
								min={8}
								max={200}
								value={props.height}
								onChange={(e) =>
									update({
										height: Number(e.target.value),
									})
								}
							/>
						</Input.Wrapper>
					</Input.Root>
					<span className="text-xs text-text-soft-400">px</span>
				</div>
			</PropField>
		</div>
	);
};

const SectionProperties = ({ block, update }: BlockPropsEditorProps) => {
	const props = block.props as unknown as SectionProps;
	return (
		<div className="space-y-4">
			<PropField label="Background Color">
				<ColorInput
					value={props.bgColor}
					onChange={(c) => update({ bgColor: c })}
				/>
			</PropField>
			<PropField label="Padding">
				<Input.Root size="xsmall">
					<Input.Wrapper>
						<Input.Input
							type="number"
							value={props.padding}
							onChange={(e) =>
								update({ padding: Number(e.target.value) })
							}
						/>
					</Input.Wrapper>
				</Input.Root>
			</PropField>
			<PropField label="Border Radius">
				<Input.Root size="xsmall">
					<Input.Wrapper>
						<Input.Input
							type="number"
							value={props.borderRadius}
							onChange={(e) =>
								update({
									borderRadius: Number(e.target.value),
								})
							}
						/>
					</Input.Wrapper>
				</Input.Root>
			</PropField>
		</div>
	);
};

const ColumnsProperties = ({ block, update }: BlockPropsEditorProps) => {
	const props = block.props as unknown as ColumnsProps;
	return (
		<div className="space-y-4">
			<PropField label="Columns">
				<SegmentedControl.Root
					value={String(props.columns)}
					onValueChange={(v) => {
						const cols = Number(v);
						const widths = Array(cols).fill(
							Math.floor(100 / cols),
						);
						update({ columns: cols, widths });
					}}
				>
					<SegmentedControl.List>
						<SegmentedControl.Trigger
							value="2"
							className="text-xs"
						>
							2
						</SegmentedControl.Trigger>
						<SegmentedControl.Trigger
							value="3"
							className="text-xs"
						>
							3
						</SegmentedControl.Trigger>
						<SegmentedControl.Trigger
							value="4"
							className="text-xs"
						>
							4
						</SegmentedControl.Trigger>
					</SegmentedControl.List>
				</SegmentedControl.Root>
			</PropField>
			<PropField label="Gap">
				<div className="flex items-center gap-2">
					<Input.Root size="xsmall" className="flex-1">
						<Input.Wrapper>
							<Input.Input
								type="number"
								min={0}
								value={props.gap}
								onChange={(e) =>
									update({
										gap: Number(e.target.value),
									})
								}
							/>
						</Input.Wrapper>
					</Input.Root>
					<span className="text-xs text-text-soft-400">px</span>
				</div>
			</PropField>
		</div>
	);
};

const HtmlProperties = ({ block, update }: BlockPropsEditorProps) => {
	const props = block.props as unknown as HtmlProps;
	return (
		<div className="space-y-4">
			<PropField label="HTML Code">
				<textarea
					value={props.code}
					onChange={(e) => update({ code: e.target.value })}
					rows={12}
					className="w-full rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-3 font-mono text-xs text-text-strong-950 outline-none transition-colors focus:border-primary-base"
					placeholder="<div>Your HTML here</div>"
				/>
			</PropField>
		</div>
	);
};

// ============ Block Type Labels ============
const BLOCK_ICONS: Record<string, string> = {
	heading: "heading",
	text: "text",
	button: "cursor-click-1",
	image: "image-1",
	divider: "minus",
	spacer: "expand",
	section: "square",
	columns: "layout-grid",
	html: "source-code",
};

const BLOCK_LABELS: Record<string, string> = {
	heading: "Heading",
	text: "Text",
	button: "Button",
	image: "Image",
	divider: "Divider",
	spacer: "Spacer",
	section: "Section",
	columns: "Columns",
	html: "HTML",
};

// ============ Main Block Properties Component ============
interface BlockPropertiesProps {
	block: TemplateBlock;
}

export const BlockProperties = ({ block }: BlockPropertiesProps) => {
	const updateBlockProps = useEditorStore((s) => s.updateBlockProps);
	const removeBlock = useEditorStore((s) => s.removeBlock);
	const selectBlock = useEditorStore((s) => s.selectBlock);
	const duplicateBlock = useEditorStore((s) => s.duplicateBlock);

	const update = (props: Record<string, unknown>) => {
		updateBlockProps(block.id, props);
	};

	const icon = BLOCK_ICONS[block.type] || "square";
	const label = BLOCK_LABELS[block.type] || block.type;

	const renderProperties = () => {
		switch (block.type) {
			case "heading":
				return (
					<HeadingProperties block={block} update={update} />
				);
			case "text":
				return <TextProperties block={block} update={update} />;
			case "button":
				return <ButtonProperties block={block} update={update} />;
			case "image":
				return <ImageProperties block={block} update={update} />;
			case "divider":
				return (
					<DividerProperties block={block} update={update} />
				);
			case "spacer":
				return <SpacerProperties block={block} update={update} />;
			case "section":
				return (
					<SectionProperties block={block} update={update} />
				);
			case "columns":
				return (
					<ColumnsProperties block={block} update={update} />
				);
			case "html":
				return <HtmlProperties block={block} update={update} />;
			default:
				return (
					<p className="text-sm text-text-soft-400">
						No properties available
					</p>
				);
		}
	};

	return (
		<div className="flex flex-col">
			{/* Block header */}
			<div className="border-stroke-soft-100/50 border-b px-4 py-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => selectBlock(null)}
							className="flex h-6 w-6 items-center justify-center rounded-md text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
						>
							<Icon
								name="arrow-left"
								className="h-3.5 w-3.5"
							/>
						</button>
						<Icon
							name={icon}
							className="h-4 w-4 text-text-sub-600"
						/>
						<p className="font-medium text-sm text-text-strong-950">
							{label}
						</p>
					</div>
					<div className="flex items-center gap-1">
						<Button.Root
							variant="neutral"
							size="xsmall"
							mode="ghost"
							onClick={() => duplicateBlock(block.id)}
						>
							<Button.Icon
								as={Icon}
								name="copy-2"
								className="h-3.5 w-3.5"
							/>
						</Button.Root>
						<Button.Root
							variant="error"
							size="xsmall"
							mode="ghost"
							onClick={() => {
								removeBlock(block.id);
								selectBlock(null);
							}}
						>
							<Button.Icon
								as={Icon}
								name="delete"
								className="h-3.5 w-3.5"
							/>
						</Button.Root>
					</div>
				</div>
			</div>

			{/* Properties */}
			<div className="px-4 py-4">{renderProperties()}</div>
		</div>
	);
};
