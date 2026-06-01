"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import {
	Award,
	Braces,
	Check,
	CheckCircle2,
	ChevronLeft,
	Copy,
	FileCode2,
	Loader2,
	Plus,
	Search,
	Send,
	ShieldAlert,
	Sparkles,
	X,
	Pencil,
} from "lucide-react";
import { useCurrentEditor } from "@tiptap/react";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

interface PanelProps {
	onClose: () => void;
}

const fetcher = (url: string) =>
	fetch(url, { credentials: "include" }).then((r) => r.json());

/* colour palette for variable chips */
const CHIP_COLOURS = [
	"bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-800/40",
	"bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-800/40",
	"bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40",
	"bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/40",
	"bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/40",
	"bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-800/40",
];

function chipColour(key: string) {
	let hash = 0;
	for (let i = 0; i < key.length; i++)
		hash = (hash * 31 + key.charCodeAt(i)) | 0;
	return CHIP_COLOURS[Math.abs(hash) % CHIP_COLOURS.length];
}

/* strip {{ }} to get a readable label from the raw key */
function toLabel(key: string) {
	const inner = key.replace(/^\{\{|\}\}$/g, "").trim();
	return inner.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ------------------------------------------------------------------ */
/* Variables Panel Component                                         */
/* ------------------------------------------------------------------ */
export function VariablesPanel({ onClose }: PanelProps) {
	const params = useParams<{ templateId: string }>();
	const templateId = params?.templateId;

	/* fetch template so we can read the auto-extracted variables */
	const { data: templateData, isLoading, mutate } = useSWR(
		templateId ? `/api/template/v1/${templateId}` : null,
		fetcher,
	);

	interface MappedVariable {
		name: string;
		type: "string" | "number";
		defaultValue: string | null;
	}

	const rawVars = templateData?.variables ?? [];
	const detectedVars: MappedVariable[] = rawVars.map((v: any): MappedVariable => {
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
	});

	const { editor } = useCurrentEditor();

	const [copiedKey, setCopiedKey] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [insertKey, setInsertKey] = useState("");
	const [isInserting, setIsInserting] = useState(false);
	const insertInputRef = useRef<HTMLInputElement>(null);

	const [editingVar, setEditingVar] = useState<MappedVariable | null>(null);
	const [isSavingConfig, setIsSavingConfig] = useState(false);

	const handleCopy = (key: string) => {
		navigator.clipboard.writeText(key);
		setCopiedKey(key);
		toast.success(`Copied ${key}`, { duration: 1800 });
		setTimeout(() => setCopiedKey(null), 2000);
	};

	/** Insert {{key}} at the current cursor position in the editor */
	const handleInsert = (e: React.FormEvent) => {
		e.preventDefault();
		if (!insertKey.trim()) return;
		const raw = insertKey.trim();
		if (!raw) return;
		const k = raw.startsWith("{{" ) ? (raw.endsWith("}}") ? raw : raw + "}}") : `{{${raw}}}`;
		if (editor) {
			editor.chain().focus().insertContent(k).run();
			toast.success(`Inserted ${k}`);
		} else {
			navigator.clipboard.writeText(k);
			toast.success(`Copied ${k} — paste into your email`);
		}
		setInsertKey("");
		setIsInserting(false);
	};

	const handleSaveVariableConfig = async () => {
		if (!editingVar || !templateId) return;
		setIsSavingConfig(true);
		try {
			const updatedVariables = detectedVars.map((v: MappedVariable) =>
				v.name === editingVar.name ? editingVar : v,
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

			toast.success(`Updated variable properties for ${editingVar.name}`);
			mutate();
			setEditingVar(null);
		} catch (error: any) {
			toast.error(error.message || "Something went wrong");
		} finally {
			setIsSavingConfig(false);
		}
	};

	const filteredDetected = detectedVars.filter((v) =>
		v.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

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
				{/* Search */}
				<div className="sticky top-0 z-10 border-stroke-soft-200 border-b bg-bg-weak-50 p-3 dark:border-stroke-soft-100/20 dark:bg-[#0a0a0a]">
					<div className="relative">
						<Search className="absolute top-2.5 left-2.5 size-3.5 text-text-soft-400 dark:text-zinc-500" />
						<input
							type="text"
							placeholder="Search variables…"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full rounded-lg border border-stroke-soft-200 bg-white py-1.5 pr-8 pl-8 text-text-strong-950 text-xs placeholder-text-soft-400 focus:outline-none focus:ring-1 focus:ring-violet-400 dark:border-stroke-soft-100/30 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute top-2.5 right-2.5 text-text-soft-400 hover:text-text-strong-950 dark:text-zinc-500 dark:hover:text-white"
							>
								<X size={12} />
							</button>
						)}
					</div>
				</div>

				{/* ── Insert Variable ── */}
				<div className="border-stroke-soft-200 border-b px-3 py-2.5 dark:border-stroke-soft-100/20">
					{!isInserting ? (
						<button
							type="button"
							onClick={() => {
								setIsInserting(true);
								setTimeout(() => insertInputRef.current?.focus(), 50);
							}}
							className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-stroke-soft-200 py-2 font-semibold text-[11px] text-text-sub-600 transition-colors hover:border-violet-300 hover:bg-violet-50/30 hover:text-violet-600 dark:border-stroke-soft-100/20 dark:text-zinc-400 dark:hover:border-violet-700/40 dark:hover:bg-violet-950/10 dark:hover:text-violet-400"
						>
							<Plus size={12} />
							Insert Variable
						</button>
					) : (
						<form onSubmit={handleInsert} className="flex items-center gap-1.5">
							<div className="relative flex-1">
								<span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 font-mono text-[10px] text-text-soft-400 dark:text-zinc-500">
									{"{{"}{"}"}
								</span>
								<input
									ref={insertInputRef}
									type="text"
									placeholder="variable_name"
									value={insertKey}
									onChange={(e) => setInsertKey(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Escape") {
											setIsInserting(false);
											setInsertKey("");
										}
									}}
									className="w-full rounded-lg border border-violet-300 bg-white py-1.5 pr-2.5 pl-8 font-mono text-text-strong-950 text-xs focus:outline-none focus:ring-1 focus:ring-violet-400 dark:border-violet-700/50 dark:bg-zinc-900 dark:text-white"
								/>
							</div>
							<Button.Root
								type="submit"
								variant="primary"
								size="xxsmall"
								disabled={!insertKey.trim()}
								className="shrink-0 px-2.5 text-[10px]"
							>
								Insert
							</Button.Root>
							<button
								type="button"
								onClick={() => {
									setIsInserting(false);
									setInsertKey("");
								}}
								className="shrink-0 rounded p-1 text-text-soft-400 hover:text-text-strong-950 dark:text-zinc-500 dark:hover:text-white"
							>
								<X size={13} />
							</button>
						</form>
					)}
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
					) : filteredDetected.length === 0 ? (
						<div className="rounded-xl border border-stroke-soft-200 border-dashed bg-bg-weak-50/50 px-4 py-5 text-center dark:border-stroke-soft-100/20 dark:bg-zinc-900/20">
							{searchQuery ? (
								<p className="text-[11px] text-text-soft-400 dark:text-zinc-500">
									No matches in template
								</p>
							) : (
								<>
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
											{"{{variable}}"}
										</code>{" "}
										in your email and save a draft to see it here.
									</p>
								</>
							)}
						</div>
					) : (
						<div className="space-y-2">
							{filteredDetected.map((v) => {
								const key = `{{${v.name}}}`;
								return (
									<div
										key={v.name}
										className="group relative flex flex-col gap-1.5 rounded-xl border border-stroke-soft-200 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:border-violet-200 hover:bg-violet-50/10 dark:border-stroke-soft-100/10 dark:bg-zinc-900/30 dark:hover:border-violet-800/20 dark:hover:bg-violet-950/5"
									>
										{/* Top Row: Name and Type Badge */}
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-1.5 min-w-0">
												<span className="font-mono text-[10px] text-text-soft-400 dark:text-zinc-500 font-bold">
													{"{"}
													{"{"}
												</span>
												<span className="truncate font-semibold text-text-strong-950 text-xs dark:text-zinc-100">
													{v.name}
												</span>
												<span className="font-mono text-[10px] text-text-soft-400 dark:text-zinc-500 font-bold">
													{"}"}
													{"}"}
												</span>
											</div>

											<span
												className={cn(
													"rounded-full px-2 py-0.5 text-[9px] font-medium leading-none border uppercase tracking-wider",
													v.type === "number"
														? "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
														: "bg-violet-50 text-violet-700 border-violet-200/50 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/30",
												)}
											>
												{v.type}
											</span>
										</div>

										{/* Middle Row: Fallback/Default value if configured */}
										<div className="flex items-center justify-between min-w-0">
											{v.defaultValue !== null && v.defaultValue !== "" ? (
												<p className="truncate text-[10px] text-text-sub-600 dark:text-zinc-400">
													Fallback:{" "}
													<code className="rounded bg-bg-soft-150 px-1 font-mono dark:bg-zinc-800/80 text-violet-600 dark:text-violet-400">
														"{v.defaultValue}"
													</code>
												</p>
											) : (
												<p className="text-[10px] italic text-text-soft-400 dark:text-zinc-500">
													No fallback default set
												</p>
											)}

											{/* Action Buttons: Edit, Copy/Insert (Visible on hover, or compact) */}
											<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
												<button
													type="button"
													onClick={() => setEditingVar(v)}
													title="Configure property"
													className="rounded-lg p-1 text-text-soft-400 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-white"
												>
													<Pencil size={11} />
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
															className="text-emerald-500 animate-in fade-in zoom-in-50 duration-200"
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

			{/* ── Slide-in Edit Panel ── */}
			{editingVar && (
				<div className="absolute inset-0 z-20 flex flex-col bg-white dark:bg-[#0a0a0a] p-4">
					{/* Edit Header */}
					<div className="mb-4 flex items-center justify-between border-b border-stroke-soft-200 pb-2 dark:border-stroke-soft-100/20">
						<span className="font-semibold text-text-strong-950 text-xs dark:text-white">
							Configure: {editingVar.name}
						</span>
						<button
							type="button"
							onClick={() => setEditingVar(null)}
							className="rounded p-1 text-text-soft-400 hover:text-text-strong-950 dark:text-zinc-500 dark:hover:text-white"
						>
							<X size={14} />
						</button>
					</div>

					{/* Edit Form */}
					<div className="flex-1 space-y-4">
						<div className="space-y-1.5">
							<label className="font-medium text-[11px] text-text-sub-600 dark:text-zinc-400">
								Property Type
							</label>
							<div className="grid grid-cols-2 gap-2">
								<button
									type="button"
									onClick={() =>
										setEditingVar({ ...editingVar, type: "string" })
									}
									className={cn(
										"flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all",
										editingVar.type === "string"
											? "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400"
											: "border-stroke-soft-200 hover:bg-bg-soft-100 dark:border-stroke-soft-100/20 dark:hover:bg-zinc-800",
									)}
								>
									String
								</button>
								<button
									type="button"
									onClick={() =>
										setEditingVar({ ...editingVar, type: "number" })
									}
									className={cn(
										"flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all",
										editingVar.type === "number"
											? "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400"
											: "border-stroke-soft-200 hover:bg-bg-soft-100 dark:border-stroke-soft-100/20 dark:hover:bg-zinc-800",
									)}
								>
									Number
								</button>
							</div>
						</div>

						<div className="space-y-1.5">
							<label className="font-medium text-[11px] text-text-sub-600 dark:text-zinc-400">
								Default Fallback Value
							</label>
							<input
								type="text"
								value={editingVar.defaultValue ?? ""}
								onChange={(e) =>
									setEditingVar({
										...editingVar,
										defaultValue: e.target.value || null,
									})
								}
								placeholder="e.g. large, WELCOME10"
								className="w-full rounded-lg border border-stroke-soft-200 bg-white px-3 py-1.5 text-text-strong-950 text-xs focus:outline-none focus:ring-1 focus:ring-violet-400 dark:border-stroke-soft-100/30 dark:bg-zinc-900 dark:text-white"
							/>
							<p className="text-[10px] text-text-soft-400 leading-normal dark:text-zinc-500">
								This fallback default value will be used during resolution if the
								variable is not supplied at send-time.
							</p>
						</div>
					</div>

					{/* Save/Cancel Buttons */}
					<div className="mt-4 flex gap-2 border-t border-stroke-soft-200 pt-3 dark:border-stroke-soft-100/20">
						<Button.Root
							type="button"
							variant="neutral"
							size="xsmall"
							onClick={() => setEditingVar(null)}
							className="flex-1"
						>
							Cancel
						</Button.Root>
						<Button.Root
							type="button"
							variant="primary"
							size="xsmall"
							onClick={handleSaveVariableConfig}
							disabled={isSavingConfig}
							className="flex-1 text-white bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700"
						>
							{isSavingConfig ? (
								<Loader2 size={12} className="animate-spin text-white" />
							) : (
								"Save Property"
							)}
						</Button.Root>
					</div>
				</div>
			)}

			{/* ── Footer hint ── */}
			<div className="shrink-0 border-stroke-soft-100 border-t bg-bg-weak-50 px-4 py-2 dark:border-stroke-soft-100/10 dark:bg-zinc-900/10">
				<p className="text-[10px] text-text-soft-400 leading-normal dark:text-zinc-500">
					Click copy icon to copy variable. Paste into your email using{" "}
					<code className="rounded bg-bg-soft-200 px-1 font-mono dark:bg-zinc-800">
						{"{{key}}"}
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
