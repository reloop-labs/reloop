"use client";

import { Inspector } from "@react-email/editor/ui";
import { useCurrentEditor, useEditorState } from "@tiptap/react";
import type React from "react";
import {
	cssHasPaintedBackground,
	cssPaintedBackgroundValue,
} from "../preserve-email-link-underlines";
import {
	applySelectionFontColor,
	applyTextAlignment,
	displayLineHeightPercent,
	fontSizePxFromRaw,
	getActiveLinkCss,
	getAncestorInlineStyleProp,
	getComputedSelectionColor,
	getResolvedAlignment,
	getSelectionFontColor,
	getSelectionMarkColor,
	getThemeColorFallback,
	type InspectorTextStyleProp,
	normalizeColorToHex,
	numericPxFromCss,
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
import { SelectField } from "./select-field";
import { SpacingControl } from "./spacing-control";
import { ToggleSwitch } from "./toggle-switch";
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

type InspectorStyleProperty = any;

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
	const selectionColor =
		useEditorState({
			editor,
			selector: ({ editor: ed }) =>
				getSelectionFontColor(ed) || getSelectionMarkColor(ed),
		}) ?? "";
	const resolvedAlignment =
		useEditorState({
			editor,
			selector: ({ editor: ed }) => getResolvedAlignment(ed, alignment),
		}) ?? alignment;

	const handleSetAlignment = (align: string) => {
		if (editor && applyTextAlignment(editor, align)) {
			return;
		}
		setAlignment(align);
	};

	/**
	 * Raw effective value: selection marks → link mark → parent block →
	 * ancestor chain → theme globals → rendered canvas style.
	 */
	const rawEffectiveStyle = (
		name: InspectorStyleProperty,
	): string | number | undefined => {
		if (name === "color" && selectionColor) return selectionColor;
		const direct = resolveInspectorTextStyle({
			prop: name as InspectorTextStyleProp,
			parentValue: getStyle(name),
			linkCss: linkCss || undefined,
		});
		if (direct !== undefined && direct !== "") return direct;
		const inherited = getAncestorInlineStyleProp(editor, name);
		if (inherited !== undefined && inherited !== "") return inherited;
		if (name === "color") {
			const themed = getThemeColorFallback(editor);
			if (themed) return themed;
			const computed = getComputedSelectionColor(editor);
			if (computed) return computed;
		}
		return direct;
	};

	const resolvedGetStyle = (name: InspectorStyleProperty) => {
		if (name === "color" && selectionColor)
			return normalizeColorToHex(selectionColor);
		if (
			name === "color" ||
			name === "fontSize" ||
			name === "lineHeight" ||
			name === "letterSpacing"
		) {
			const raw = rawEffectiveStyle(name);
			if (raw === undefined || raw === "") return raw;
			if (name === "color") return normalizeColorToHex(raw);
			if (name === "lineHeight") {
				const fontSizePx = fontSizePxFromRaw(rawEffectiveStyle("fontSize"));
				return displayLineHeightPercent(raw, fontSizePx);
			}
			return raw;
		}
		return getStyle(name);
	};

	const resolvedSetStyle = (
		name: InspectorStyleProperty,
		value: string | number,
	) => {
		const normalizedValue =
			name === "color"
				? String(value).trim() === ""
					? ""
					: normalizeColorToHex(value) || String(value)
				: name === "letterSpacing" && typeof value === "number"
					? `${value}px`
					: value;

		if (
			name === "color" &&
			editor &&
			applySelectionFontColor(editor, String(normalizedValue))
		) {
			return;
		}
		if (
			isLinkActive &&
			editor &&
			(name === "color" ||
				name === "fontSize" ||
				name === "lineHeight" ||
				name === "letterSpacing")
		) {
			const next = setInlineCssProp(linkCss, name, normalizedValue);
			editor
				.chain()
				.focus()
				.extendMarkRange("link")
				.updateAttributes("link", { style: next })
				.run();
			return;
		}
		setStyle(name, normalizedValue);
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
				alignment={resolvedAlignment}
				setAlignment={handleSetAlignment}
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

const TEXT_INSPECTOR_NODES = new Set([
	"paragraph",
	"heading",
	"button",
	"blockquote",
	"listItem",
	"tableCell",
	"tableHeader",
	"section",
	"div",
	"footer",
]);

/** Parse "16", "16px", 16 → 16. Returns "" when not a finite number. */
function toPxNumber(value: string | number | undefined): number | "" {
	if (typeof value === "number") return Number.isFinite(value) ? value : "";
	if (typeof value !== "string") return "";
	const n = Number.parseFloat(value.replace(/[^\d.-]/g, ""));
	return Number.isFinite(n) ? n : "";
}

function useFilledLinkBox() {
	const { editor } = useCurrentEditor();
	const linkCss =
		useEditorState({
			editor,
			selector: ({ editor: ed }) => getActiveLinkCss(ed),
		}) ?? "";
	const filled = Boolean(
		editor?.isActive("link") && cssHasPaintedBackground(linkCss),
	);
	const readPx = (
		prop: string,
		fallback: string | number | undefined,
	): number | "" => {
		if (filled) {
			const fromLink = numericPxFromCss(linkCss, prop);
			if (fromLink !== "") return fromLink;
		}
		return toPxNumber(fallback);
	};
	const write = (changes: Array<{ prop: string; value: string | number }>) => {
		if (!editor) return;
		let next = linkCss;
		for (const { prop, value } of changes) {
			next = setInlineCssDeclaration(
				next,
				prop,
				typeof value === "number" ? `${value}px` : String(value),
			);
		}
		editor
			.chain()
			.focus()
			.extendMarkRange("link")
			.updateAttributes("link", { style: next })
			.run();
	};
	return { filled, linkCss, readPx, write };
}

function InspectorNodeStyles({
	nodeType,
	getStyle,
	setStyle,
	batchSetStyle,
	getAttr,
	setAttr,
	nodePos,
}: {
	nodeType: string;
	getStyle: (name: InspectorStyleProperty) => string | number | undefined;
	setStyle: (name: InspectorStyleProperty, value: string | number) => void;
	batchSetStyle: (
		changes: Array<{ prop: InspectorStyleProperty; value: string | number }>,
	) => void;
	getAttr: (name: string) => unknown;
	setAttr: (name: string, value: unknown) => void;
	nodePos?: { pos: number; inside?: number };
}) {
	const box = useFilledLinkBox();
	const { editor: nodeEditor } = useCurrentEditor();
	if (nodeType === "variable") return null;

	if (nodeType === "horizontalRule") {
		return (
			<InspectorSection>
				<SectionHeader label="Divider" />
				<ScrubRow
					label="Thickness"
					value={toPxNumber(
						(getStyle("borderTopWidth") ?? getStyle("borderWidth") ?? 1) as
							| string
							| number,
					)}
					onChange={(v) => {
						batchSetStyle([
							{ prop: "borderTopWidth", value: v as number },
							{
								prop: "borderTopStyle",
								value: (getStyle("borderTopStyle") as string) || "solid",
							},
						]);
					}}
					min={1}
					max={20}
					suffix="px"
				/>
				<PropRow label="Style">
					<div className="w-28">
						<SelectField
							value={String(getStyle("borderTopStyle") ?? "solid")}
							onChange={(v) => setStyle("borderTopStyle", v)}
							options={[
								{ label: "Solid", value: "solid" },
								{ label: "Dashed", value: "dashed" },
								{ label: "Dotted", value: "dotted" },
							]}
						/>
					</div>
				</PropRow>
				<ColorRow
					label="Color"
					value={String(
						getStyle("borderTopColor") ?? getStyle("borderColor") ?? "#e5e7eb",
					)}
					onChange={(v) => {
						const hex = v.trim() === "" ? "" : normalizeColorToHex(v) || v;
						batchSetStyle([
							{ prop: "borderTopColor", value: hex },
							{ prop: "borderColor", value: hex },
						]);
					}}
				/>
				<SectionHeader label="Spacing" />
				<ScrubRow
					label="Top margin"
					value={toPxNumber(
						(getStyle("marginTop") ?? getStyle("margin") ?? 16) as
							| string
							| number,
					)}
					onChange={(v) => setStyle("marginTop", v as number)}
					min={0}
					max={100}
					suffix="px"
				/>
				<ScrubRow
					label="Bottom margin"
					value={toPxNumber(
						(getStyle("marginBottom") ?? getStyle("margin") ?? 16) as
							| string
							| number,
					)}
					onChange={(v) => setStyle("marginBottom", v as number)}
					min={0}
					max={100}
					suffix="px"
				/>
			</InspectorSection>
		);
	}

	const pad = (prop: InspectorStyleProperty) =>
		box.readPx(prop, getStyle(prop));
	const applyBox = (
		changes: Array<{ prop: InspectorStyleProperty; value: string | number }>,
	) => {
		if (box.filled) {
			box.write(changes);
			return;
		}
		batchSetStyle(changes);
	};

	return (
		<>
			{(nodeType === "tableCell" || nodeType === "tableHeader") && (
				<InspectorSection>
					<SectionHeader label="Cell Layout" />
					<PropRow label="Vertical align">
						<div className="w-32">
							<SelectField
								value={String(
									getStyle("verticalAlign") ?? getAttr("valign") ?? "top",
								)}
								onChange={(v) => {
									setStyle("verticalAlign", v);
									setAttr("valign", v);
								}}
								options={[
									{ label: "Top", value: "top" },
									{ label: "Middle", value: "middle" },
									{ label: "Bottom", value: "bottom" },
								]}
							/>
						</div>
					</PropRow>
				</InspectorSection>
			)}
			{nodeType === "image" &&
				(() => {
					const selectedImageNode =
						nodeEditor && nodePos?.pos !== undefined
							? nodeEditor.state.doc.nodeAt(nodePos.pos)
							: null;

					const imageDomEl = (() => {
						if (!nodeEditor || nodePos?.pos === undefined) return null;
						try {
							const domNode = nodeEditor.view.nodeDOM(nodePos.pos);
							return domNode instanceof HTMLImageElement
								? domNode
								: ((domNode as HTMLElement | null)?.querySelector("img") ??
										null);
						} catch {
							return null;
						}
					})();

					const rawNodeStyle = String(
						selectedImageNode?.attrs?.style || getStyle("style" as any) || "",
					);
					const styleWidth =
						numericPxFromCss(rawNodeStyle, "width") ||
						toPxNumber(getStyle("width" as any));
					const styleHeight =
						numericPxFromCss(rawNodeStyle, "height") ||
						toPxNumber(getStyle("height" as any));

					const attrWidth = toPxNumber(
						(selectedImageNode?.attrs?.width ?? getAttr("width")) as
							| string
							| number,
					);
					const attrHeight = toPxNumber(
						(selectedImageNode?.attrs?.height ?? getAttr("height")) as
							| string
							| number,
					);

					const domWidth = imageDomEl?.getBoundingClientRect().width
						? Math.round(imageDomEl.getBoundingClientRect().width)
						: imageDomEl?.naturalWidth || "";
					const domHeight = imageDomEl?.getBoundingClientRect().height
						? Math.round(imageDomEl.getBoundingClientRect().height)
						: imageDomEl?.naturalHeight || "";

					const resolvedImageWidth =
						(typeof attrWidth === "number" && attrWidth > 0 ? attrWidth : "") ||
						(typeof styleWidth === "number" && styleWidth > 0
							? styleWidth
							: "") ||
						(typeof domWidth === "number" && domWidth > 0 ? domWidth : "");

					const resolvedImageHeight =
						(typeof attrHeight === "number" && attrHeight > 0
							? attrHeight
							: "") ||
						(typeof styleHeight === "number" && styleHeight > 0
							? styleHeight
							: "") ||
						(typeof domHeight === "number" && domHeight > 0 ? domHeight : "");

					return (
						<InspectorSection>
							<SectionHeader label="Image" />
							<div className="px-4 pb-3">
								<ImageSrcControl
									value={{
										src: String(
											selectedImageNode?.attrs?.src ?? getAttr("src") ?? "",
										),
										alt: String(
											selectedImageNode?.attrs?.alt ?? getAttr("alt") ?? "",
										),
										href: String(
											selectedImageNode?.attrs?.href ?? getAttr("href") ?? "",
										),
										width: resolvedImageWidth,
										height: resolvedImageHeight,
										align: String(
											selectedImageNode?.attrs?.alignment ??
												selectedImageNode?.attrs?.align ??
												getAttr("alignment") ??
												getAttr("align") ??
												"center",
										),
									}}
									onChange={({ src, alt, href, width, height, align }) => {
										setAttr("src", src);
										setAttr("alt", alt);
										if (href !== undefined) setAttr("href", href);

										const targetWidth = width === "" ? "auto" : width;
										const targetHeight = height === "" ? "auto" : height;
										setAttr("width", targetWidth);
										setAttr("height", targetHeight);

										const styleChanges: Array<{
											prop: InspectorStyleProperty;
											value: string | number;
										}> = [];

										if (typeof width === "number" && width > 0) {
											styleChanges.push({ prop: "width", value: `${width}px` });
											styleChanges.push({ prop: "maxWidth", value: "100%" });
										} else {
											styleChanges.push({ prop: "width", value: "auto" });
										}

										if (typeof height === "number" && height > 0) {
											styleChanges.push({
												prop: "height",
												value: `${height}px`,
											});
										} else {
											styleChanges.push({ prop: "height", value: "auto" });
										}

										if (align) {
											setAttr("alignment", align);
											setAttr("align", align);
											if (align === "center") {
												styleChanges.push({ prop: "display", value: "block" });
												styleChanges.push({
													prop: "marginLeft",
													value: "auto",
												});
												styleChanges.push({
													prop: "marginRight",
													value: "auto",
												});
											} else if (align === "right") {
												styleChanges.push({ prop: "display", value: "block" });
												styleChanges.push({
													prop: "marginLeft",
													value: "auto",
												});
												styleChanges.push({ prop: "marginRight", value: 0 });
											} else {
												styleChanges.push({ prop: "display", value: "block" });
												styleChanges.push({ prop: "marginLeft", value: 0 });
												styleChanges.push({
													prop: "marginRight",
													value: "auto",
												});
											}
										}

										batchSetStyle(styleChanges);

										if (nodeEditor && nodePos?.pos !== undefined) {
											const currentNode = nodeEditor.state.doc.nodeAt(
												nodePos.pos,
											);
											if (currentNode) {
												let nextStyle = String(currentNode.attrs.style || "");
												if (typeof width === "number" && width > 0) {
													nextStyle = setInlineCssDeclaration(
														nextStyle,
														"width",
														`${width}px`,
													);
													nextStyle = setInlineCssDeclaration(
														nextStyle,
														"maxWidth",
														"100%",
													);
												} else {
													nextStyle = setInlineCssDeclaration(
														nextStyle,
														"width",
														"auto",
													);
												}
												if (typeof height === "number" && height > 0) {
													nextStyle = setInlineCssDeclaration(
														nextStyle,
														"height",
														`${height}px`,
													);
												} else {
													nextStyle = setInlineCssDeclaration(
														nextStyle,
														"height",
														"auto",
													);
												}
												if (align) {
													nextStyle = setInlineCssDeclaration(
														nextStyle,
														"display",
														"block",
													);
													if (align === "center") {
														nextStyle = setInlineCssDeclaration(
															nextStyle,
															"marginLeft",
															"auto",
														);
														nextStyle = setInlineCssDeclaration(
															nextStyle,
															"marginRight",
															"auto",
														);
													} else if (align === "right") {
														nextStyle = setInlineCssDeclaration(
															nextStyle,
															"marginLeft",
															"auto",
														);
														nextStyle = setInlineCssDeclaration(
															nextStyle,
															"marginRight",
															"auto",
														);
													} else {
														nextStyle = setInlineCssDeclaration(
															nextStyle,
															"marginLeft",
															"0px",
														);
														nextStyle = setInlineCssDeclaration(
															nextStyle,
															"marginRight",
															"auto",
														);
													}
												}

												nodeEditor
													.chain()
													.setNodeSelection(nodePos.pos)
													.updateAttributes("image", {
														src,
														alt,
														href:
															href !== undefined
																? href
																: currentNode.attrs.href,
														width: targetWidth,
														height: targetHeight,
														alignment:
															align || currentNode.attrs.alignment || "center",
														align: align || currentNode.attrs.align || "center",
														style: nextStyle,
													})
													.run();
											}
										}
									}}
								/>
							</div>
						</InspectorSection>
					);
				})()}
			{nodeType !== "image" && (
				<InspectorSection>
					<SectionHeader label="Spacing" />
					<SpacingControl
						value={{
							top: pad("paddingTop"),
							right: pad("paddingRight"),
							bottom: pad("paddingBottom"),
							left: pad("paddingLeft"),
						}}
						onChange={({ top, right, bottom, left }) =>
							applyBox([
								{ prop: "paddingTop", value: top as number },
								{ prop: "paddingRight", value: right as number },
								{ prop: "paddingBottom", value: bottom as number },
								{ prop: "paddingLeft", value: left as number },
							])
						}
					/>
				</InspectorSection>
			)}
			{nodeType === "button" && (
				<InspectorSection>
					<PropRow label="Link">
						<UrlInput
							value={String(getAttr("href") ?? "")}
							onChange={(v) => setAttr("href", v)}
						/>
					</PropRow>
					<PropRow label="Full width">
						<ToggleSwitch
							checked={String(getStyle("width") ?? "").includes("100%")}
							onChange={(checked) => {
								if (checked) {
									batchSetStyle([
										{ prop: "width", value: "100%" },
										{ prop: "display", value: "block" },
									]);
									setAttr("alignment", "center");
									setAttr("align", "center");
								} else {
									batchSetStyle([
										{ prop: "width", value: "auto" },
										{ prop: "display", value: "inline-block" },
									]);
								}
							}}
						/>
					</PropRow>
					<div className="flex flex-col gap-1 px-4 py-1.5">
						<span className="font-normal text-text-sub-600 text-xs dark:text-text-soft-400">
							Alignment
						</span>
						<AlignControls
							alignment={String(
								getAttr("alignment") ?? getAttr("align") ?? "left",
							)}
							setAlignment={(align) => {
								setAttr("alignment", align);
								setAttr("align", align);
							}}
						/>
					</div>
				</InspectorSection>
			)}
			<InspectorSection>
				<SectionHeader label="Background" />
				<ColorRow
					label="Color"
					value={
						box.filled
							? cssPaintedBackgroundValue(box.linkCss)
							: normalizeColorToHex(
									(String(getStyle("backgroundColor") ?? "") ||
										getAncestorInlineStyleProp(nodeEditor, "backgroundColor") ||
										"") as string,
								)
					}
					onChange={(v) => {
						const hex = v.trim() === "" ? "" : normalizeColorToHex(v) || v;
						if (box.filled)
							box.write([{ prop: "backgroundColor", value: hex }]);
						else setStyle("backgroundColor", hex);
					}}
				/>
			</InspectorSection>
			<InspectorSection>
				<SectionHeader label="Border" />
				<SpacingControl
					label="Border"
					value={{
						top: box.readPx(
							"borderTopWidth",
							getStyle("borderTopWidth") ?? getStyle("borderWidth"),
						),
						right: box.readPx(
							"borderRightWidth",
							getStyle("borderRightWidth") ?? getStyle("borderWidth"),
						),
						bottom: box.readPx(
							"borderBottomWidth",
							getStyle("borderBottomWidth") ?? getStyle("borderWidth"),
						),
						left: box.readPx(
							"borderLeftWidth",
							getStyle("borderLeftWidth") ?? getStyle("borderWidth"),
						),
					}}
					onChange={({ top, right, bottom, left }) =>
						applyBox([
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
						top: box.readPx(
							"borderTopLeftRadius",
							getStyle("borderTopLeftRadius") ?? getStyle("borderRadius"),
						),
						right: box.readPx(
							"borderTopRightRadius",
							getStyle("borderTopRightRadius") ?? getStyle("borderRadius"),
						),
						bottom: box.readPx(
							"borderBottomRightRadius",
							getStyle("borderBottomRightRadius") ?? getStyle("borderRadius"),
						),
						left: box.readPx(
							"borderBottomLeftRadius",
							getStyle("borderBottomLeftRadius") ?? getStyle("borderRadius"),
						),
					}}
					onChange={({ top, right, bottom, left }) =>
						applyBox([
							{ prop: "borderTopLeftRadius", value: top as number },
							{ prop: "borderTopRightRadius", value: right as number },
							{ prop: "borderBottomRightRadius", value: bottom as number },
							{ prop: "borderBottomLeftRadius", value: left as number },
						])
					}
				/>
				<ColorRow
					label="Color"
					value={
						box.filled
							? String(inlineColorFromCss(box.linkCss, "borderColor"))
							: String(
									getStyle("borderColor") ??
										getStyle("borderTopColor") ??
										getStyle("borderRightColor") ??
										getStyle("borderBottomColor") ??
										getStyle("borderLeftColor") ??
										"",
								)
					}
					onChange={(v) => {
						const hex = v.trim() === "" ? "" : normalizeColorToHex(v) || v;
						if (box.filled) box.write([{ prop: "borderColor", value: hex }]);
						else setStyle("borderColor", hex);
					}}
				/>
			</InspectorSection>
		</>
	);
}

function inlineColorFromCss(cssText: string, camelProp: string): string {
	if (typeof document === "undefined" || !cssText.trim()) return "";
	const scratch = document.createElement("div");
	scratch.style.cssText = cssText;
	if (camelProp === "borderColor") return scratch.style.borderColor;
	return scratch.style.getPropertyValue(
		camelProp.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`),
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
						const isTextRelated = TEXT_INSPECTOR_NODES.has(nodeProps.nodeType);
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

						const alignment =
							((nodeProps.getStyle as any)("textAlign") as string) ||
							(nodeProps.getAttr("alignment") as string) ||
							(nodeProps.getAttr("align") as string) ||
							"left";
						const setAlignment = (align: string) => {
							if (editor && applyTextAlignment(editor, align)) {
								return;
							}
							nodeProps.setAttr("alignment", align);
							nodeProps.setAttr("align", align);
							(nodeProps.setStyle as any)("textAlign", align);
						};

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

				<Inspector.Node>
					{(nodeProps) => (
						<InspectorNodeStyles
							key={`${nodeProps.nodeType}-${nodeProps.nodePos.pos}`}
							{...nodeProps}
						/>
					)}
				</Inspector.Node>

				{/* ── Document card ── */}
				<Inspector.Document>
					{({ findStyleValue, setGlobalStyle, batchSetGlobalStyle }) => {
						const setColorGlobal = (
							classReference: "body" | "container",
							property: "backgroundColor" | "color" | "borderColor",
							v: string,
						) =>
							setGlobalStyle(
								classReference,
								property,
								(v.trim() === "" ? v : normalizeColorToHex(v) || v) as never,
							);

						return (
							<>
								<InspectorSection>
									<ColorRow
										label="Background"
										value={String(
											findStyleValue("body", "backgroundColor") ?? "",
										)}
										onChange={(v) =>
											setColorGlobal("body", "backgroundColor", v)
										}
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
											setColorGlobal("body", "color", v);
											setColorGlobal("container", "color", v);
										}}
									/>
									<ColorRow
										label="Background"
										value={String(
											findStyleValue("container", "backgroundColor") ?? "",
										)}
										onChange={(v) =>
											setColorGlobal("container", "backgroundColor", v)
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
												(findStyleValue(
													"container",
													"paddingRight",
												) as number) ??
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
												(findStyleValue(
													"container",
													"paddingLeft",
												) as number) ??
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
												(findStyleValue(
													"container",
													"borderRadius",
												) as number) ??
												"",
											right:
												(findStyleValue(
													"container",
													"borderTopRightRadius",
												) as number) ??
												(findStyleValue(
													"container",
													"borderRadius",
												) as number) ??
												"",
											bottom:
												(findStyleValue(
													"container",
													"borderBottomRightRadius",
												) as number) ??
												(findStyleValue(
													"container",
													"borderRadius",
												) as number) ??
												"",
											left:
												(findStyleValue(
													"container",
													"borderBottomLeftRadius",
												) as number) ??
												(findStyleValue(
													"container",
													"borderRadius",
												) as number) ??
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
												(findStyleValue(
													"container",
													"borderWidth",
												) as number) ??
												"",
											right:
												(findStyleValue(
													"container",
													"borderRightWidth",
												) as number) ??
												(findStyleValue(
													"container",
													"borderWidth",
												) as number) ??
												"",
											bottom:
												(findStyleValue(
													"container",
													"borderBottomWidth",
												) as number) ??
												(findStyleValue(
													"container",
													"borderWidth",
												) as number) ??
												"",
											left:
												(findStyleValue(
													"container",
													"borderLeftWidth",
												) as number) ??
												(findStyleValue(
													"container",
													"borderWidth",
												) as number) ??
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
											setColorGlobal("container", "borderColor", v)
										}
									/>
								</InspectorSection>
							</>
						);
					}}
				</Inspector.Document>
			</div>
		</Inspector.Root>
	);
};
