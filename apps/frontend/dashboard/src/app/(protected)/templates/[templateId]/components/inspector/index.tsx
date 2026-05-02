"use client";

import { Inspector } from "@react-email/editor/ui";
import { useCurrentEditor } from "@tiptap/react";
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	Bold,
	FileText,
	Italic,
	Move,
	Paintbrush,
	Square,
	Strikethrough,
	Type,
	Underline,
} from "lucide-react";
import { useState } from "react";
import Breadcrumb from "./breadcrumb";
import { ColorPicker } from "./color-picker";
import { ImageSrcControl } from "./image-src-control";
import { MarkButton } from "./mark-button";
import { NumInput } from "./num-input";
import { PropRow } from "./prop-row";
import { SectionHeader } from "./section-header";
import { SpacingControl } from "./spacing-control";
import { type NodeTypePill, NodeTypePills } from "./node-type-pills";
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

const ALIGN_OPTIONS = [
	{ value: "left" as const, icon: AlignLeft, label: "Align left" },
	{ value: "center" as const, icon: AlignCenter, label: "Align center" },
	{ value: "right" as const, icon: AlignRight, label: "Align right" },
];

const MARK_OPTIONS = [
	{ mark: "bold", icon: Bold, label: "Bold" },
	{ mark: "italic", icon: Italic, label: "Italic" },
	{ mark: "underline", icon: Underline, label: "Underline" },
	{ mark: "strike", icon: Strikethrough, label: "Strikethrough" },
];

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
			<div className="flex flex-col divide-y divide-stroke-soft-200 px-4 pb-6">
				{/* ── Text card ── */}
				<Inspector.Text>
					{({
						marks,
						toggleMark,
						alignment,
						setAlignment,
						linkColor,
						setLinkColor,
						isLinkActive,
						getStyle,
						setStyle,
					}) => (
						<InspectorSection>
							{/* Node-type segmented pills — only for text nodes */}
							<Inspector.Node>
								{({ nodeType }) => {
									const isTextRelated = ["text", "paragraph", "heading"].includes(
										nodeType,
									);
									if (!isTextRelated) return null;
									return (
										<div className="px-4 pt-3 pb-2">
											<NodeTypePills
												active={activeNodeType}
												onChange={setActiveNodeType}
											/>
										</div>
									);
								}}
							</Inspector.Node>

							<SectionHeader label="Text" icon={Type} />

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

							{/* Marks + alignment row */}
							<div className="flex items-center gap-2 px-4 pb-3 pt-1">
								<div className="flex items-center gap-1">
									{MARK_OPTIONS.map(({ mark, icon, label }) => (
										<MarkButton
											key={mark}
											icon={icon}
											label={label}
											active={marks[mark] ?? false}
											onClick={() => toggleMark(mark)}
										/>
									))}
								</div>
								<div className="h-6 w-px bg-stroke-soft-200" />
								<div className="flex flex-1 items-center gap-1">
									{ALIGN_OPTIONS.map(({ value: a, icon: Icon, label }) => (
										<button
											key={a}
											type="button"
											title={label}
											aria-label={label}
											aria-pressed={alignment === a}
											onClick={() => setAlignment(a)}
											className={`flex h-8 flex-1 cursor-pointer items-center justify-center rounded-lg border transition-all duration-150 ${
												alignment === a
													? "border-stroke-soft-200 bg-bg-strong-950 text-white"
													: "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950"
											}`}
										>
											<Icon className="h-3.5 w-3.5" strokeWidth={2} />
										</button>
									))}
								</div>
							</div>

							{isLinkActive && (
								<ColorRow
									label="Link color"
									value={linkColor}
									onChange={setLinkColor}
								/>
							)}
						</InspectorSection>
					)}
				</Inspector.Text>

				{/* ── Spacing + image + button node card ── */}
				<Inspector.Node>
					{({ nodeType, getStyle, setStyle, batchSetStyle, getAttr, setAttr }) => (
						<InspectorSection>
							<SectionHeader label="Spacing" icon={Move} />

							<ColorRow
								label="Background"
								value={String(getStyle("backgroundColor") ?? "")}
								onChange={(v) => setStyle("backgroundColor", v)}
							/>

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
							<SectionHeader label="Background" icon={Paintbrush} />
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
					{({ getStyle, setStyle }) => (
						<InspectorSection>
							<SectionHeader label="Border" icon={Square} />
							<ColorRow
								label="Color"
								value={String(getStyle("borderColor") ?? "")}
								onChange={(v) => setStyle("borderColor", v)}
							/>
							<PropRow label="Width">
								<NumInput
									value={getStyle("borderWidth")}
									onChange={(v) => setStyle("borderWidth", v as number)}
									unit="px"
								/>
							</PropRow>
							<div className="h-2" />
						</InspectorSection>
					)}
				</Inspector.Node>

				{/* ── Document card ── */}
				<Inspector.Document>
					{({ findStyleValue, setGlobalStyle }) => (
						<InspectorSection>
							<SectionHeader label="Document" icon={FileText} />
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
									onChange={(v) => setGlobalStyle("container", "borderRadius", v)}
									unit="px"
								/>
							</PropRow>
							<ColorRow
								label="Container bg"
								value={String(
									findStyleValue("container", "backgroundColor") ?? "",
								)}
								onChange={(v) => setGlobalStyle("container", "backgroundColor", v)}
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
