import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useCurrentEditor } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import { useSWR } from "#/features/templates/editor/hooks/use-swr-compat";
import { useTemplateId } from "#/features/templates/editor/hooks/use-template-id";
import {
	mapTemplateVariables,
	normalizeTemplateVariableName,
} from "#/features/templates/lib/template-variables";
import { DeleteTemplateVariableModal } from "./delete-variable-modal";
import { EditTemplateVariableModal } from "./edit-variable-modal";

interface PanelProps {
	onOpenChange?: (open: boolean) => void;
	onClose: () => void;
}

const fetcher = (url: string) =>
	fetch(url, { credentials: "include" }).then((r) => r.json());

interface MappedVariable {
	name: string;
	type: "string" | "number";
	defaultValue: string | null;
}

export function VariablesPanel({ onClose }: PanelProps) {
	const templateId = useTemplateId();

	/* fetch template so we can read the auto-extracted variables */
	const {
		data: templateData,
		isLoading,
		mutate,
	} = useSWR(templateId ? `/api/template/v1/${templateId}` : null, fetcher);

	const rawVars = templateData?.variables ?? [];
	const detectedVars: MappedVariable[] = mapTemplateVariables(rawVars);
	const repairedKeyRef = useRef<string | null>(null);

	// Persist cleanup for names corrupted by the old brace-stripping bug (`{first_name}`)
	useEffect(() => {
		if (!templateId || !Array.isArray(rawVars) || rawVars.length === 0) return;

		const needsRepair = rawVars.some((v: unknown) => {
			if (typeof v === "string") {
				return v !== normalizeTemplateVariableName(v);
			}
			if (v && typeof v === "object" && "name" in v) {
				const name = String((v as { name?: string }).name ?? "");
				return name !== normalizeTemplateVariableName(name);
			}
			return false;
		});

		if (!needsRepair) return;
		if (repairedKeyRef.current === templateId) return;
		repairedKeyRef.current = templateId;

		const cleaned = mapTemplateVariables(rawVars);
		void fetch(`/api/template/v1/${templateId}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ variables: cleaned }),
		})
			.then((res) => {
				if (res.ok) return mutate();
			})
			.catch(() => {
				repairedKeyRef.current = null;
			});
	}, [templateId, rawVars, mutate]);

	const { editor } = useCurrentEditor();

	const [copiedKey, setCopiedKey] = useState<string | null>(null);
	const setIsCreatingVar = useEditorStore((s) => s.setIsCreatingVar);
	const [isSavingConfig, setIsSavingConfig] = useState(false);
	const [editingVar, setEditingVar] = useState<MappedVariable | null>(null);
	const [deletingVar, setDeletingVar] = useState<MappedVariable | null>(null);

	const handleCopy = (key: string) => {
		navigator.clipboard.writeText(key);
		setCopiedKey(key);
		toast.success(`Copied ${key}`, { duration: 1800 });
		setTimeout(() => setCopiedKey(null), 2000);
	};

	const handleSaveVariableConfig = async (
		originalName: string,
		updatedVar: MappedVariable,
	) => {
		if (!templateId) return;
		setIsSavingConfig(true);
		try {
			const updatedVariables = detectedVars.map((v: MappedVariable) =>
				v.name === originalName ? updatedVar : v,
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
				const err = await response.json();
				throw new Error(err.message || "Failed to update variable config");
			}

			toast.success(`Updated variable properties for ${updatedVar.name}`);
			mutate();
		} catch (error: any) {
			toast.error(error.message || "Something went wrong");
		} finally {
			setIsSavingConfig(false);
		}
	};

	const handleDeleteVariable = async (nameToDelete: string) => {
		if (!templateId) return;
		setIsSavingConfig(true);
		try {
			const updatedVariables = detectedVars.filter(
				(v: MappedVariable) => v.name !== nameToDelete,
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
				const err = await response.json();
				throw new Error(err.message || "Failed to delete variable");
			}

			toast.success(`Deleted variable ${nameToDelete}`);
			mutate();
		} catch (error) {
			const err = error as Error;
			toast.error(err.message || "Something went wrong");
		} finally {
			setIsSavingConfig(false);
		}
	};

	return (
		<div className="flex h-full w-full flex-col overflow-hidden bg-bg-white-0 dark:bg-black">
			{/* ── Header ── */}
			<div className="flex shrink-0 items-center justify-between gap-2 pt-3 pr-4 pb-3 pl-6">
				<h2 className="font-semibold text-label-lg text-text-strong-950">
					Variable
				</h2>
				<div className="flex items-center gap-1">
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="xxsmall"
						onClick={() => setIsCreatingVar(true)}
					>
						<Icon name="plus" className="h-3 w-3" />
						Create
					</Button.Root>
					<button
						type="button"
						onClick={() => onClose()}
						className="rounded-lg p-1.5 text-text-soft-400 transition-all hover:bg-bg-weak-50 hover:text-text-strong-950"
					>
						<Icon name="cross" className="h-[18px] w-[18px]" />
					</button>
				</div>
			</div>

			{/* ── Scrollable Body ── */}
			<div className="mt-2 flex-1 overflow-y-auto">
				{isLoading ? (
					<div className="flex items-center justify-center py-6">
						<Spinner size={14} />
					</div>
				) : detectedVars.length === 0 ? (
					<div className="rounded-xl px-4 py-5 text-center">
						<div className="mx-auto flex size-8 items-center justify-center">
							<Icon name="brackets" className="h-3.5 w-3.5 text-text-sub-600" />
						</div>
						<p className="font-medium text-text-strong-950 text-xs">
							No variables yet
						</p>
						<p className="mt-2 text-[11px] text-text-soft-400 leading-normal">
							Create a variable or type{" "}
							<code className="rounded bg-bg-soft-200 px-1 font-mono dark:bg-bg-soft-200">
								{"{{variable}}"}
							</code>{" "}
							or{" "}
							<code className="rounded bg-bg-soft-200 px-1 font-mono dark:bg-bg-soft-200">
								{"{{{variable}}}"}
							</code>{" "}
							in your email
						</p>
					</div>
				) : (
					<div className="space-y-2 px-5">
						{detectedVars.map((v) => {
							const key = `{{{${v.name}}}}`;
							return (
								<div
									key={v.name}
									className="group relative flex flex-col gap-1.5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-3 transition-all hover:border-stroke-soft-200 hover:bg-bg-weak-50 dark:border-stroke-soft-100/40"
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
											color={v.type === "number" ? "purple" : "blue"}
											className="h-[18px] rounded-full px-1.5 font-semibold text-[10px] capitalize"
										>
											{v.type}
										</Badge.Root>
									</div>

									{/* Middle Row: Default value if configured */}
									<div className="flex min-w-0 items-center justify-between">
										{v.defaultValue !== null && v.defaultValue !== "" ? (
											<p className="truncate text-[10px] text-text-sub-600">
												Default:{" "}
												<code className="rounded bg-bg-soft-200 px-1 font-mono text-feature-base dark:bg-bg-soft-200">
													"{v.defaultValue}"
												</code>
											</p>
										) : (
											<p className="text-[10px] text-text-soft-400 italic">
												No default value set
											</p>
										)}

										{/* Action Buttons: Edit, Delete, Copy/Insert (Visible on hover) */}
										<div className="flex items-center">
											<Button.Root
												type="button"
												variant="neutral"
												mode="ghost"
												size="xxsmall"
												onClick={() => setEditingVar(v)}
												title="Configure variable"
												className="size-8 rounded-lg text-text-sub-600 transition-all duration-200 hover:bg-bg-soft-200 dark:hover:bg-bg-soft-200"
											>
												<Icon name="pencil" className="h-3.5 w-3.5" />
											</Button.Root>
											<Button.Root
												type="button"
												variant="neutral"
												mode="ghost"
												size="xxsmall"
												onClick={() => setDeletingVar(v)}
												title="Delete variable"
												className="size-8 rounded-lg text-text-sub-600 transition-all duration-200 hover:bg-error-lighter hover:text-error-base dark:hover:bg-error-base/10 dark:hover:text-error-base"
											>
												<Icon name="trash" className="h-3.5 w-3.5" />
											</Button.Root>
											<Button.Root
												type="button"
												variant="neutral"
												mode="ghost"
												size="xxsmall"
												onClick={() => handleCopy(key)}
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

			<EditTemplateVariableModal
				variable={editingVar}
				open={!!editingVar}
				onOpenChange={(isOpen) => {
					if (!isOpen) setEditingVar(null);
				}}
				onSave={handleSaveVariableConfig}
				onDelete={async (_name) => {
					setDeletingVar(editingVar);
					setEditingVar(null);
				}}
				isSubmitting={isSavingConfig}
			/>

			<DeleteTemplateVariableModal
				isOpen={!!deletingVar}
				onClose={() => setDeletingVar(null)}
				variableName={deletingVar?.name ?? ""}
				onConfirm={async () => {
					if (deletingVar) {
						await handleDeleteVariable(deletingVar.name);
					}
				}}
				isSubmitting={isSavingConfig}
			/>
		</div>
	);
}
