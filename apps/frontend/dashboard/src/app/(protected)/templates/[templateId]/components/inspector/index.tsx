"use client";

import { Inspector } from "@react-email/editor/ui";
import { useCurrentEditor } from "@tiptap/react";
import { useState } from "react";
import Breadcrumb from "./breadcrumb";
import { ColorPicker } from "./color-picker";
import { ImageSrcControl } from "./image-src-control";
import { type NodeTypePill, NodeTypePills } from "./node-type-pills";
import { NumInput } from "./num-input";
import { PropRow } from "./prop-row";
import { SectionHeader } from "./section-header";
import { SpacingControl } from "./spacing-control";
import { TypographyControls } from "./typography/typography-controls";
import { UrlInput } from "./url-input";

/* ------------------------------------------------------------------ */
/* Shared section wrapper                                              */
/* ------------------------------------------------------------------ */
function InspectorSection({ children }: { children: React.ReactNode }) {
	return <div className="flex flex-col py-2">{children}</div>;
}

function ColorRow({
	label,
	value,
	onChange,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
}) {
	return (
		<PropRow label={label}>
			<ColorPicker value={value} onChange={onChange} />
		</PropRow>
	);
}

type InspectorStyleProperty =
	| "color"
	| "fontSize"
	| "lineHeight"
	| "letterSpacing"
	| "align"
	| "backgroundColor"
	| "borderColor"
	| "borderWidth"
	| "borderTopWidth"
	| "borderRightWidth"
	| "borderBottomWidth"
	| "borderLeftWidth"
	| "paddingTop"
	| "paddingRight"
	| "paddingBottom"
	| "paddingLeft";

interface TextSectionProps {
	getStyle: (name: InspectorStyleProperty) => string | number | undefined;
	setStyle: (name: InspectorStyleProperty, value: string | number) => void;
	marks: Record<string, boolean | undefined>;
	toggleMark: (mark: string) => void;
	alignment: string;
	setAlignment: (align: string) => void;
	isLinkActive: boolean;
	linkColor: string;
	setLinkColor: (color: string) => void;
	activeNodeType: NodeTypePill;
	setActiveNodeType: (type: NodeTypePill) => void;
}

function TextSection({
	getStyle,
	setStyle,
	marks,
	toggleMark,
	alignment,
	setAlignment,
	isLinkActive,
	linkColor,
	setLinkColor,
	activeNodeType,
	setActiveNodeType,
}: TextSectionProps) {
	return (
		<InspectorSection>
			<div className="px-4 pt-3 pb-2">
				<NodeTypePills active={activeNodeType} onChange={setActiveNodeType} />
			</div>

			<SectionHeader label="Text" />

			<ColorRow
				label="Color"
				value={String(getStyle("color") ?? "")}
				onChange={(v) => setStyle("color", v)}
			/>
			<PropRow label="Font size">
				<NumInput
					value={getStyle("fontSize")}
					onChange={(v) => setStyle("fontSize", v as number)}
					unit="px"
				/>
			</PropRow>
			<PropRow label="Line height">
				<NumInput
					value={getStyle("lineHeight")}
					onChange={(v) => setStyle("lineHeight", v as number)}
					unit="%"
				/>
			</PropRow>
			<PropRow label="Tracking">
				<NumInput
					value={getStyle("letterSpacing")}
					onChange={(v) => setStyle("letterSpacing", v as number)}
					unit="px"
				/>
			</PropRow>

			<TypographyControls
				marks={marks}
				toggleMark={toggleMark}
				alignment={alignment}
				setAlignment={setAlignment}
			/>

			{isLinkActive && (
				<ColorRow
					label="Link color"
					value={linkColor}
					onChange={setLinkColor}
				/>
			)}
		</InspectorSection>
	);
}

/* ------------------------------------------------------------------ */
/* Root inspector                                                       */
/* ------------------------------------------------------------------ */
export const EmailInspector = () => {
	const [activeNodeType, setActiveNodeType] = useState<NodeTypePill>("Body");
	const { editor } = useCurrentEditor();
	if (!editor) return null;

	return (
		<Inspector.Root>
			{/* ── Breadcrumb ── */}
			<Breadcrumb />

			{/* ── All sections in one flat scroll container ── */}
			<div className="flex flex-col divide-y divide-stroke-soft-200 pb-6">
				{/* ── Text card (Handles both text selection and node selection) ── */}
				<Inspector.Text>
					{(textProps) => (
						<TextSection
							{...textProps}
							activeNodeType={activeNodeType}
							setActiveNodeType={setActiveNodeType}
						/>
					)}
				</Inspector.Text>

				<Inspector.Node>
					{(nodeProps) => {
						const isTextRelated = ["paragraph", "heading"].includes(
							nodeProps.nodeType,
						);
						if (!isTextRelated) return null;

						// Calculate props for node selection since Inspector.Node doesn't provide them
						const marks = {
							bold: editor.isActive("bold"),
							italic: editor.isActive("italic"),
							underline: editor.isActive("underline"),
							strike: editor.isActive("strike"),
							uppercase: editor.isActive("uppercase"),
							lowercase: editor.isActive("lowercase"),
						};

						const toggleMark = (mark: string) => {
							editor.chain().focus().toggleMark(mark).run();
						};

						const alignment = (nodeProps.getStyle("align") as string) || "left";
						const setAlignment = (align: string) =>
							nodeProps.setStyle("align", align);

						const isLinkActive = editor.isActive("link");
						const linkColor =
							(editor.getAttributes("link").color as string) || "";
						const setLinkColor = (color: string) =>
							editor
								.chain()
								.focus()
								.extendMarkRange("link")
								.updateAttributes("link", { color })
								.run();

						return (
							<TextSection
								{...nodeProps}
								marks={marks}
								toggleMark={toggleMark}
								alignment={alignment}
								setAlignment={setAlignment}
								isLinkActive={isLinkActive}
								linkColor={linkColor}
								setLinkColor={setLinkColor}
								activeNodeType={activeNodeType}
								setActiveNodeType={setActiveNodeType}
							/>
						);
					}}
				</Inspector.Node>

				{/* ── Spacing + image + button node card ── */}
				<Inspector.Node>
					{({ nodeType, getStyle, batchSetStyle, getAttr, setAttr }) => (
						<InspectorSection>
							<SectionHeader label="Spacing" />

							<SpacingControl
								value={{
									top: (getStyle("paddingTop") as number) ?? "",
									right: (getStyle("paddingRight") as number) ?? "",
									bottom: (getStyle("paddingBottom") as number) ?? "",
									left: (getStyle("paddingLeft") as number) ?? "",
								}}
								onChange={({ top, right, bottom, left }) =>
									batchSetStyle([
										{ prop: "paddingTop", value: top as number },
										{ prop: "paddingRight", value: right as number },
										{ prop: "paddingBottom", value: bottom as number },
										{ prop: "paddingLeft", value: left as number },
									])
								}
							/>

							{nodeType === "image" && (
								<div className="px-4 pb-3">
									<ImageSrcControl
										value={{
											src: String(getAttr("src") ?? ""),
											alt: String(getAttr("alt") ?? ""),
											width: (getAttr("width") as number) ?? "",
											height: (getAttr("height") as number) ?? "",
										}}
										onChange={({ src, alt, width, height }) => {
											setAttr("src", src);
											setAttr("alt", alt);
											setAttr("width", width);
											setAttr("height", height);
										}}
									/>
								</div>
							)}

							{nodeType === "button" && (
								<PropRow label="Link">
									<UrlInput
										value={String(getAttr("href") ?? "")}
										onChange={(v) => setAttr("href", v)}
									/>
								</PropRow>
							)}
						</InspectorSection>
					)}
				</Inspector.Node>

				{/* ── Background card ── */}
				<Inspector.Node>
					{({ getStyle, setStyle }) => (
						<InspectorSection>
							<SectionHeader label="Background" />
							<ColorRow
								label="Color"
								value={String(getStyle("backgroundColor") ?? "")}
								onChange={(v) => setStyle("backgroundColor", v)}
							/>
							<div className="h-2" />
						</InspectorSection>
					)}
				</Inspector.Node>

				{/* ── Border card ── */}
				<Inspector.Node>
					{({ getStyle, setStyle, batchSetStyle }) => (
						<InspectorSection>
							<SectionHeader label="Border" />
							<SpacingControl
								label="Border"
								value={{
									top:
										(getStyle("borderTopWidth") as number) ??
										(getStyle("borderWidth") as number) ??
										"",
									right:
										(getStyle("borderRightWidth") as number) ??
										(getStyle("borderWidth") as number) ??
										"",
									bottom:
										(getStyle("borderBottomWidth") as number) ??
										(getStyle("borderWidth") as number) ??
										"",
									left:
										(getStyle("borderLeftWidth") as number) ??
										(getStyle("borderWidth") as number) ??
										"",
								}}
								onChange={({ top, right, bottom, left }) =>
									batchSetStyle([
										{ prop: "borderTopWidth", value: top as number },
										{ prop: "borderRightWidth", value: right as number },
										{ prop: "borderBottomWidth", value: bottom as number },
										{ prop: "borderLeftWidth", value: left as number },
									])
								}
							/>
							<ColorRow
								label="Color"
								value={String(getStyle("borderColor") ?? "")}
								onChange={(v) => setStyle("borderColor", v)}
							/>
							<div className="h-2" />
						</InspectorSection>
					)}
				</Inspector.Node>

				{/* ── Document card ── */}
				<Inspector.Document>
					{({ findStyleValue, setGlobalStyle }) => (
						<InspectorSection>
							<SectionHeader label="Body" />
							<ColorRow
								label="Background"
								value={String(findStyleValue("body", "backgroundColor") ?? "")}
								onChange={(v) => setGlobalStyle("body", "backgroundColor", v)}
							/>
							<PropRow label="Container width">
								<NumInput
									value={findStyleValue("container", "width")}
									onChange={(v) => setGlobalStyle("container", "width", v)}
									unit="px"
								/>
							</PropRow>
							<PropRow label="Border radius">
								<NumInput
									value={findStyleValue("container", "borderRadius")}
									onChange={(v) =>
										setGlobalStyle("container", "borderRadius", v)
									}
									unit="px"
								/>
							</PropRow>
							<ColorRow
								label="Container bg"
								value={String(
									findStyleValue("container", "backgroundColor") ?? "",
								)}
								onChange={(v) =>
									setGlobalStyle("container", "backgroundColor", v)
								}
							/>
							<PropRow label="Line height">
								<NumInput
									value={findStyleValue("body", "lineHeight")}
									onChange={(v) => setGlobalStyle("body", "lineHeight", v)}
								/>
							</PropRow>
							<ColorRow
								label="Text color"
								value={String(findStyleValue("body", "color") ?? "")}
								onChange={(v) => setGlobalStyle("body", "color", v)}
							/>
							<div className="h-2" />
						</InspectorSection>
					)}
				</Inspector.Document>
			</div>
		</Inspector.Root>
	);
};
