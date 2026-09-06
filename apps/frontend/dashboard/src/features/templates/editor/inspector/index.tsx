"use client";

import { Inspector } from "@react-email/editor/ui";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { useCurrentEditor, useEditorState } from "@tiptap/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	useAllPropertiesQuery,
	useInvalidateContacts,
} from "#/features/contacts/hooks/use-contacts-query";
import { useSWR } from "#/features/templates/editor/hooks/use-swr-compat";
import { useTemplateId } from "#/features/templates/editor/hooks/use-template-id";
import {
	formatTemplateVariable,
	mapTemplateVariables,
	normalizeTemplateVariableName,
} from "#/features/templates/lib/template-variables";
import { DeleteTemplateVariableModal } from "../components/panels/variables/delete-variable-modal";
import {
	cssHasPaintedBackground,
	cssPaintedBackgroundValue,
} from "../utils/preserve-email-link-underlines";
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
	normalizeColorToHex,
	normalizeFontWeightDisplay,
	numericPxFromCss,
	resolveInspectorTextStyle,
	setInlineCssDeclaration,
	setInlineCssProp,
} from "../utils/resolve-inspector-text-style";
import Breadcrumb from "./breadcrumb";
import { ColorPicker } from "./color-picker";
import { FontFamilySelect } from "./font-family-select";
import { FontWeightSelect } from "./font-weight-select";
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

const TYPE_OPTIONS = [
	{
		value: "string" as const,
		label: "String",
		description: "Plain text, name, email, etc.",
		icon: "type",
		color: "text-blue-500",
		badgeColor: "blue" as const,
	},
	{
		value: "number" as const,
		label: "Number",
		description: "Integers, decimals, prices, etc.",
		icon: "hash",
		color: "text-purple-500",
		badgeColor: "purple" as const,
	},
];

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
			<div className="w-28">
				<ColorPicker value={value} onChange={onChange} />
			</div>
		</PropRow>
	);
}

function VariableInspectorCard({ name }: { name: string }) {
	const templateId = useTemplateId();
	const { editor } = useCurrentEditor();
	const invalidateContacts = useInvalidateContacts();

	// Fetch variable meta config from DB if in template mode
	const { data: templateData, mutate } = useSWR(
		templateId ? `/api/template/v1/${templateId}` : null,
		(url) => fetch(url, { credentials: "include" }).then((res) => res.json()),
	);

	// Fetch contact properties if in campaign / no-template mode
	const { data: propertiesData } = useAllPropertiesQuery(!templateId);

	const templateVariables = mapTemplateVariables(templateData?.variables);
	const contactProperties = propertiesData?.properties ?? [];

	const normalizedTarget = normalizeTemplateVariableName(name);

	const matchedVar = templateId
		? templateVariables.find(
				(v) => normalizeTemplateVariableName(v.name) === normalizedTarget,
			)
		: null;

	const matchedProp = !templateId
		? contactProperties.find(
				(p) =>
					normalizeTemplateVariableName(p.propertyName) === normalizedTarget,
			)
		: null;

	const varType = templateId
		? (matchedVar?.type ?? "string")
		: matchedProp?.propertyType?.toLowerCase() === "number"
			? "number"
			: "string";

	const defaultValue = templateId
		? (matchedVar?.defaultValue ?? "")
		: (matchedProp?.defaultValue ?? "");

	const [localType, setLocalType] = useState(varType);
	const [localDefaultValue, setLocalDefaultValue] = useState(defaultValue);

	const [isSaving, setIsSaving] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Synchronize local state when selection changes
	useEffect(() => {
		setLocalType(varType);
		setLocalDefaultValue(defaultValue);
	}, [varType, defaultValue]);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			// Capture the selection before mutation
			const selectionRange = editor
				? { from: editor.state.selection.from, to: editor.state.selection.to }
				: null;

			if (templateId) {
				const updatedVar = {
					name,
					type: localType,
					defaultValue: localDefaultValue,
				};
				const updatedVariables = templateVariables.map((v) =>
					normalizeTemplateVariableName(v.name) === normalizedTarget
						? updatedVar
						: v,
				);

				const response = await fetch(`/api/template/v1/${templateId}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
					body: JSON.stringify({
						variables: updatedVariables,
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to update variable properties");
				}

				toast.success("Saved variable properties");
				await mutate();
			} else {
				// Campaign mode -> Update contact property
				if (matchedProp) {
					const response = await fetch(
						`/api/contacts/v1/properties/${matchedProp.id}`,
						{
							method: "PATCH",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								fallbackValue: localDefaultValue || null,
							}),
						},
					);

					if (!response.ok) {
						throw new Error("Failed to update property");
					}

					toast.success("Saved variable properties");
					void invalidateContacts();
				} else {
					// Create new contact property if not already existing
					const response = await fetch("/api/contacts/v1/properties/create", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							name,
							type: localType,
							fallbackValue: localDefaultValue || undefined,
						}),
					});

					if (!response.ok) {
						throw new Error("Failed to create property");
					}

					toast.success(`Created property ${name}`);
					void invalidateContacts();
				}
			}

			// Restore selection and focus to keep the inspector open on this variable node
			if (editor && selectionRange) {
				editor.commands.focus();
				const { tr, doc } = editor.state;
				try {
					const SelectionClass = editor.state.selection.constructor as any;
					const selection = SelectionClass.create(
						doc,
						selectionRange.from,
						selectionRange.to,
					);
					tr.setSelection(selection);
					editor.view.dispatch(tr);
				} catch (err) {
					console.warn("Failed to restore exact selection:", err);
				}
			}
		} catch (error: any) {
			console.error("Error saving variable config:", error);
			toast.error(error.message || "Failed to update variable properties");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			if (templateId) {
				const updatedVariables = templateVariables.filter(
					(v) => normalizeTemplateVariableName(v.name) !== normalizedTarget,
				);

				const response = await fetch(`/api/template/v1/${templateId}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
					body: JSON.stringify({
						variables: updatedVariables,
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to delete variable");
				}

				toast.success(`Deleted variable ${name}`);
				mutate();
			} else {
				if (matchedProp) {
					const response = await fetch(
						`/api/contacts/v1/properties/${matchedProp.id}`,
						{
							method: "DELETE",
						},
					);

					if (!response.ok) {
						throw new Error("Failed to delete property");
					}

					toast.success(`Deleted variable ${name}`);
					void invalidateContacts();
				}
			}

			// Delete the active variable node in the editor
			if (editor) {
				editor.commands.deleteSelection();
			}
		} catch (error: any) {
			toast.error(error.message || "Failed to delete variable");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<InspectorSection>
			<div className="flex flex-col gap-4 px-4 py-2">
				{/* ── Name (Read-only reference) ── */}
				<div className="flex flex-col gap-1">
					<div className="select-all font-mono font-semibold text-text-strong-950">
						{formatTemplateVariable(name, 3)}
					</div>
				</div>

				{/* ── Type picker cards ── */}
				<div className="flex flex-col gap-2">
					<div className="grid grid-cols-2 gap-2">
						{TYPE_OPTIONS.map((opt) => {
							const isSelected = localType === opt.value;
							return (
								<motion.button
									whileTap={{ scale: 0.98 }}
									key={opt.value}
									type="button"
									onClick={() => {
										setLocalType(opt.value);
									}}
									className={cn(
										"flex cursor-pointer flex-col items-start gap-2 rounded-xl border-2 p-3 text-left transition-all duration-150",
										isSelected
											? "border-primary-base bg-primary-light/10"
											: "border-stroke-soft-200 bg-bg-soft-200/20 hover:border-stroke-soft-300 hover:bg-bg-soft-200/40 dark:border-stroke-soft-100/40 dark:bg-bg-soft-200/10",
									)}
								>
									<div className="flex w-full justify-between">
										<div
											className={cn(
												"flex h-6 w-6 items-center justify-center rounded-lg border",
												isSelected
													? "border-primary-base/30 bg-primary-light/20"
													: "border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40",
											)}
										>
											<Icon
												name={opt.icon as Parameters<typeof Icon>[0]["name"]}
												className={cn(
													"h-3 w-3",
													isSelected ? opt.color : "text-text-sub-600",
												)}
											/>
										</div>
										<AnimatePresence>
											{isSelected && (
												<motion.div
													initial={{ scale: 0, opacity: 0 }}
													animate={{ scale: 1, opacity: 1 }}
													exit={{ scale: 0, opacity: 0 }}
													transition={{
														type: "spring",
														stiffness: 500,
														damping: 30,
													}}
													className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary-base"
												>
													<Icon name="check" className="h-2 w-2 text-white" />
												</motion.div>
											)}
										</AnimatePresence>
									</div>
									<div>
										<p className="font-semibold text-text-strong-950 text-xs">
											{opt.label}
										</p>
										<p className="text-[10px] text-text-sub-600 leading-tight">
											{opt.description}
										</p>
									</div>
								</motion.button>
							);
						})}
					</div>
				</div>

				{/* ── Default Value ── */}
				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="variable-default-value"
						className="font-semibold text-text-sub-600 text-xs"
					>
						Default Value
					</label>
					<Input.Root size="small" className="rounded-xl">
						<Input.Wrapper>
							<Input.Input
								id="variable-default-value"
								type="text"
								value={localDefaultValue}
								onChange={(e) => {
									const val = e.target.value;
									if (localType === "number") {
										if (val === "" || /^-?\d*\.?\d*$/.test(val)) {
											setLocalDefaultValue(val);
										}
									} else {
										setLocalDefaultValue(val);
									}
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleSave();
										(e.target as HTMLElement).blur();
									}
								}}
								placeholder={
									localType === "number" ? "e.g., 0" : "e.g., unknown"
								}
								inputMode={localType === "number" ? "numeric" : "text"}
							/>
						</Input.Wrapper>
					</Input.Root>
					<p className="text-text-sub-600 text-xs leading-normal">
						Used when a contact doesn&apos;t have this variable set
					</p>
				</div>

				{/* ── Actions ── */}
				<div className="mt-4 flex items-center justify-end gap-2">
					<Button.Root
						type="button"
						variant="error"
						mode="lighter"
						size="small"
						onClick={() => setIsDeleteModalOpen(true)}
						disabled={isSaving || isDeleting}
						className="justify-center rounded-xl py-2"
					>
						Delete
					</Button.Root>
					<Button.Root
						type="button"
						variant="neutral"
						mode="filled"
						size="small"
						onClick={handleSave}
						disabled={
							isSaving ||
							isDeleting ||
							(localType === varType && localDefaultValue === defaultValue)
						}
						className="w-32 justify-center rounded-xl"
					>
						{isSaving ? "Saving..." : "Save"}
					</Button.Root>
				</div>
			</div>

			<DeleteTemplateVariableModal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				variableName={name}
				variableType={varType}
				defaultValue={defaultValue}
				onConfirm={handleDelete}
				isSubmitting={isDeleting}
			/>
		</InspectorSection>
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
			// emailFontColor mark first, then any other color-carrying mark.
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
			prop: name,
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
			name === "letterSpacing" ||
			name === "fontFamily" ||
			name === "fontWeight"
		) {
			const raw = rawEffectiveStyle(name);
			if (raw === undefined || raw === "") return raw;
			if (name === "color") return normalizeColorToHex(raw);
			if (name === "fontWeight") return normalizeFontWeightDisplay(raw);
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
		// Standardize on hex for colors; updateParentBlockStyle has no unit
		// mapping for letterSpacing — pass px explicitly.
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
				name === "letterSpacing" ||
				name === "fontFamily" ||
				name === "fontWeight")
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
			<ColorRow
				label="Color"
				value={String(resolvedGetStyle("color") ?? "")}
				onChange={(v) => resolvedSetStyle("color", v)}
			/>
			<PropRow label="Font">
				<div className="w-36">
					<FontFamilySelect
						value={String(resolvedGetStyle("fontFamily") ?? "")}
						onChange={(v) => resolvedSetStyle("fontFamily", v)}
					/>
				</div>
			</PropRow>
			<PropRow label="Weight">
				<div className="w-36">
					<FontWeightSelect
						value={String(resolvedGetStyle("fontWeight") ?? "")}
						onChange={(v) => resolvedSetStyle("fontWeight", v)}
					/>
				</div>
			</PropRow>
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
}: {
	nodeType: string;
	getStyle: (name: InspectorStyleProperty) => string | number | undefined;
	setStyle: (name: InspectorStyleProperty, value: string | number) => void;
	batchSetStyle: (
		changes: Array<{ prop: InspectorStyleProperty; value: string | number }>,
	) => void;
	getAttr: (name: string) => unknown;
	setAttr: (name: string, value: unknown) => void;
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
				{nodeType === "image" && (
					<div className="px-4 pb-3">
						<ImageSrcControl
							value={{
								src: String(getAttr("src") ?? ""),
								alt: String(getAttr("alt") ?? ""),
								href: String(getAttr("href") ?? ""),
								width: toPxNumber(getAttr("width") as string | number),
								height: toPxNumber(getAttr("height") as string | number),
								align: String(
									getAttr("alignment") ?? getAttr("align") ?? "center",
								),
							}}
							onChange={({ src, alt, href, width, height, align }) => {
								setAttr("src", src);
								setAttr("alt", alt);
								if (href !== undefined) setAttr("href", href);
								setAttr("width", width === "" ? "auto" : width);
								setAttr("height", height === "" ? "auto" : height);
								if (align) {
									// Image schema uses `alignment`; also sync legacy `align`
									// attr + centering margins so canvas + export stay in sync.
									setAttr("alignment", align);
									setAttr("align", align);
									if (align === "center") {
										batchSetStyle([
											{ prop: "display", value: "block" },
											{ prop: "marginLeft", value: "auto" },
											{ prop: "marginRight", value: "auto" },
										]);
									} else if (align === "right") {
										batchSetStyle([
											{ prop: "display", value: "block" },
											{ prop: "marginLeft", value: "auto" },
											{ prop: "marginRight", value: 0 },
										]);
									} else {
										batchSetStyle([
											{ prop: "display", value: "block" },
											{ prop: "marginLeft", value: 0 },
											{ prop: "marginRight", value: "auto" },
										]);
									}
								}
							}}
						/>
					</div>
				)}
				{nodeType === "button" && (
					<>
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
									// Button schema uses `alignment`; sync legacy `align` too.
									setAttr("alignment", align);
									setAttr("align", align);
								}}
							/>
						</div>
					</>
				)}
			</InspectorSection>
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
						if (box.filled) {
							box.write([
								{ prop: "borderColor", value: hex },
								{ prop: "borderTopColor", value: hex },
								{ prop: "borderRightColor", value: hex },
								{ prop: "borderBottomColor", value: hex },
								{ prop: "borderLeftColor", value: hex },
							]);
						} else if (hex) {
							batchSetStyle([
								{ prop: "borderColor", value: hex },
								{ prop: "borderTopColor", value: hex },
								{ prop: "borderRightColor", value: hex },
								{ prop: "borderBottomColor", value: hex },
								{ prop: "borderLeftColor", value: hex },
							]);
						} else {
							batchSetStyle([
								{ prop: "borderColor", value: "" },
								{ prop: "borderTopColor", value: "" },
								{ prop: "borderRightColor", value: "" },
								{ prop: "borderBottomColor", value: "" },
								{ prop: "borderLeftColor", value: "" },
							]);
						}
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
					{(textProps) => (
						<>
							<TextSection {...textProps} />
							<InspectorNodeStyles
								nodeType="paragraph"
								getStyle={textProps.getStyle}
								setStyle={textProps.setStyle}
								batchSetStyle={(changes) => {
									for (const change of changes) {
										textProps.setStyle(change.prop, change.value);
									}
								}}
								getAttr={() => undefined}
								setAttr={() => {}}
							/>
						</>
					)}
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
							// Fallback: sync both attr spellings + inline text-align style.
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

				{/* ── Variable Properties inspector card ── */}
				<Inspector.Node>
					{({ nodeType, getAttr }) => {
						if (nodeType !== "variable") return null;
						const name = (getAttr("name") as string) || "";
						return <VariableInspectorCard name={name} />;
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
										value={normalizeColorToHex(
											String(findStyleValue("body", "backgroundColor") ?? ""),
										)}
										onChange={(v) =>
											setColorGlobal("body", "backgroundColor", v)
										}
									/>
									<SpacingControl
										key={`body-padding-${String(findStyleValue("body", "paddingTop") ?? "")}-${String(findStyleValue("body", "padding") ?? "")}`}
										label="Padding"
										value={{
											top: toPxNumber(
												(findStyleValue("body", "paddingTop") ??
													findStyleValue("body", "padding") ??
													"") as string | number | undefined,
											),
											right: toPxNumber(
												(findStyleValue("body", "paddingRight") ??
													findStyleValue("body", "padding") ??
													"") as string | number | undefined,
											),
											bottom: toPxNumber(
												(findStyleValue("body", "paddingBottom") ??
													findStyleValue("body", "padding") ??
													"") as string | number | undefined,
											),
											left: toPxNumber(
												(findStyleValue("body", "paddingLeft") ??
													findStyleValue("body", "padding") ??
													"") as string | number | undefined,
											),
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
										value={normalizeColorToHex(
											String(
												findStyleValue("body", "color") ??
													findStyleValue("container", "color") ??
													"",
											),
										)}
										onChange={(v) => {
											setColorGlobal("body", "color", v);
											setColorGlobal("container", "color", v);
										}}
									/>
									<ColorRow
										label="Background"
										value={normalizeColorToHex(
											String(
												findStyleValue("container", "backgroundColor") ?? "",
											),
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
										key={`container-padding-${String(findStyleValue("container", "paddingTop") ?? "")}-${String(findStyleValue("container", "padding") ?? "")}`}
										label="Padding"
										value={{
											top: toPxNumber(
												(findStyleValue("container", "paddingTop") ??
													findStyleValue("container", "padding") ??
													"") as string | number | undefined,
											),
											right: toPxNumber(
												(findStyleValue("container", "paddingRight") ??
													findStyleValue("container", "padding") ??
													"") as string | number | undefined,
											),
											bottom: toPxNumber(
												(findStyleValue("container", "paddingBottom") ??
													findStyleValue("container", "padding") ??
													"") as string | number | undefined,
											),
											left: toPxNumber(
												(findStyleValue("container", "paddingLeft") ??
													findStyleValue("container", "padding") ??
													"") as string | number | undefined,
											),
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
									<ScrubRow
										label="Margin"
										value={toPxNumber(
											findStyleValue("container", "margin") as
												| string
												| number
												| undefined,
										)}
										onChange={(v) =>
											setGlobalStyle("container", "margin", v as number)
										}
										min={0}
										max={200}
										suffix="px"
									/>
									<SpacingControl
										key={`container-radius-${String(findStyleValue("container", "borderTopLeftRadius") ?? "")}-${String(findStyleValue("container", "borderRadius") ?? "")}`}
										label="Corner radius"
										variant="corners"
										value={{
											top: toPxNumber(
												(findStyleValue("container", "borderTopLeftRadius") ??
													findStyleValue("container", "borderRadius") ??
													"") as string | number | undefined,
											),
											right: toPxNumber(
												(findStyleValue("container", "borderTopRightRadius") ??
													findStyleValue("container", "borderRadius") ??
													"") as string | number | undefined,
											),
											bottom: toPxNumber(
												(findStyleValue(
													"container",
													"borderBottomRightRadius",
												) ??
													findStyleValue("container", "borderRadius") ??
													"") as string | number | undefined,
											),
											left: toPxNumber(
												(findStyleValue(
													"container",
													"borderBottomLeftRadius",
												) ??
													findStyleValue("container", "borderRadius") ??
													"") as string | number | undefined,
											),
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
										key={`container-border-${String(findStyleValue("container", "borderTopWidth") ?? "")}-${String(findStyleValue("container", "borderWidth") ?? "")}`}
										label="Border"
										value={{
											top: toPxNumber(
												(findStyleValue("container", "borderTopWidth") ??
													findStyleValue("container", "borderWidth") ??
													"") as string | number | undefined,
											),
											right: toPxNumber(
												(findStyleValue("container", "borderRightWidth") ??
													findStyleValue("container", "borderWidth") ??
													"") as string | number | undefined,
											),
											bottom: toPxNumber(
												(findStyleValue("container", "borderBottomWidth") ??
													findStyleValue("container", "borderWidth") ??
													"") as string | number | undefined,
											),
											left: toPxNumber(
												(findStyleValue("container", "borderLeftWidth") ??
													findStyleValue("container", "borderWidth") ??
													"") as string | number | undefined,
											),
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
										value={normalizeColorToHex(
											String(findStyleValue("container", "borderColor") ?? ""),
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
