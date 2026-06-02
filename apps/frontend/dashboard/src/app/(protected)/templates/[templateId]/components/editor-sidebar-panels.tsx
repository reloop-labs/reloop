"use client";

import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { useCurrentEditor } from "@tiptap/react";
import { motion } from "framer-motion";
import {
	AlertCircle,
	Award,
	Braces,
	Check,
	CheckCircle2,
	ChevronLeft,
	Copy,
	Loader2,
	Pencil,
	Plus,
	Send,
	ShieldAlert,
	Sparkles,
	Trash2,
	X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
		<div className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/10 dark:bg-[#0a0a0a]">
			{/* ── Header ── */}
			<div className="flex shrink-0 items-center justify-between pt-3 pr-4 pb-3 pl-6">
				<h2 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">
					Variable
				</h2>
				<button
					type="button"
					onClick={() => onClose()}
					className="rounded-lg p-1.5 text-zinc-400 transition-all hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
				>
					<X size={18} />
				</button>
			</div>

			{/* ── Scrollable Body ── */}
			<div className="hide-scrollbar mt-2 flex-1 overflow-y-auto">
				{isLoading ? (
					<div className="flex items-center justify-center py-6">
						<Loader2
							size={14}
							className="animate-spin text-text-disabled-300 dark:text-zinc-600"
						/>
					</div>
				) : detectedVars.length === 0 ? (
					<div className="rounded-xl px-4 py-5 text-center">
						<div className="mx-auto flex size-8 items-center justify-center">
							<Braces size={14} />
						</div>
						<p className="font-medium text-text-strong-950 text-xs dark:text-zinc-300">
							No variables yet
						</p>
						<p className="mt-2 mb-4 text-[11px] text-text-soft-400 leading-normal dark:text-zinc-500">
							Type{" "}
							<code className="rounded bg-bg-soft-200 px-1 font-mono dark:bg-zinc-800">
								{"{{{variable}}}"}
							</code>{" "}
							in your email
						</p>
						<Button.Root
							type="button"
							variant="neutral"
							size="xxsmall"
							onClick={() => setIsCreatingVar(true)}
						>
							<Plus size={12} />
							Create Variable
						</Button.Root>
					</div>
				) : (
					<div className="space-y-2 px-5">
						{detectedVars.map((v) => {
							const key = `{{{${v.name}}}}`;
							return (
								<div
									key={v.name}
									className="group relative flex flex-col gap-1.5 rounded-2xl border border-stroke-soft-200 bg-white p-3 transition-all hover:border-stroke-soft-300 hover:bg-bg-weak-50 dark:border-stroke-soft-100/10 dark:bg-zinc-900/30 dark:hover:border-stroke-soft-100/20 dark:hover:bg-zinc-800/10"
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
										<div className="flex items-center">
											<Button.Root
												type="button"
												variant="neutral"
												mode="ghost"
												size="xxsmall"
												onClick={() => setEditingVar(v)}
												title="Configure variable"
												className="size-8 rounded-lg text-text-sub-600 transition-all duration-200 hover:bg-bg-soft-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
											>
												<Pencil size={15} />
											</Button.Root>
											<Button.Root
												type="button"
												variant="neutral"
												mode="ghost"
												size="xxsmall"
												onClick={() => setDeletingVar(v)}
												title="Delete variable"
												className="size-8 rounded-lg text-text-sub-600 transition-all duration-200 hover:bg-error-lighter hover:text-error-base dark:text-zinc-400 dark:hover:bg-error-base/10 dark:hover:text-error-base"
											>
												<Trash2 size={15} />
											</Button.Root>
											<Button.Root
												type="button"
												variant="neutral"
												mode="ghost"
												size="xxsmall"
												onClick={() => handleCopy(key)}
												title="Copy placeholder"
												className="size-8 rounded-lg text-text-sub-600 transition-all duration-200 hover:bg-bg-soft-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
											>
												{copiedKey === key ? (
													<Check
														size={15}
														className="fade-in zoom-in-50 animate-in text-emerald-500 duration-200"
													/>
												) : (
													<Copy size={15} />
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

/* ------------------------------------------------------------------ */
/* Score Panel Component                                             */
/* ------------------------------------------------------------------ */

interface AuditItem {
	id: string;
	title: string;
	description: string;
	category: "deliverability" | "content" | "technical";
	status: "passed" | "warning";
}

const AUDITS: AuditItem[] = [
	{
		id: "subject",
		title: "Subject Line Length",
		description:
			"Subject length is 45 characters. (Optimal limit is 40-60 characters)",
		category: "content",
		status: "passed",
	},
	{
		id: "spam",
		title: "Spam Trigger Words",
		description:
			"Zero spam trigger words identified in content headers or body paragraphs.",
		category: "deliverability",
		status: "passed",
	},
	{
		id: "size",
		title: "HTML Size Audit",
		description:
			"Total template HTML weight is 18 KB. Safe from Gmail clipping (max 102 KB).",
		category: "technical",
		status: "passed",
	},
	{
		id: "links",
		title: "Link Verification",
		description:
			"All links resolved successfully and point to valid HTTPS destinations.",
		category: "technical",
		status: "passed",
	},
	{
		id: "alt",
		title: "Alt Text Missing",
		description:
			"One image is missing descriptive alt text. Consider adding it for screen readers.",
		category: "content",
		status: "warning",
	},
];

export function ScorePanel({ onClose }: PanelProps) {
	const [activeTab, setActiveTab] = useState<"all" | "passed" | "warning">(
		"all",
	);

	const score = 98;
	const radius = 34;
	const strokeWidth = 5;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (score / 100) * circumference;

	const totalCount = AUDITS.length;
	const passedCount = AUDITS.filter((a) => a.status === "passed").length;
	const warningCount = AUDITS.filter((a) => a.status === "warning").length;

	const filteredAudits = AUDITS.filter((audit) => {
		if (activeTab === "passed") return audit.status === "passed";
		if (activeTab === "warning") return audit.status === "warning";
		return true;
	});

	return (
		<div className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/10 dark:bg-[#0a0a0a]">
			{/* Header */}
			<div className="flex shrink-0 items-center justify-between pt-3 pr-4 pb-3 pl-6">
				<h2 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">
					Template Score
				</h2>
				<button
					type="button"
					onClick={() => onClose()}
					className="rounded-lg p-1.5 text-zinc-400 transition-all hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
				>
					<X size={18} />
				</button>
			</div>

			{/* Score Progress Area */}
			<div className="flex shrink-0 flex-col items-center border-stroke-soft-200 border-b bg-bg-weak-50/50 p-5 dark:border-stroke-soft-100/10 dark:bg-[#0c0c0c]/30">
				<div className="relative flex size-24 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-950 dark:ring-zinc-800/40">
					{/* SVG progress ring */}
					<svg className="-rotate-90 absolute inset-0 size-full">
						{/* Background Track */}
						<circle
							cx="48"
							cy="48"
							r={radius}
							fill="transparent"
							stroke="currentColor"
							strokeWidth={strokeWidth}
							className="text-zinc-100 dark:text-zinc-800/50"
						/>
						{/* Active track with gradient */}
						<motion.circle
							cx="48"
							cy="48"
							r={radius}
							fill="transparent"
							stroke="url(#scoreGradient)"
							strokeWidth={strokeWidth}
							strokeDasharray={circumference}
							initial={{ strokeDashoffset: circumference }}
							animate={{ strokeDashoffset }}
							transition={{ duration: 1.2, ease: "easeOut" }}
							strokeLinecap="round"
						/>
						<defs>
							<linearGradient
								id="scoreGradient"
								x1="0%"
								y1="0%"
								x2="100%"
								y2="100%"
							>
								<stop offset="0%" stopColor="#10B981" />
								<stop offset="100%" stopColor="#059669" />
							</linearGradient>
						</defs>
					</svg>

					{/* Inner Score Text */}
					<div className="absolute flex flex-col items-center justify-center">
						<span className="font-extrabold text-2xl text-emerald-600 leading-none dark:text-emerald-400">
							98
						</span>
						<span className="mt-0.5 text-[10px] text-text-soft-400 dark:text-zinc-500">
							/100
						</span>
					</div>
				</div>

				<span className="mt-3.5 flex items-center gap-1.5 font-semibold text-sm text-text-strong-950 dark:text-white">
					<Sparkles size={14} className="animate-pulse text-emerald-500" />
					Excellent Deliverability
				</span>
				<p className="mt-1 max-w-[220px] text-center text-[11px] text-text-soft-400 leading-normal dark:text-zinc-500">
					Your HTML structure and text ratio look solid. Ready to send!
				</p>
			</div>

			{/* Interactive Category Tabs */}
			<div className="px-5 pt-4">
				<div className="flex rounded-xl bg-bg-soft-100 p-1 dark:bg-zinc-900/60">
					<button
						type="button"
						onClick={() => setActiveTab("all")}
						className={cn(
							"flex-grow rounded-lg py-1.5 text-center font-semibold text-[11px] transition-all",
							activeTab === "all"
								? "bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-white"
								: "text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200",
						)}
					>
						All <span className="ml-0.5 opacity-60">({totalCount})</span>
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("passed")}
						className={cn(
							"flex-grow rounded-lg py-1.5 text-center font-semibold text-[11px] transition-all",
							activeTab === "passed"
								? "bg-white text-emerald-600 shadow-xs dark:bg-zinc-800 dark:text-emerald-400"
								: "text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200",
						)}
					>
						Passed <span className="ml-0.5 opacity-60">({passedCount})</span>
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("warning")}
						className={cn(
							"flex-grow rounded-lg py-1.5 text-center font-semibold text-[11px] transition-all",
							activeTab === "warning"
								? "bg-white text-amber-600 shadow-xs dark:bg-zinc-800 dark:text-amber-400"
								: "text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200",
						)}
					>
						Warnings <span className="ml-0.5 opacity-60">({warningCount})</span>
					</button>
				</div>
			</div>

			{/* Audits Checklist */}
			<div className="hide-scrollbar flex-1 overflow-y-auto px-5 py-4">
				<div className="space-y-2.5">
					{filteredAudits.map((audit) => (
						<div
							key={audit.id}
							className="group flex items-start gap-3 rounded-2xl border border-stroke-soft-200 bg-white p-3.5 transition-all hover:border-stroke-soft-300 hover:shadow-xs dark:border-stroke-soft-100/10 dark:bg-zinc-900/30 dark:hover:border-stroke-soft-100/20"
						>
							{audit.status === "passed" ? (
								<CheckCircle2
									size={16}
									className="mt-0.5 shrink-0 text-emerald-500"
								/>
							) : (
								<ShieldAlert
									size={16}
									className="mt-0.5 shrink-0 text-amber-500"
								/>
							)}
							<div className="min-w-0 flex-1">
								<div className="flex items-center justify-between gap-2">
									<h4 className="truncate font-semibold text-text-strong-950 text-xs dark:text-zinc-200">
										{audit.title}
									</h4>
									<Badge.Root
										size="small"
										variant="lighter"
										color={audit.status === "passed" ? "green" : "orange"}
										className="h-[18px] shrink-0 rounded-full px-1.5 font-semibold text-[9px] capitalize"
									>
										{audit.status}
									</Badge.Root>
								</div>
								<p className="mt-1 text-[11px] text-text-soft-400 leading-normal dark:text-zinc-500">
									{audit.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function formatRelativeTime(dateStr: string) {
	const date = new Date(dateStr);
	const now = new Date();
	const diff = now.getTime() - date.getTime();

	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (seconds < 60) return "just now";
	if (minutes < 60) {
		return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
	}
	if (hours < 24) {
		return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
	}
	if (days === 1) {
		return "Yesterday";
	}
	if (days < 7) {
		return `${days} days ago`;
	}

	const day = date.getDate();
	const month = date.toLocaleDateString("en-US", { month: "short" });
	const year = date.getFullYear();
	const currentYear = now.getFullYear();

	if (year === currentYear) {
		return `${day} ${month}`;
	}
	return `${day} ${month}, ${year}`;
}

/* ------------------------------------------------------------------ */
/* Testing Panel Component                                           */
/* ------------------------------------------------------------------ */
export function TestPanel({ onClose }: PanelProps) {
	const params = useParams<{ templateId: string }>();
	const templateId = params?.templateId;

	const { editor } = useCurrentEditor();
	const { subject, fromEmail } = useEditorStore();

	const [testEmail, setTestEmail] = useState("");
	const [sending, setSending] = useState(false);

	interface RecentSend {
		email: string;
		timestamp: Date;
		status: "success" | "error";
		error?: string;
	}
	const [recentSends, setRecentSends] = useState<RecentSend[]>([]);

	// Fetch template data to read variables
	const { data: templateData } = useSWR<any>(
		templateId ? `/api/template/v1/${templateId}` : null,
		fetcher,
	);

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

	// State for variable values entered by the user
	const [variableValues, setVariableValues] = useState<Record<string, string>>(
		{},
	);

	// Initialize variableValues with default values when templateData is fetched
	useEffect(() => {
		if (detectedVars && detectedVars.length > 0) {
			const initialValues: Record<string, string> = {};
			for (const v of detectedVars) {
				if (variableValues[v.name] === undefined) {
					initialValues[v.name] = v.defaultValue ?? "";
				} else {
					initialValues[v.name] = variableValues[v.name] ?? "";
				}
			}
			setVariableValues(initialValues);
		}
	}, [templateData]);

	const handleVariableChange = (name: string, value: string) => {
		setVariableValues((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSendTest = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!testEmail) {
			toast.error("Please enter a valid email address");
			return;
		}

		if (!templateId) {
			toast.error("Template ID not found");
			return;
		}

		setSending(true);

		try {
			// Compile current visual editor content to HTML if editor is present
			const currentHtml = editor ? editor.getHTML() : undefined;

			// Send POST request to backend test endpoint
			const response = await fetch(`/api/template/v1/${templateId}/test`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					to: testEmail,
					fromEmail: fromEmail || undefined,
					subject: subject || undefined,
					html: currentHtml,
					variables: variableValues,
				}),
				credentials: "include",
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(
					result.why || result.message || "Failed to send test email",
				);
			}

			setRecentSends((prev) => [
				{ email: testEmail, timestamp: new Date(), status: "success" },
				...prev.slice(0, 2),
			]);
			toast.success(`Test email sent successfully to ${testEmail}`);
			setTestEmail("");
		} catch (error: any) {
			console.error("Error sending test email:", error);
			const errMsg = error.message || "Failed to send test email";
			setRecentSends((prev) => [
				{
					email: testEmail,
					timestamp: new Date(),
					status: "error",
					error: errMsg,
				},
				...prev.slice(0, 2),
			]);
			toast.error(errMsg);
		} finally {
			setSending(false);
		}
	};

	return (
		<div className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/10 dark:bg-[#0a0a0a]">
			{/* ── Header ── */}
			<div className="flex shrink-0 items-center justify-between pt-3 pr-4 pb-3 pl-6">
				<h2 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">
					Send Test Email
				</h2>
				<button
					type="button"
					onClick={onClose}
					className="rounded-lg p-1.5 text-zinc-400 transition-all hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
				>
					<X size={18} />
				</button>
			</div>

			<div className="hide-scrollbar flex flex-1 flex-col justify-between overflow-y-auto px-5 pb-5">
				<div className="space-y-5">
					<p className="text-paragraph-sm text-text-sub-600 leading-normal dark:text-zinc-400">
						Verify exactly how this email template will render across different
						client mailboxes by sending a live test copy.
					</p>

					<form onSubmit={handleSendTest} className="space-y-5">
						{!fromEmail ? (
							<div className="flex flex-col gap-2.5 rounded-2xl border border-rose-200/60 bg-rose-50/50 p-3.5 dark:border-rose-900/30 dark:bg-rose-950/10">
								<div className="flex items-start gap-2.5">
									<AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
									<div className="flex flex-col gap-1">
										<span className="font-semibold text-rose-700 text-xs dark:text-rose-300">
											Missing From Address
										</span>
										<p className="text-[11px] text-rose-600/90 leading-normal dark:text-rose-400/80">
											You must configure a valid "From Email" in the Send Details panel before you can send a test email.
										</p>
									</div>
								</div>
							</div>
						) : (
							<div className="flex flex-col gap-1.5">
								<Label.Root htmlFor="recipient-address">
									Recipient Address
									<Label.Asterisk />
								</Label.Root>
								<Input.Root size="small" className="rounded-xl">
									<Input.Wrapper>
										<Input.Input
											id="recipient-address"
											type="email"
											required
											placeholder="e.g. name@domain.com"
											value={testEmail}
											onChange={(e) => setTestEmail(e.target.value)}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
						)}

						{detectedVars.length > 0 && (
							<div className="space-y-4 border-stroke-soft-200 border-t pt-4 dark:border-stroke-soft-100/10">
								<span className="block font-bold text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-zinc-400">
									Template Variables
								</span>
								<div className="hide-scrollbar max-h-[250px] space-y-3.5 overflow-y-auto pr-1">
									{detectedVars.map((v) => (
										<div key={v.name} className="flex flex-col gap-1.5">
											<div className="flex items-center justify-between">
												<Label.Root
													htmlFor={v.name}
													className="font-semibold text-text-strong-950 text-xs dark:text-zinc-300"
												>
													{v.name}
												</Label.Root>
												<Badge.Root
													size="small"
													variant="lighter"
													color={v.type === "number" ? "purple" : "blue"}
													className="h-[18px] rounded-full px-1.5 font-semibold text-[10px] capitalize"
												>
													{v.type}
												</Badge.Root>
											</div>
											<Input.Root size="small" className="rounded-xl">
												<Input.Wrapper>
													<Input.Input
														id={v.name}
														type={v.type === "number" ? "number" : "text"}
														placeholder={
															v.defaultValue
																? `Default: ${v.defaultValue}`
																: "Enter value..."
														}
														value={variableValues[v.name] ?? ""}
														onChange={(e) =>
															handleVariableChange(v.name, e.target.value)
														}
													/>
												</Input.Wrapper>
											</Input.Root>
										</div>
									))}
								</div>
							</div>
						)}

						<Button.Root
							type="submit"
							variant="primary"
							mode="filled"
							size="small"
							disabled={sending || !fromEmail}
							className="w-full justify-center gap-1.5 rounded-xl py-2.5 font-medium"
						>
							{sending ? (
								<>
									<Loader2 size={13} className="animate-spin" />
									Sending...
								</>
							) : (
								<>
									<Send size={13} />
									Send Test Email
								</>
							)}
						</Button.Root>
					</form>
				</div>

				{/* Send Log History */}
				{recentSends.length > 0 && (
					<div className="mt-6 border-stroke-soft-200 border-t pt-4 dark:border-stroke-soft-100/20">
						<span className="mb-2.5 block font-bold text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-zinc-400">
							Recent Sends
						</span>
						<div className="space-y-2">
							{recentSends.map((send, idx) => (
								<div
									key={idx}
									className="flex items-center justify-between rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-2.5 dark:border-stroke-soft-100/10 dark:bg-zinc-900/20"
								>
									<div className="flex min-w-0 flex-col">
										<span className="truncate font-medium text-text-strong-950 text-xs dark:text-zinc-200">
											{send.email}
										</span>
										<span
											className={cn(
												"flex items-center gap-1 font-semibold text-[9px]",
												send.status === "success"
													? "text-emerald-500"
													: "text-error-base",
											)}
										>
											{send.status === "success" ? (
												<>
													<CheckCircle2 size={10} className="shrink-0" />
													Delivered successfully
												</>
											) : (
												<>
													<AlertCircle size={10} className="shrink-0" />
													{send.error || "Failed to send"}
												</>
											)}
										</span>
									</div>
									<span className="shrink-0 text-[9px] text-text-soft-400 dark:text-zinc-500">
										{formatRelativeTime(send.timestamp.toISOString())}
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
