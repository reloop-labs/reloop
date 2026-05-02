"use client";

import { Inspector } from "@react-email/editor/ui";
import * as Button from "@reloop/ui/button";
import * as CompactButton from "@reloop/ui/compact-button";
import * as DividerPrimitive from "@reloop/ui/divider";
import * as InputPrimitive from "@reloop/ui/input";
import { useCurrentEditor } from "@tiptap/react";
import { useState } from "react";
import Breadcrumb from "./breadcrumb";
import { ColorPicker } from "./color-picker";
import { ImageSrcControl } from "./image-src-control";
import { MarkButton } from "./mark-button";
import { SpacingControl } from "./spacing-control";
import { ToggleSwitch } from "./toggle-switch";
import { UrlInput } from "./url-input";

/* ------------------------------------------------------------------ */
/* Inline number input styled like the reference UI                     */
/* ------------------------------------------------------------------ */
function NumInput({
	value,
	onChange,
	placeholder,
	unit,
}: {
	value: string | number | undefined;
	onChange: (v: number | "") => void;
	placeholder?: string;
	unit?: string;
}) {
	return (
		<InputPrimitive.Root size="xsmall" className="flex-1">
			<InputPrimitive.Wrapper>
				<InputPrimitive.Input
					type="number"
					placeholder={placeholder ?? "0"}
					value={value ?? ""}
					onChange={(e) => {
						const raw = e.target.value;
						onChange(raw === "" ? "" : Number.parseFloat(raw));
					}}
				/>
				{unit && (
					<InputPrimitive.InlineAffix>{unit}</InputPrimitive.InlineAffix>
				)}
			</InputPrimitive.Wrapper>
		</InputPrimitive.Root>
	);
}

/* ------------------------------------------------------------------ */
/* Collapsible section header                                           */
/* ------------------------------------------------------------------ */
function SectionHeader({ label }: { label: string }) {
	return (
		<div className="flex w-full items-center justify-between py-2 font-semibold text-sm text-text-strong-950">
			<span>{label}</span>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/* Property row: label left, control right                             */
/* ------------------------------------------------------------------ */
function PropRow({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-between gap-3 py-1.5">
			<span className="shrink-0 text-text-sub-600 text-xs">{label}</span>
			<div className="flex min-w-0 flex-1 justify-end">{children}</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/* Color row: swatch + hex text field in one Input                     */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/* Node type pills shown at the top (Title / Subtitle / Heading / Body) */
/* ------------------------------------------------------------------ */
const NODE_TYPES = ["Title", "Subtitle", "Heading", "Body"] as const;
type NodeTypePill = (typeof NODE_TYPES)[number];

function NodeTypePills({
	active,
	onChange,
}: {
	active: NodeTypePill;
	onChange: (v: NodeTypePill) => void;
}) {
	return (
		<div className="flex flex-wrap gap-1.5">
			{NODE_TYPES.map((t) => (
				<button
					key={t}
					type="button"
					onClick={() => onChange(t)}
					className={`rounded-lg px-3 py-1 font-medium text-xs transition-colors ${
						active === t
							? "bg-bg-weak-50 text-text-strong-950 shadow-regular-xs"
							: "bg-transparent text-text-sub-600 hover:bg-bg-weak-50"
					}`}
				>
					{t}
				</button>
			))}
		</div>
	);
}

/* ------------------------------------------------------------------ */
/* Text panel                                                           */
/* ------------------------------------------------------------------ */
function TextPanel() {
	return (
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
				<div>
					<SectionHeader label="Text" />
					<div className="pb-3">
						{/* ── Color ── */}
						<ColorRow
							label="Color"
							value={String(getStyle("color") ?? "")}
							onChange={(v) => setStyle("color", v)}
						/>

						{/* ── Font size ── */}
						<PropRow label="Font size">
							<NumInput
								value={getStyle("fontSize")}
								onChange={(v) => setStyle("fontSize", v as number)}
								unit="px"
							/>
						</PropRow>

						{/* ── Line height ── */}
						<PropRow label="Line height">
							<NumInput
								value={getStyle("lineHeight")}
								onChange={(v) => setStyle("lineHeight", v as number)}
								unit="%"
							/>
						</PropRow>

						{/* ── Letter spacing ── */}
						<PropRow label="Letter spacing">
							<NumInput
								value={getStyle("letterSpacing")}
								onChange={(v) => setStyle("letterSpacing", v as number)}
								unit="px"
							/>
						</PropRow>

						{/* ── Format marks row ── */}
						<div className="mt-1 flex gap-1">
							{[
								{ label: "B", mark: "bold", cls: "font-bold" },
								{ label: "I", mark: "italic", cls: "italic" },
								{ label: "U", mark: "underline", cls: "underline" },
								{ label: "S", mark: "strike", cls: "line-through" },
							].map(({ label, mark, cls }) => (
								<MarkButton
									key={mark}
									label={label}
									active={marks[mark] ?? false}
									onClick={() => toggleMark(mark)}
									className={cls}
								/>
							))}
						</div>

						{/* ── Alignment rows ── */}
						<div className="mt-1 flex gap-1">
							{(["left", "center", "right"] as const).map((a) => (
								<button
									key={a}
									type="button"
									onClick={() => setAlignment(a)}
									className={`flex h-8 flex-1 items-center justify-center rounded-lg border text-xs transition-colors ${
										alignment === a
											? "border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950 shadow-regular-xs"
											: "border-transparent bg-transparent text-text-sub-600 hover:bg-bg-weak-50"
									}`}
								>
									{/* align icon */}
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
									>
										{a === "left" && (
											<>
												<path d="M3 6h18M3 12h12M3 18h15" />
											</>
										)}
										{a === "center" && (
											<>
												<path d="M3 6h18M6 12h12M4.5 18h15" />
											</>
										)}
										{a === "right" && (
											<>
												<path d="M3 6h18M9 12h12M6 18h15" />
											</>
										)}
									</svg>
								</button>
							))}
						</div>

						{/* ── Link colour ── */}
						{isLinkActive && (
							<ColorRow
								label="Link color"
								value={linkColor}
								onChange={setLinkColor}
							/>
						)}
					</div>
					<DividerPrimitive.Root variant="line" />
				</div>
			)}
		</Inspector.Text>
	);
}

/* ------------------------------------------------------------------ */
/* Node panel (spacing, image, button)                                  */
/* ------------------------------------------------------------------ */
function NodePanel() {
	return (
		<Inspector.Node>
			{({ nodeType, getStyle, setStyle, batchSetStyle, getAttr, setAttr }) => (
				<div>
					<SectionHeader label="Spacing" />
					<div className="pb-3">
						{/* ── Background ── */}
						<ColorRow
							label="Background"
							value={String(getStyle("backgroundColor") ?? "")}
							onChange={(v) => setStyle("backgroundColor", v)}
						/>

						{/* ── Padding: 2×2 grid ── */}
						<PropRow label="Padding">
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
						</PropRow>

						{/* ── Image ── */}
						{nodeType === "image" && (
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
						)}

						{/* ── Button ── */}
						{nodeType === "button" && (
							<PropRow label="Link">
								<UrlInput
									value={String(getAttr("href") ?? "")}
									onChange={(v) => setAttr("href", v)}
								/>
							</PropRow>
						)}
					</div>
					<DividerPrimitive.Root variant="line" />
				</div>
			)}
		</Inspector.Node>
	);
}

/* ------------------------------------------------------------------ */
/* Document panel                                                       */
/* ------------------------------------------------------------------ */
function DocumentPanel() {
	return (
		<Inspector.Document>
			{({ findStyleValue, setGlobalStyle }) => (
				<div>
					<SectionHeader label="Document" />
					<div className="pb-3">
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
						<PropRow label="Container radius">
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
					</div>
				</div>
			)}
		</Inspector.Document>
	);
}

/* ------------------------------------------------------------------ */
/* Root inspector — matches the reference image layout exactly          */
/* ------------------------------------------------------------------ */
export const EmailInspector = () => {
	const [activeNodeType, setActiveNodeType] = useState<NodeTypePill>("Body");
	const { editor } = useCurrentEditor();
	if (!editor) return null;
	return (
		<aside className="flex">
			<Inspector.Root>
				<Breadcrumb />
				<Inspector.Node>
					{({ nodeType }) => {
						const isTextRelated = ["text", "paragraph", "heading"].includes(
							nodeType,
						);
						if (!isTextRelated) return null;
						return (
							<div className="border-stroke-soft-200 border-b px-4 py-3">
								<NodeTypePills
									active={activeNodeType}
									onChange={setActiveNodeType}
								/>
							</div>
						);
					}}
				</Inspector.Node>

				{/* ── Sections ── */}
				<div className="flex flex-col px-4">
					<TextPanel />

					{/* Link section */}
					<Inspector.Node>
						{({ nodeType, getAttr, setAttr }) =>
							nodeType === "button" ? (
								<div>
									<SectionHeader label="Link" />
									<div className="pb-3">
										<PropRow label="URL">
											<UrlInput
												value={String(getAttr("href") ?? "")}
												onChange={(v) => setAttr("href", v)}
											/>
										</PropRow>
									</div>
									<DividerPrimitive.Root variant="line" />
								</div>
							) : null
						}
					</Inspector.Node>

					<NodePanel />

					{/* Background section */}
					<Inspector.Node>
						{({ getStyle, setStyle }) => (
							<div>
								<SectionHeader label="Background" />
								<div className="pb-3">
									<ColorRow
										label="Color"
										value={String(getStyle("backgroundColor") ?? "")}
										onChange={(v) => setStyle("backgroundColor", v)}
									/>
								</div>
								<DividerPrimitive.Root variant="line" />
							</div>
						)}
					</Inspector.Node>

					{/* Border section */}
					<Inspector.Node>
						{({ getStyle, setStyle }) => (
							<div>
								<SectionHeader label="Border" />
								<div className="pb-3">
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
								</div>
								<DividerPrimitive.Root variant="line" />
							</div>
						)}
					</Inspector.Node>

					<DocumentPanel />
				</div>
			</Inspector.Root>
		</aside>
	);
};
