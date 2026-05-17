"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Tooltip from "@reloop/ui/tooltip";
import { useCurrentEditor } from "@tiptap/react";
import { ChevronLeft, Clock, Loader2, RotateCcw, Save } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { useEditorStore } from "./use-editor-store";

interface TemplateVersion {
	id: string;
	templateId: string;
	version: number;
	subject: string | null;
	description: string | null;
	content: unknown[];
	variables: string[];
	renderedHtml: string | null;
	createdByUserId: string;
	createdAt: string;
}

const fetcher = (url: string) =>
	fetch(url, { credentials: "include" }).then((res) => res.json());

function formatRelativeTime(dateStr: string) {
	const date = new Date(dateStr);
	const now = new Date();
	const diff = now.getTime() - date.getTime();

	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (seconds < 60) return "just now";
	if (minutes < 60) return `${minutes}m ago`;
	if (hours < 24) return `${hours}h ago`;
	if (days < 7) return `${days}d ago`;
	return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function VersionSidebar() {
	const params = useParams<{ templateId: string }>();
	const templateId = params?.templateId;
	const { editor } = useCurrentEditor();
	const { lastAiPrompt, setLastAiPrompt } = useEditorStore();

	const [isExpanded, setIsExpanded] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [restoringId, setRestoringId] = useState<string | null>(null);
	const [description, setDescription] = useState("");

	// Auto-fill description with the last AI prompt
	useEffect(() => {
		if (lastAiPrompt && !description) {
			setDescription(lastAiPrompt);
		}
	}, [lastAiPrompt, description]);

	const {
		data: versions,
		mutate,
		isLoading,
	} = useSWR<TemplateVersion[]>(
		templateId ? `/api/template/v1/${templateId}/versions` : null,
		fetcher,
	);

	const handleSaveVersion = async () => {
		if (!editor || !templateId || isSaving) return;
		setIsSaving(true);

		try {
			const content = editor.getJSON().content ?? [];
			await fetch(`/api/template/v1/${templateId}/versions`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					content,
					description: description.trim() || undefined,
				}),
				credentials: "include",
			});
			await mutate();
			setDescription("");
			setLastAiPrompt("");
			// Auto-expand to show the newly saved version
			if (!isExpanded) setIsExpanded(true);
		} catch (error) {
			console.error("Failed to save version:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleRestore = async (version: TemplateVersion) => {
		if (!editor) return;
		setRestoringId(version.id);

		try {
			editor.commands.setContent({
				type: "doc",
				content: version.content as Record<string, unknown>[],
			});
		} catch (error) {
			console.error("Failed to restore version:", error);
		} finally {
			// Brief delay so user sees the loading state
			setTimeout(() => setRestoringId(null), 400);
		}
	};

	// --- Collapsed state: narrow icon strip ---
	if (!isExpanded) {
		return (
			<div className="flex w-12 flex-col items-center gap-1 py-4">
				<Tooltip.Root>
					<Tooltip.Trigger asChild>
						<button
							type="button"
							onClick={() => setIsExpanded(true)}
							className="flex size-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5"
						>
							<Clock size={16} />
						</button>
					</Tooltip.Trigger>
					<Tooltip.Content side="right" sideOffset={4}>
						Version history
					</Tooltip.Content>
				</Tooltip.Root>

				<Tooltip.Root>
					<Tooltip.Trigger asChild>
						<button
							type="button"
							onClick={handleSaveVersion}
							disabled={isSaving}
							className="flex size-8 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 disabled:opacity-50 dark:hover:bg-white/5"
						>
							{isSaving ? (
								<Loader2 size={16} className="animate-spin" />
							) : (
								<Save size={16} />
							)}
						</button>
					</Tooltip.Trigger>
					<Tooltip.Content side="right" sideOffset={4}>
						Save version
					</Tooltip.Content>
				</Tooltip.Root>

				{versions && versions.length > 0 && (
					<div className="mt-1 flex size-5 items-center justify-center rounded-full bg-bg-soft-200 font-medium text-[10px] text-text-sub-600 dark:bg-white/10">
						{versions.length}
					</div>
				)}
			</div>
		);
	}

	// --- Expanded state: full sidebar ---
	return (
		<div className="slide-in-from-left-2 flex w-64 animate-in flex-col border-stroke-soft-200 border-r duration-200 dark:border-stroke-soft-100/40">
			{/* Header */}
			<div className="flex items-center justify-between border-stroke-soft-200 border-b px-3 py-3 dark:border-stroke-soft-100/40">
				<div className="flex items-center gap-2">
					<Clock size={14} className="text-text-sub-600" />
					<span className="font-semibold text-sm text-text-strong-950 dark:text-white">
						Versions
					</span>
					{versions && versions.length > 0 && (
						<span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-bg-soft-200 px-1 font-medium text-[10px] text-text-sub-600 dark:bg-white/10">
							{versions.length}
						</span>
					)}
				</div>
				<button
					type="button"
					onClick={() => setIsExpanded(false)}
					className="flex size-6 items-center justify-center rounded-md text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5"
				>
					<ChevronLeft size={14} />
				</button>
			</div>

			{/* Save Section */}
			<div className="border-stroke-soft-200 border-b p-3 dark:border-stroke-soft-100/40">
				<input
					type="text"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Describe this version..."
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							handleSaveVersion();
						}
					}}
					className="mb-2 w-full rounded-lg border border-stroke-soft-200 bg-transparent px-2.5 py-1.5 text-text-strong-950 text-xs outline-none transition-colors placeholder:text-text-disabled-300 focus:border-brand-default dark:border-stroke-soft-100/30 dark:text-white dark:focus:border-brand-default"
				/>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					onClick={handleSaveVersion}
					disabled={isSaving}
					className="w-full gap-2"
				>
					{isSaving ? (
						<Loader2 size={14} className="animate-spin" />
					) : (
						<Save size={14} />
					)}
					{isSaving ? "Saving..." : "Save version"}
				</Button.Root>
			</div>

			{/* Version List */}
			<div className="hide-scrollbar flex-1 overflow-y-auto">
				{isLoading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2
							size={18}
							className="animate-spin text-text-disabled-300"
						/>
					</div>
				) : !versions || versions.length === 0 ? (
					<div className="px-3 py-8 text-center">
						<div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-bg-soft-200 dark:bg-white/5">
							<Clock size={18} className="text-text-disabled-300" />
						</div>
						<p className="font-medium text-text-sub-600 text-xs">
							No versions yet
						</p>
						<p className="mt-1 text-[11px] text-text-disabled-300">
							Save a version to create a snapshot
						</p>
					</div>
				) : (
					<div className="py-1">
						{versions.map((version, idx) => {
							const isRestoring = restoringId === version.id;
							const isLatest = idx === 0;

							return (
								<button
									type="button"
									key={version.id}
									onClick={() => handleRestore(version)}
									disabled={isRestoring}
									className="group relative flex w-full cursor-pointer items-start gap-2 border-stroke-soft-200 border-b px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-bg-weak-50 disabled:cursor-wait dark:border-stroke-soft-100/20 dark:hover:bg-white/[0.03]"
								>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-1.5">
											<span className="inline-flex h-[18px] items-center rounded bg-bg-soft-200 px-1.5 font-mono font-semibold text-[10px] text-text-sub-600 dark:bg-white/10">
												v{version.version}
											</span>
											{isLatest && (
												<span className="inline-flex h-[18px] items-center rounded bg-brand-default/10 px-1.5 font-medium text-[10px] text-brand-default">
													latest
												</span>
											)}
										</div>
										{version.description && (
											<Tooltip.Root delayDuration={300}>
												<Tooltip.Trigger asChild>
													<p className="mt-1 truncate text-text-sub-600 text-xs dark:text-white/60">
														{version.description}
													</p>
												</Tooltip.Trigger>
												<Tooltip.Content
													side="right"
													variant="light"
													className="max-w-[280px] break-words text-xs"
												>
													{version.description}
												</Tooltip.Content>
											</Tooltip.Root>
										)}
										<p
											className={cn(
												"text-[11px] text-text-disabled-300",
												version.description ? "mt-0.5" : "mt-1",
											)}
										>
											{formatRelativeTime(version.createdAt)}
										</p>
									</div>

									{/* Restore indicator */}
									<div className="flex size-6 shrink-0 items-center justify-center rounded-md text-text-sub-600 opacity-0 transition-all group-hover:opacity-100">
										{isRestoring ? (
											<Loader2 size={12} className="animate-spin" />
										) : (
											<RotateCcw size={12} />
										)}
									</div>
								</button>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
