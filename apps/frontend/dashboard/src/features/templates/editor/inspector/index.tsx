"use client";

import { Inspector } from "@react-email/editor/ui";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { useCurrentEditor } from "@tiptap/react";
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
			<SectionHeader label="Text" />

			<ColorRow
				label="Color"
				value={String(getStyle("color") ?? "")}
				onChange={(v) => setStyle("color", v)}
			/>
			<ScrubRow
				label="Font size"
				value={getStyle("fontSize")}
				onChange={(v) => setStyle("fontSize", v as number)}
				min={8}
				max={96}
				suffix="px"
			/>
			<ScrubRow
				label="Line height"
				value={getStyle("lineHeight")}
				onChange={(v) => setStyle("lineHeight", v as number)}
				min={80}
				max={300}
				suffix="%"
			/>
			<ScrubRow
				label="Tracking"
				value={getStyle("letterSpacing")}
				onChange={(v) => setStyle("letterSpacing", v as number)}
				min={-20}
				max={40}
				suffix="px"
			/>

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
		<Inspector.Root className="min-w-0 bg-transparent">
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
						return <VariableInspectorCard name={name} />;
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
									onChange={(v) =>
										setGlobalStyle("body", "backgroundColor", v)
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
											"left"
										}
										setAlignment={(align) =>
											setGlobalStyle("container", "align", align)
										}
									/>
								</div>
								<ColorRow
									label="Text"
									value={
										String(
											findStyleValue("body", "color") ??
												findStyleValue("container", "color") ??
												"",
										)
									}
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
											(findStyleValue("container", "paddingBottom") as number) ??
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
