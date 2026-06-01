"use client";

import { Inspector } from "@react-email/editor/ui";
import { useCurrentEditor } from "@tiptap/react";
import { useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
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
}: TextSectionProps) {
	return (
		<InspectorSection>
			<div className="px-4 pt-3 pb-2">
				<NodeTypePills />
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
	const { editor } = useCurrentEditor();
	if (!editor) return null;

	return (
		<Inspector.Root className="bg-bg-weak-50 dark:bg-[#0a0a0a]">
			{/* ── Breadcrumb ── */}
			<Breadcrumb />

			{/* ── All sections in one flat scroll container ── */}
			<div className="flex flex-col divide-y divide-stroke-soft-200 pb-6">
				{/* ── Text card (Handles both text selection and node selection) ── */}
				<Inspector.Text>
					{(textProps) => <TextSection {...textProps} />}
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
							/>
						);
					}}
				</Inspector.Node>

				{/* ── Variable Properties inspector card ── */}
				<Inspector.Node>
					{({ nodeType, getAttr }) => {
						if (nodeType !== "variable") return null;

						const name = (getAttr("name") as string) || "";
						const params = useParams<{ templateId: string }>();
						const templateId = params?.templateId;

						// Fetch variable meta config from DB to find type and default value
						const { data: templateData } = useSWR(
							templateId ? `/api/template/v1/${templateId}` : null,
							(url) => fetch(url, { credentials: "include" }).then((res) => res.json())
						);

						const variables = templateData?.variables ?? [];
						const matchedVar = variables.find((v: any) => {
							if (typeof v === "string") {
								return v.replace(/^\{\{|\}\}$/g, "").trim() === name;
							}
							return v?.name === name;
						});

						const varType = matchedVar?.type ?? "string";
						const defaultValue = matchedVar?.defaultValue ?? "";

						return (
							<InspectorSection>
								<SectionHeader label="Variable Properties" />
								
								<PropRow label="Name">
									<div className="text-xs font-semibold text-text-strong-950 dark:text-zinc-300 bg-bg-soft-150 dark:bg-zinc-900 rounded px-2 py-1 font-mono select-all truncate border border-stroke-soft-200 dark:border-stroke-soft-100/10">
										{name}
									</div>
								</PropRow>

								<PropRow label="Type">
									<div className="text-xs text-text-sub-600 dark:text-zinc-400 capitalize font-semibold bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 rounded px-2 py-1 inline-block">
										{varType}
									</div>
								</PropRow>

								<PropRow label="Default Value">
									<div className="text-xs text-text-sub-600 dark:text-zinc-400 italic">
										{defaultValue !== null && defaultValue !== "" ? (
											<code className="rounded bg-bg-soft-150 px-1 py-0.5 font-mono text-violet-600 dark:bg-zinc-800/80 dark:text-violet-400 font-semibold">
												"{defaultValue}"
											</code>
										) : (
											<span className="text-text-disabled-300 dark:text-zinc-500 font-medium">
												No default value set
											</span>
										)}
									</div>
								</PropRow>
							</InspectorSection>
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
						</InspectorSection>
					)}
				</Inspector.Document>
			</div>
		</Inspector.Root>
	);
};
