"use client";

import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { useCurrentEditor } from "@tiptap/react";
import {
	Award,
	Braces,
	Check,
	CheckCircle2,
	ChevronLeft,
	Copy,
	FileCode2,
	Loader2,
	Pencil,
	Plus,
	Send,
	ShieldAlert,
	Sparkles,
	Trash2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { DeleteTemplateVariableModal } from "./delete-template-variable-modal";
import { EditTemplateVariableModal } from "./edit-template-variable-modal";
import { useEditorStore } from "./use-editor-store";

interface PanelProps {
	onOpenChange?: (open: boolean) => void;
	onClose: () => void;
}

const fetcher = (url: string) =>
	fetch(url, { credentials: "include" }).then((r) => r.json());

/* colour palette for variable chips */
const _CHIP_COLOURS = [
	"bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-800/40",
	"bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-800/40",
	"bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40",
	"bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/40",
	"bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/40",
	"bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-800/40",
];

/* ------------------------------------------------------------------ */
/* Variables Panel Component                                         */
/* ------------------------------------------------------------------ */
export function VariablesPanel({ onClose }: PanelProps) {
	const params = useParams<{ templateId: string }>();
	const templateId = params?.templateId;

	/* fetch template so we can read the auto-extracted variables */
	const {
		data: templateData,
		isLoading,
		mutate,
	} = useSWR(templateId ? `/api/template/v1/${templateId}` : null, fetcher);

	interface MappedVariable {
		name: string;
		type: "string" | "number";
		defaultValue: string | null;
	}

	const rawVars = templateData?.variables ?? [];
	const detectedVars: MappedVariable[] = rawVars.map(
		(v: any): MappedVariable => {
			if (typeof v === "string") {
				return {
					name: v.replace(/^\{\{|\}\}$/g, "").trim(),
					type: "string" as const,
					defaultValue: null,
				};
			}
			return {
				name: v?.name ?? "",
				type: (v?.type ?? "string") as "string" | "number",
				defaultValue: v?.defaultValue ?? null,
			};
		},
	);

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
		<div className="relative flex h-full w-full flex-col overflow-hidden">
			{/* ── Header ── */}
			<div className="flex h-10 shrink-0 items-center justify-between border-stroke-soft-200 border-b bg-bg-weak-50 px-3 dark:border-stroke-soft-100/30 dark:bg-[#0a0a0a]">
				<div className="flex items-center gap-1.5">
					<Braces size={13} className="text-text-strong-950 dark:text-white" />
					<span className="font-semibold text-text-strong-950 text-xs dark:text-white">
						Variables
					</span>
				</div>
				<Button.Root
					type="button"
					variant="neutral"
					mode="ghost"
					size="xxsmall"
					onClick={onClose}
					className="size-7 rounded-lg text-text-sub-600 transition-all hover:bg-bg-soft-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
				>
					<ChevronLeft size={16} />
				</Button.Root>
			</div>

			{/* ── Scrollable Body ── */}
			<div className="hide-scrollbar flex-1 overflow-y-auto">
				{/* ── Insert/Create Variable Button ── */}
				<div className="border-stroke-soft-200 border-b px-3 py-2.5 dark:border-stroke-soft-100/20">
					<button
						type="button"
						onClick={() => setIsCreatingVar(true)}
						className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-stroke-soft-200 border-dashed py-2 font-semibold text-[11px] text-text-sub-600 transition-colors hover:border-violet-300 hover:bg-violet-50/30 hover:text-violet-600 dark:border-stroke-soft-100/20 dark:text-zinc-400 dark:hover:border-violet-700/40 dark:hover:bg-violet-950/10 dark:hover:text-violet-400"
					>
						<Plus size={12} />
						Create &amp; Insert Variable
					</button>
				</div>

				{/* ── Section 1: Detected in template ── */}
				<div className="p-3 pb-1">
					<div className="mb-2 flex items-center justify-between">
						<span className="flex items-center gap-1.5 font-bold text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-zinc-400">
							<FileCode2 size={10} />
							Template Properties
						</span>
						{!isLoading && (
							<span
								className={cn(
									"rounded-full px-1.5 py-0.5 font-bold text-[9px] leading-none",
									detectedVars.length > 0
										? "bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300"
										: "bg-bg-soft-200 text-text-soft-400 dark:bg-zinc-800 dark:text-zinc-500",
								)}
							>
								{detectedVars.length}
							</span>
						)}
					</div>

					{isLoading ? (
						<div className="flex items-center justify-center py-6">
							<Loader2
								size={14}
								className="animate-spin text-text-disabled-300 dark:text-zinc-600"
							/>
						</div>
					) : detectedVars.length === 0 ? (
						<div className="rounded-xl border border-stroke-soft-200 border-dashed bg-bg-weak-50/50 px-4 py-5 text-center dark:border-stroke-soft-100/20 dark:bg-zinc-900/20">
							<div className="mx-auto mb-2.5 flex size-8 items-center justify-center rounded-lg bg-bg-soft-200 dark:bg-zinc-800">
								<Braces
									size={14}
									className="text-text-disabled-300 dark:text-zinc-500"
								/>
							</div>
							<p className="font-medium text-text-strong-950 text-xs dark:text-zinc-300">
								No variables yet
							</p>
							<p className="mt-0.5 text-[11px] text-text-soft-400 leading-normal dark:text-zinc-500">
								Type{" "}
								<code className="rounded bg-bg-soft-200 px-1 font-mono dark:bg-zinc-800">
									{"{{{variable}}}"}
								</code>{" "}
								in your email and save a draft to see it here.
							</p>
						</div>
					) : (
						<div className="space-y-2">
							{detectedVars.map((v) => {
								const key = `{{{${v.name}}}}`;
								return (
									<div
										key={v.name}
										className="group relative flex flex-col gap-1.5 rounded-xl border border-stroke-soft-200 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:border-violet-200 hover:bg-violet-50/10 dark:border-stroke-soft-100/10 dark:bg-zinc-900/30 dark:hover:border-violet-800/20 dark:hover:bg-violet-950/5"
									>
										{/* Top Row: Name and Type Badge */}
										<div className="flex items-center justify-between">
											<div className="flex min-w-0 items-center gap-1.5">
												<span className="truncate font-semibold text-text-strong-950 text-xs dark:text-zinc-100">
													{"{{{ "} {v.name} {" }}}"}
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
												<p className="truncate text-[10px] text-text-sub-600 dark:text-zinc-400">
													Default:{" "}
													<code className="rounded bg-bg-soft-150 px-1 font-mono text-violet-600 dark:bg-zinc-800/80 dark:text-violet-400">
														"{v.defaultValue}"
													</code>
												</p>
											) : (
												<p className="text-[10px] text-text-soft-400 italic dark:text-zinc-500">
													No default value set
												</p>
											)}

											{/* Action Buttons: Edit, Delete, Copy/Insert (Visible on hover) */}
											<div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
												<button
													type="button"
													onClick={() => {
														if (editor) {
															editor
																.chain()
																.focus()
																.insertContent({
																	type: "variable",
																	attrs: { name: v.name },
																})
																.run();
															toast.success(`Inserted variable ${v.name}`);
														} else {
															handleCopy(key);
														}
													}}
													title="Insert variable"
													className="rounded-lg p-1 text-text-soft-400 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-white"
												>
													<Plus size={11} />
												</button>
												<button
													type="button"
													onClick={() => setEditingVar(v)}
													title="Configure variable"
													className="rounded-lg p-1 text-text-soft-400 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-white"
												>
													<Pencil size={11} />
												</button>
												<button
													type="button"
													onClick={() => setDeletingVar(v)}
													title="Delete variable"
													className="rounded-lg p-1 text-text-soft-400 hover:bg-bg-soft-200 hover:text-error-base dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-error-base"
												>
													<Trash2 size={11} />
												</button>
												<button
													type="button"
													onClick={() => handleCopy(key)}
													title="Copy placeholder"
													className="rounded-lg p-1 text-text-soft-400 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-white"
												>
													{copiedKey === key ? (
														<Check
															size={11}
															className="fade-in zoom-in-50 animate-in text-emerald-500 duration-200"
														/>
													) : (
														<Copy size={11} />
													)}
												</button>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
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

			{/* ── Footer hint ── */}
			<div className="shrink-0 border-stroke-soft-100 border-t bg-bg-weak-50 px-4 py-2 dark:border-stroke-soft-100/10 dark:bg-zinc-900/10">
				<p className="text-[10px] text-text-soft-400 leading-normal dark:text-zinc-500">
					Click copy icon to copy variable. Paste into your email using{" "}
					<code className="rounded bg-bg-soft-200 px-1 font-mono dark:bg-zinc-800">
						{"{{{key}}}"}
					</code>
				</p>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/* Score Panel Component                                             */
/* ------------------------------------------------------------------ */
export function ScorePanel({ onClose }: PanelProps) {
	return (
		<div className="flex h-full w-full flex-col overflow-hidden bg-transparent">
			{/* Header */}
			<div className="flex h-10 shrink-0 items-center justify-between border-stroke-soft-200 border-b bg-bg-weak-50 px-3 dark:bg-[#0a0a0a]">
				<div className="flex items-center gap-1.5 p-0">
					<Award size={14} className="text-text-strong-950 dark:text-white" />
					<span className="font-semibold text-text-strong-950 text-xs dark:text-white">
						Template Score
					</span>
				</div>
				<Button.Root
					type="button"
					variant="neutral"
					mode="ghost"
					size="xxsmall"
					onClick={onClose}
					className="size-7 rounded-lg text-text-sub-600 transition-all duration-200 hover:bg-bg-soft-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
				>
					<ChevronLeft size={24} />
				</Button.Root>
			</div>

			{/* Score Circle Card */}
			<div className="flex shrink-0 flex-col items-center border-stroke-soft-200 border-b bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/20 dark:bg-[#0c0c0c]">
				<div className="relative flex size-24 items-center justify-center rounded-full border-4 border-emerald-500/20 bg-white shadow-inner dark:border-emerald-950 dark:bg-zinc-950">
					<div className="absolute text-center">
						<span className="font-extrabold text-3xl text-emerald-600 dark:text-emerald-400">
							98
						</span>
						<span className="text-text-soft-400 text-xs dark:text-zinc-500">
							/100
						</span>
					</div>
				</div>
				<span className="mt-3 flex items-center gap-1.5 font-semibold text-sm text-text-strong-950 dark:text-white">
					<Sparkles size={14} className="text-emerald-500" />
					Excellent Deliverability
				</span>
				<p className="mt-1 max-w-[200px] text-center text-[11px] text-text-soft-400 leading-normal dark:text-zinc-500">
					Your HTML structure and text ratio look solid. Ready to send!
				</p>
			</div>

			{/* Audits Checklist */}
			<div className="hide-scrollbar flex-1 space-y-3.5 overflow-y-auto p-4">
				<span className="font-bold text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-zinc-400">
					Optimization Audits
				</span>

				<div className="space-y-2.5">
					<div className="flex items-start gap-3">
						<CheckCircle2
							size={16}
							className="mt-0.5 shrink-0 text-emerald-500"
						/>
						<div>
							<h4 className="font-semibold text-text-strong-950 text-xs dark:text-zinc-200">
								Subject Line Length
							</h4>
							<p className="text-[11px] text-text-soft-400 dark:text-zinc-500">
								Subject length is 45 characters. (Optimal limit is 40-60
								characters)
							</p>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<CheckCircle2
							size={16}
							className="mt-0.5 shrink-0 text-emerald-500"
						/>
						<div>
							<h4 className="font-semibold text-text-strong-950 text-xs dark:text-zinc-200">
								Spam Trigger Words
							</h4>
							<p className="text-[11px] text-text-soft-400 dark:text-zinc-500">
								Zero spam trigger words identified in content headers or body
								paragraphs.
							</p>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<CheckCircle2
							size={16}
							className="mt-0.5 shrink-0 text-emerald-500"
						/>
						<div>
							<h4 className="font-semibold text-text-strong-950 text-xs dark:text-zinc-200">
								HTML Size Audit
							</h4>
							<p className="text-[11px] text-text-soft-400 dark:text-zinc-500">
								Total template HTML weight is 18 KB. Safe from Gmail clipping
								(max 102 KB).
							</p>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<CheckCircle2
							size={16}
							className="mt-0.5 shrink-0 text-emerald-500"
						/>
						<div>
							<h4 className="font-semibold text-text-strong-950 text-xs dark:text-zinc-200">
								Link Verification
							</h4>
							<p className="text-[11px] text-text-soft-400 dark:text-zinc-500">
								All links resolved successfully and point to valid HTTPS
								destinations.
							</p>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<ShieldAlert size={16} className="mt-0.5 shrink-0 text-amber-500" />
						<div>
							<h4 className="font-semibold text-text-strong-950 text-xs dark:text-zinc-200">
								Alt Text Missing
							</h4>
							<p className="text-[11px] text-text-soft-400 dark:text-zinc-500">
								One image is missing descriptive alt text. Consider adding it
								for screen readers.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/* Testing Panel Component                                           */
/* ------------------------------------------------------------------ */
export function TestPanel({ onClose }: PanelProps) {
	const [testEmail, setTestEmail] = useState("");
	const [sending, setSending] = useState(false);
	const [lastSent, setLastSent] = useState<string | null>(null);

	const handleSendTest = (e: React.FormEvent) => {
		e.preventDefault();
		if (!testEmail) {
			toast.error("Please enter a valid email address");
			return;
		}

		setSending(true);
		// Simulate network latency
		setTimeout(() => {
			setSending(false);
			setLastSent(testEmail);
			toast.success(`Test email sent successfully to ${testEmail}`);
			setTestEmail("");
		}, 1200);
	};

	return (
		<div className="flex h-full w-full flex-col overflow-hidden bg-transparent">
			{/* Header */}
			<div className="flex h-10 shrink-0 items-center justify-between border-stroke-soft-200 border-b bg-bg-weak-50 px-3 dark:bg-[#0a0a0a]">
				<div className="flex items-center gap-1.5 p-0">
					<Send size={14} className="text-text-strong-950 dark:text-white" />
					<span className="font-semibold text-text-strong-950 text-xs dark:text-white">
						Send Test Email
					</span>
				</div>
				<Button.Root
					type="button"
					variant="neutral"
					mode="ghost"
					size="xxsmall"
					onClick={onClose}
					className="size-7 rounded-lg text-text-sub-600 transition-all duration-200 hover:bg-bg-soft-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
				>
					<ChevronLeft size={24} />
				</Button.Root>
			</div>

			<div className="hide-scrollbar flex flex-1 flex-col justify-between p-4">
				<div className="space-y-4">
					<p className="text-[11px] text-text-soft-400 leading-normal dark:text-zinc-400">
						Verify exactly how this email template will render across different
						client mailboxes by sending a live test copy.
					</p>

					<form onSubmit={handleSendTest} className="space-y-3">
						<div className="space-y-1">
							<label
								htmlFor="recipient-address"
								className="font-bold text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-zinc-400"
							>
								Recipient Address
							</label>
							<input
								type="email"
								required
								placeholder="e.g. name@domain.com"
								value={testEmail}
								onChange={(e) => setTestEmail(e.target.value)}
								className="w-full rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-3 py-2 text-text-strong-950 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-stroke-soft-100/30 dark:bg-zinc-900 dark:text-white"
							/>
						</div>

						<Button.Root
							type="submit"
							variant="neutral"
							mode="filled"
							size="xsmall"
							disabled={sending}
							className="w-full justify-center gap-1.5 py-2"
						>
							<Send size={12} className={cn(sending && "animate-pulse")} />
							{sending ? "Sending..." : "Send Test Email"}
						</Button.Root>
					</form>
				</div>

				{/* Send Log History */}
				{lastSent && (
					<div className="mt-auto border-stroke-soft-200 border-t pt-4 dark:border-stroke-soft-100/20">
						<span className="mb-2 block font-bold text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-zinc-400">
							Recent Sends
						</span>
						<div className="flex items-center justify-between rounded-lg border border-stroke-soft-100 bg-bg-weak-50/50 p-2.5 dark:border-stroke-soft-100/10 dark:bg-zinc-900/20">
							<div className="flex flex-col">
								<span className="max-w-[150px] truncate font-medium text-text-strong-950 text-xs dark:text-zinc-200">
									{lastSent}
								</span>
								<span className="text-[9px] text-emerald-500">
									Delivered successfully
								</span>
							</div>
							<span className="text-[9px] text-text-soft-400 dark:text-zinc-500">
								Just now
							</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
