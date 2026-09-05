"use client";

import { Inspector } from "@react-email/editor/ui";
import { useCurrentEditor, useEditorState } from "@tiptap/react";
import type React from "react";
import {
	cssHasPaintedBackground,
	cssPaintedBackgroundValue,
} from "../preserve-email-link-underlines";
import {
	getActiveLinkCss,
	resolveInspectorTextStyle,
	setInlineCssDeclaration,
	setInlineCssProp,
} from "../resolve-inspector-text-style";
import Breadcrumb from "./breadcrumb";
import { ColorPicker } from "./color-picker";
import { ImageSrcControl } from "./image-src-control";
import { PropRow } from "./prop-row";
import { ScrubRow } from "./scrub-field";
import { SectionHeader } from "./section-header";
import { SpacingControl } from "./spacing-control";
import { AlignControls } from "./typography/align-controls";
import { TypographyControls } from "./typography/typography-controls";
import { UrlInput } from "./url-input";

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
			<div className="w-28">
				<ColorPicker value={value} onChange={onChange} />
			</div>
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
	| "borderRadius"
	| "borderTopLeftRadius"
	| "borderTopRightRadius"
	| "borderBottomRightRadius"
	| "borderBottomLeftRadius"
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
	showLists?: boolean;
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
	showLists = true,
}: TextSectionProps) {
	const { editor } = useCurrentEditor();
	const linkCss =
		useEditorState({
			editor,
			selector: ({ editor: ed }) => getActiveLinkCss(ed),
		}) ?? "";

	const resolvedGetStyle = (name: InspectorStyleProperty) => {
		if (
			name === "color" ||
			name === "fontSize" ||
			name === "lineHeight" ||
			name === "letterSpacing"
		) {
			return resolveInspectorTextStyle({
				prop: name,
				parentValue: getStyle(name),
				linkCss: linkCss || undefined,
			});
		}
		return getStyle(name);
	};

	const resolvedSetStyle = (
		name: InspectorStyleProperty,
		value: string | number,
	) => {
		if (
			isLinkActive &&
			editor &&
			(name === "color" ||
				name === "fontSize" ||
				name === "lineHeight" ||
				name === "letterSpacing")
		) {
			const next = setInlineCssProp(linkCss, name, value);
			editor
				.chain()
				.focus()
				.extendMarkRange("link")
				.updateAttributes("link", { style: next })
				.run();
			return;
		}
		setStyle(name, value);
	};

	const resolvedLinkColor = linkCss
		? String(
				resolveInspectorTextStyle({
					prop: "color",
					parentValue: linkColor,
					linkCss,
				}) ?? linkColor,
			)
		: linkColor;

	const filledLinkBackground = cssPaintedBackgroundValue(linkCss);
	const showLinkFill = isLinkActive && cssHasPaintedBackground(linkCss);

	const setLinkBackground = (color: string) => {
		if (!editor) return;
		const next = setInlineCssDeclaration(linkCss, "backgroundColor", color);
		editor
			.chain()
			.focus()
			.extendMarkRange("link")
			.updateAttributes("link", { style: next })
			.run();
	};

	return (
		<InspectorSection>
			<SectionHeader label="Text" />

			{showLinkFill && (
				<ColorRow
					label="Background"
					value={filledLinkBackground}
					onChange={setLinkBackground}
				/>
			)}
			<ColorRow
				label="Color"
				value={String(resolvedGetStyle("color") ?? "")}
				onChange={(v) => resolvedSetStyle("color", v)}
			/>
			<ScrubRow
				label="Font size"
				value={resolvedGetStyle("fontSize")}
				onChange={(v) => resolvedSetStyle("fontSize", v as number)}
				min={8}
				max={96}
				suffix="px"
			/>
			<ScrubRow
				label="Line height"
				value={resolvedGetStyle("lineHeight")}
				onChange={(v) => resolvedSetStyle("lineHeight", v as number)}
				min={80}
				max={300}
				suffix="%"
			/>
			<ScrubRow
				label="Tracking"
				value={resolvedGetStyle("letterSpacing")}
				onChange={(v) => resolvedSetStyle("letterSpacing", v as number)}
				min={-20}
				max={40}
				step={0.025}
				suffix="px"
			/>

			<TypographyControls
				marks={marks}
				toggleMark={toggleMark}
				alignment={alignment}
				setAlignment={setAlignment}
				showLists={showLists}
			/>

			{isLinkActive && (
				<ColorRow
					label="Link color"
					value={resolvedLinkColor}
					onChange={(v) => resolvedSetStyle("color", v)}
				/>
			)}
		</InspectorSection>
	);
}

/* ------------------------------------------------------------------ */
/* Root inspector                                                       */
/* ------------------------------------------------------------------ */
export const EmailInspector = () => {
	const { editor } = useCurrentEditor();
	if (!editor) return null;

	return (
		<Inspector.Root className="min-w-0 bg-transparent">
			{/* ── Breadcrumb ── */}
			<Breadcrumb />

			{/* ── All sections in one flat scroll container ── */}
			<div className="flex flex-col divide-y divide-stroke-soft-100 pb-6">
				{/* ── Text card (Handles both text selection and node selection) ── */}
				<Inspector.Text>
					{(textProps) => <TextSection {...textProps} />}
				</Inspector.Text>

				<Inspector.Node>
					{(nodeProps) => {
						const isTextRelated = [
							"paragraph",
							"heading",
							"button",
						].includes(nodeProps.nodeType);
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
								showLists={nodeProps.nodeType !== "button"}
							/>
						);
					}}
				</Inspector.Node>


				{/* ── Spacing + image + button node card ── */}
				<Inspector.Node>
					{({ nodeType, getStyle, batchSetStyle, getAttr, setAttr }) => {
						if (nodeType === "variable") return null;
						return (
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
						);
					}}
				</Inspector.Node>

				{/* ── Background card ── */}
				<Inspector.Node>
					{({ nodeType, getStyle, setStyle }) => {
						if (nodeType === "variable") return null;
						return (
							<InspectorSection>
								<SectionHeader label="Background" />
								<ColorRow
									label="Color"
									value={String(getStyle("backgroundColor") ?? "")}
									onChange={(v) => setStyle("backgroundColor", v)}
								/>
							</InspectorSection>
						);
					}}
				</Inspector.Node>

				{/* ── Border card ── */}
				<Inspector.Node>
					{({ nodeType, getStyle, setStyle, batchSetStyle }) => {
						if (nodeType === "variable") return null;
						return (
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
								<SpacingControl
									label="Radius"
									variant="corners"
									value={{
										top:
											(getStyle("borderTopLeftRadius") as number) ??
											(getStyle("borderRadius") as number) ??
											"",
										right:
											(getStyle("borderTopRightRadius") as number) ??
											(getStyle("borderRadius") as number) ??
											"",
										bottom:
											(getStyle("borderBottomRightRadius") as number) ??
											(getStyle("borderRadius") as number) ??
											"",
										left:
											(getStyle("borderBottomLeftRadius") as number) ??
											(getStyle("borderRadius") as number) ??
											"",
									}}
									onChange={({ top, right, bottom, left }) =>
										batchSetStyle([
											{ prop: "borderTopLeftRadius", value: top as number },
											{ prop: "borderTopRightRadius", value: right as number },
											{
												prop: "borderBottomRightRadius",
												value: bottom as number,
											},
											{ prop: "borderBottomLeftRadius", value: left as number },
										])
									}
								/>
								<ColorRow
									label="Color"
									value={String(getStyle("borderColor") ?? "")}
									onChange={(v) => setStyle("borderColor", v)}
								/>
							</InspectorSection>
						);
					}}
				</Inspector.Node>

				{/* ── Document card ── */}
				<Inspector.Document>
					{({ findStyleValue, setGlobalStyle, batchSetGlobalStyle }) => (
						<>
							<InspectorSection>
								<ColorRow
									label="Background"
									value={String(
										findStyleValue("body", "backgroundColor") ?? "",
									)}
									onChange={(v) => setGlobalStyle("body", "backgroundColor", v)}
								/>
								<SpacingControl
									label="Padding"
									value={{
										top:
											(findStyleValue("body", "paddingTop") as number) ??
											(findStyleValue("body", "padding") as number) ??
											"",
										right:
											(findStyleValue("body", "paddingRight") as number) ??
											(findStyleValue("body", "padding") as number) ??
											"",
										bottom:
											(findStyleValue("body", "paddingBottom") as number) ??
											(findStyleValue("body", "padding") as number) ??
											"",
										left:
											(findStyleValue("body", "paddingLeft") as number) ??
											(findStyleValue("body", "padding") as number) ??
											"",
									}}
									onChange={({ top, right, bottom, left }) =>
										batchSetGlobalStyle([
											{
												classReference: "body",
												property: "paddingTop",
												value: top as number,
											},
											{
												classReference: "body",
												property: "paddingRight",
												value: right as number,
											},
											{
												classReference: "body",
												property: "paddingBottom",
												value: bottom as number,
											},
											{
												classReference: "body",
												property: "paddingLeft",
												value: left as number,
											},
										])
									}
								/>
							</InspectorSection>

							<InspectorSection>
								<SectionHeader label="Body" />
								<div className="px-4 pt-1 pb-2">
									<AlignControls
										alignment={
											(findStyleValue("container", "align") as string) ||
											"center"
										}
										setAlignment={(align) =>
											setGlobalStyle("container", "align", align)
										}
									/>
								</div>
								<ColorRow
									label="Text"
									value={String(
										findStyleValue("body", "color") ??
											findStyleValue("container", "color") ??
											"",
									)}
									onChange={(v) => {
										setGlobalStyle("body", "color", v);
										setGlobalStyle("container", "color", v);
									}}
								/>
								<ColorRow
									label="Background"
									value={String(
										findStyleValue("container", "backgroundColor") ?? "",
									)}
									onChange={(v) =>
										setGlobalStyle("container", "backgroundColor", v)
									}
								/>
								<ScrubRow
									label="Width"
									value={findStyleValue("container", "width")}
									onChange={(v) => setGlobalStyle("container", "width", v)}
									min={200}
									max={1200}
									suffix="px"
								/>
								<ScrubRow
									label="Height"
									value={findStyleValue("container", "height")}
									onChange={(v) => setGlobalStyle("container", "height", v)}
									min={0}
									max={2000}
									suffix="px"
								/>
								<SpacingControl
									label="Padding"
									value={{
										top:
											(findStyleValue("container", "paddingTop") as number) ??
											(findStyleValue("container", "padding") as number) ??
											"",
										right:
											(findStyleValue("container", "paddingRight") as number) ??
											(findStyleValue("container", "padding") as number) ??
											"",
										bottom:
											(findStyleValue(
												"container",
												"paddingBottom",
											) as number) ??
											(findStyleValue("container", "padding") as number) ??
											"",
										left:
											(findStyleValue("container", "paddingLeft") as number) ??
											(findStyleValue("container", "padding") as number) ??
											"",
									}}
									onChange={({ top, right, bottom, left }) =>
										batchSetGlobalStyle([
											{
												classReference: "container",
												property: "paddingTop",
												value: top as number,
											},
											{
												classReference: "container",
												property: "paddingRight",
												value: right as number,
											},
											{
												classReference: "container",
												property: "paddingBottom",
												value: bottom as number,
											},
											{
												classReference: "container",
												property: "paddingLeft",
												value: left as number,
											},
										])
									}
								/>
								<SpacingControl
									label="Margin"
									value={{
										top:
											(findStyleValue("container", "margin") as number) ?? "",
										right:
											(findStyleValue("container", "margin") as number) ?? "",
										bottom:
											(findStyleValue("container", "margin") as number) ?? "",
										left:
											(findStyleValue("container", "margin") as number) ?? "",
									}}
									onChange={({ top }) =>
										setGlobalStyle("container", "margin", top as number)
									}
								/>
								<SpacingControl
									label="Corner radius"
									variant="corners"
									value={{
										top:
											(findStyleValue(
												"container",
												"borderTopLeftRadius",
											) as number) ??
											(findStyleValue("container", "borderRadius") as number) ??
											"",
										right:
											(findStyleValue(
												"container",
												"borderTopRightRadius",
											) as number) ??
											(findStyleValue("container", "borderRadius") as number) ??
											"",
										bottom:
											(findStyleValue(
												"container",
												"borderBottomRightRadius",
											) as number) ??
											(findStyleValue("container", "borderRadius") as number) ??
											"",
										left:
											(findStyleValue(
												"container",
												"borderBottomLeftRadius",
											) as number) ??
											(findStyleValue("container", "borderRadius") as number) ??
											"",
									}}
									onChange={({ top, right, bottom, left }) =>
										batchSetGlobalStyle([
											{
												classReference: "container",
												property: "borderTopLeftRadius",
												value: top as number,
											},
											{
												classReference: "container",
												property: "borderTopRightRadius",
												value: right as number,
											},
											{
												classReference: "container",
												property: "borderBottomRightRadius",
												value: bottom as number,
											},
											{
												classReference: "container",
												property: "borderBottomLeftRadius",
												value: left as number,
											},
										])
									}
								/>
								<SpacingControl
									label="Border"
									value={{
										top:
											(findStyleValue(
												"container",
												"borderTopWidth",
											) as number) ??
											(findStyleValue("container", "borderWidth") as number) ??
											"",
										right:
											(findStyleValue(
												"container",
												"borderRightWidth",
											) as number) ??
											(findStyleValue("container", "borderWidth") as number) ??
											"",
										bottom:
											(findStyleValue(
												"container",
												"borderBottomWidth",
											) as number) ??
											(findStyleValue("container", "borderWidth") as number) ??
											"",
										left:
											(findStyleValue(
												"container",
												"borderLeftWidth",
											) as number) ??
											(findStyleValue("container", "borderWidth") as number) ??
											"",
									}}
									onChange={({ top, right, bottom, left }) =>
										batchSetGlobalStyle([
											{
												classReference: "container",
												property: "borderTopWidth",
												value: top as number,
											},
											{
												classReference: "container",
												property: "borderRightWidth",
												value: right as number,
											},
											{
												classReference: "container",
												property: "borderBottomWidth",
												value: bottom as number,
											},
											{
												classReference: "container",
												property: "borderLeftWidth",
												value: left as number,
											},
										])
									}
								/>
								<ColorRow
									label="Border color"
									value={String(
										findStyleValue("container", "borderColor") ?? "",
									)}
									onChange={(v) =>
										setGlobalStyle("container", "borderColor", v)
									}
								/>
							</InspectorSection>
						</>
					)}
				</Inspector.Document>
			</div>
		</Inspector.Root>
	);
};
