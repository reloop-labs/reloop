"use client";

import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import { useCurrentEditor } from "@tiptap/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AddPropertyModal } from "#/features/contacts/components/properties/add-property-modal";
import { DeletePropertyModal } from "#/features/contacts/components/properties/delete-property-modal";
import { EditPropertyModal } from "#/features/contacts/components/properties/edit-property-modal";
import {
	type Property,
	useAllPropertiesQuery,
} from "#/features/contacts/hooks/use-contacts-query";

interface CampaignVariablesPanelProps {
	onClose: () => void;
}

export function CampaignVariablesPanel({
	onClose,
}: CampaignVariablesPanelProps) {
	const { data: propertiesData, isLoading } = useAllPropertiesQuery();
	const properties = propertiesData?.properties ?? [];

	const { editor } = useCurrentEditor();

	const [searchQuery, setSearchQuery] = useState("");
	const [copiedKey, setCopiedKey] = useState<string | null>(null);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [editingProperty, setEditingProperty] = useState<Property | null>(null);
	const [deletingProperty, setDeletingProperty] = useState<Property | null>(
		null,
	);

	const filteredProperties = useMemo(() => {
		if (!searchQuery.trim()) return properties;
		const q = searchQuery.toLowerCase().trim();
		return properties.filter(
			(p) =>
				p.propertyName.toLowerCase().includes(q) ||
				p.defaultValue?.toLowerCase().includes(q),
		);
	}, [properties, searchQuery]);

	const handleCopy = (key: string, e: React.MouseEvent) => {
		e.stopPropagation();
		navigator.clipboard.writeText(key);
		setCopiedKey(key);
		toast.success(`Copied ${key}`, { duration: 1800 });
		setTimeout(() => setCopiedKey(null), 2000);
	};

	const handleInsert = (propertyName: string) => {
		if (editor) {
			editor
				.chain()
				.focus()
				.insertContent({
					type: "variable",
					attrs: { name: propertyName },
				})
				.run();
			toast.success(`Inserted {{{${propertyName}}}}`);
		} else {
			const placeholder = `{{{${propertyName}}}}`;
			navigator.clipboard.writeText(placeholder);
			toast.success(`Copied ${placeholder}`);
		}
	};

	return (
		<div className="flex h-full w-full flex-col overflow-hidden bg-bg-white-0 font-sans dark:bg-black">
			{/* ── Header ── */}
			<div className="flex shrink-0 items-center justify-between gap-2 pt-3 pr-4 pb-3 pl-6">
				<div className="flex items-center gap-2">
					<h2 className="font-semibold text-label-lg text-text-strong-950">
						Variables
					</h2>
					{properties.length > 0 && (
						<span className="rounded-full bg-bg-soft-200 px-2 py-0.5 font-medium text-[11px] text-text-sub-600 dark:bg-bg-soft-200">
							{properties.length}
						</span>
					)}
				</div>
				<div className="flex items-center gap-1">
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="xxsmall"
						onClick={() => setIsCreateModalOpen(true)}
					>
						<Icon name="plus" className="h-3 w-3" />
						Create
					</Button.Root>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1.5 text-text-soft-400 transition-all hover:bg-bg-weak-50 hover:text-text-strong-950"
						aria-label="Close variables panel"
					>
						<Icon name="cross" className="h-[18px] w-[18px]" />
					</button>
				</div>
			</div>

			{/* ── Search Input (if multiple properties) ── */}
			{properties.length > 4 && (
				<div className="px-5 pb-2">
					<Input.Root size="small" className="rounded-xl">
						<Input.Wrapper>
							<Input.Icon
								as={Icon}
								name="search"
								size="small"
								className="h-3.5 w-3.5 text-text-soft-400"
							/>
							<Input.Input
								placeholder="Search variables..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="text-xs"
							/>
							{searchQuery && (
								<button
									type="button"
									onClick={() => setSearchQuery("")}
									className="text-text-soft-400 hover:text-text-strong-950"
								>
									<Icon name="cross" className="h-3 w-3" />
								</button>
							)}
						</Input.Wrapper>
					</Input.Root>
				</div>
			)}

			{/* ── Scrollable Body ── */}
			<div className="mt-2 flex-1 overflow-y-auto">
				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<Spinner size={16} />
					</div>
				) : properties.length === 0 ? (
					<div className="rounded-xl px-4 py-8 text-center">
						<div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-bg-soft-200 text-text-sub-600 dark:bg-bg-soft-200/50">
							<Icon name="brackets" className="h-4 w-4" />
						</div>
						<p className="mt-3 font-semibold text-text-strong-950 text-xs">
							No contact properties yet
						</p>
						<p className="mt-1.5 text-[11px] text-text-soft-400 leading-normal">
							Create a contact property to use as dynamic variables in your
							emails.
						</p>
						<div className="mt-4 flex justify-center">
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="xsmall"
								onClick={() => setIsCreateModalOpen(true)}
							>
								<Icon name="plus" className="h-3.5 w-3.5" />
								Create Property
							</Button.Root>
						</div>
					</div>
				) : filteredProperties.length === 0 ? (
					<div className="py-6 text-center text-text-soft-400 text-xs">
						No variables match "{searchQuery}"
					</div>
				) : (
					<div className="space-y-2 px-5 pb-6">
						{filteredProperties.map((prop) => {
							const key = `{{{${prop.propertyName}}}}`;
							const isNumber = prop.propertyType?.toLowerCase() === "number";

							return (
								<div
									key={prop.id}
									onClick={() => handleInsert(prop.propertyName)}
									className="group relative flex cursor-pointer flex-col gap-1.5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-3 transition-all hover:border-stroke-soft-200 hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-bg-soft-200/10 dark:hover:bg-white/[0.04]"
								>
									{/* Top Row: Name and Type Badge */}
									<div className="flex items-center justify-between">
										<div className="flex min-w-0 items-center gap-1.5">
											<span className="truncate font-mono font-semibold text-text-strong-950 text-xs">
												{key}
											</span>
										</div>

										<Badge.Root
											size="small"
											variant="lighter"
											color={isNumber ? "purple" : "blue"}
											className="h-[18px] rounded-full px-1.5 font-semibold text-[10px] capitalize"
										>
											{prop.propertyType || "string"}
										</Badge.Root>
									</div>

									{/* Middle Row: Default value if configured */}
									<div className="flex min-w-0 items-center justify-between">
										{prop.defaultValue !== null &&
										prop.defaultValue !== undefined &&
										prop.defaultValue !== "" ? (
											<p className="truncate text-[10px] text-text-sub-600">
												Default:{" "}
												<code className="rounded bg-bg-soft-200 px-1 font-mono text-feature-base dark:bg-bg-soft-200">
													"{prop.defaultValue}"
												</code>
											</p>
										) : (
											<p className="text-[10px] text-text-soft-400 italic">
												No default value set
											</p>
										)}

										{/* Action Buttons: Edit, Delete, Copy/Insert */}
										<div className="flex items-center">
											<Button.Root
												type="button"
												variant="neutral"
												mode="ghost"
												size="xxsmall"
												onClick={(e) => {
													e.stopPropagation();
													setEditingProperty(prop);
												}}
												title="Configure property"
												className="size-8 rounded-lg text-text-sub-600 transition-all duration-200 hover:bg-bg-soft-200 dark:hover:bg-bg-soft-200"
											>
												<Icon name="pencil" className="h-3.5 w-3.5" />
											</Button.Root>
											<Button.Root
												type="button"
												variant="neutral"
												mode="ghost"
												size="xxsmall"
												onClick={(e) => {
													e.stopPropagation();
													setDeletingProperty(prop);
												}}
												title="Delete property"
												className="size-8 rounded-lg text-text-sub-600 transition-all duration-200 hover:bg-error-lighter hover:text-error-base dark:hover:bg-error-base/10 dark:hover:text-error-base"
											>
												<Icon name="trash" className="h-3.5 w-3.5" />
											</Button.Root>
											<Button.Root
												type="button"
												variant="neutral"
												mode="ghost"
												size="xxsmall"
												onClick={(e) => handleCopy(key, e)}
												title="Copy placeholder"
												className="size-8 rounded-lg text-text-sub-600 transition-all duration-200 hover:bg-bg-soft-200 dark:hover:bg-bg-soft-200"
											>
												{copiedKey === key ? (
													<Icon
														name="check"
														className="fade-in zoom-in-50 h-3.5 w-3.5 animate-in text-success-base duration-200"
													/>
												) : (
													<Icon name="copy" className="h-3.5 w-3.5" />
												)}
											</Button.Root>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Modals */}
			<AddPropertyModal
				open={isCreateModalOpen}
				onOpenChange={setIsCreateModalOpen}
				title="Create variable"
				submitLabel="Create variable"
				nameLabel="Variable name"
			/>

			<EditPropertyModal
				property={editingProperty}
				open={!!editingProperty}
				title="Edit variable"
				nameLabel="Variable name"
				onOpenChange={(isOpen) => {
					if (!isOpen) setEditingProperty(null);
				}}
			/>

			<DeletePropertyModal
				property={deletingProperty}
				open={!!deletingProperty}
				onOpenChange={(isOpen) => {
					if (!isOpen) setDeletingProperty(null);
				}}
			/>
		</div>
	);
}
