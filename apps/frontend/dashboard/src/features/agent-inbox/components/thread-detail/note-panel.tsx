import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { Copy, MoreVertical, StickyNote } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useSWR } from "#/features/agent-inbox/lib/use-swr-compat";
import type { ThreadNote } from "../../types";
import { apiFetch } from "#/features/agent-inbox/lib/api-fetch";

const NOTE_COLORS = [
	"default",
	"red",
	"orange",
	"yellow",
	"green",
	"blue",
	"purple",
	"pink",
] as const;

const colorClass = (color: string) => {
	const map: Record<string, string> = {
		red: "border-l-red-500",
		orange: "border-l-orange-500",
		yellow: "border-l-yellow-500",
		green: "border-l-green-500",
		blue: "border-l-blue-500",
		purple: "border-l-purple-500",
		pink: "border-l-pink-500",
		default: "border-l-neutral-500",
	};
	return map[color] ?? "border-l-neutral-500";
};

export const NotesPanel = ({
	threadId,
	open: controlledOpen,
	onOpenChange,
	hideTrigger = false,
}: {
	threadId: string;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	hideTrigger?: boolean;
}) => {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
	const isOpen = controlledOpen ?? uncontrolledOpen;
	const setIsOpen = useCallback(
		(next: boolean | ((prev: boolean) => boolean)) => {
			const resolved = typeof next === "function" ? next(isOpen) : next;
			if (controlledOpen === undefined) setUncontrolledOpen(resolved);
			onOpenChange?.(resolved);
		},
		[controlledOpen, isOpen, onOpenChange],
	);
	const [isAdding, setIsAdding] = useState(false);
	const [newContent, setNewContent] = useState("");
	const [selectedColor, setSelectedColor] = useState("default");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editContent, setEditContent] = useState("");
	const [searchQuery, setSearchQuery] = useState("");

	const { data: notes = [], mutate } = useSWR<ThreadNote[]>(
		threadId ? `/api/inbox/v1/notes?threadId=${threadId}` : null,
	);

	useEffect(() => {
		setIsOpen(false);
		setIsAdding(false);
		setEditingId(null);
		setSearchQuery("");
	}, [threadId]);

	const filtered = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		const list = q
			? notes.filter((n) => n.content.toLowerCase().includes(q))
			: notes;
		return [...list].sort((a, b) => {
			if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
			return a.order - b.order;
		});
	}, [notes, searchQuery]);

	const createNote = useCallback(async () => {
		const content = newContent.trim();
		if (!content) return;
		const res = await apiFetch("/api/inbox/v1/notes", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				threadId,
				content,
				color: selectedColor === "default" ? undefined : selectedColor,
			}),
		});
		if (!res.ok) {
			toast.error("Failed to create note");
			return;
		}
		setNewContent("");
		setSelectedColor("default");
		setIsAdding(false);
		await mutate();
		toast.success("Note added");
	}, [newContent, selectedColor, threadId, mutate]);

	const updateNote = useCallback(
		async (
			id: string,
			data: Partial<{ content: string; color: string; isPinned: boolean }>,
		) => {
			const res = await apiFetch(`/api/inbox/v1/notes/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!res.ok) {
				toast.error("Failed to update note");
				return;
			}
			await mutate();
		},
		[mutate],
	);

	const deleteNote = useCallback(
		async (id: string) => {
			const res = await apiFetch(`/api/inbox/v1/notes/${id}`, {
				method: "DELETE",
			});
			if (!res.ok) {
				toast.error("Failed to delete note");
				return;
			}
			await mutate();
			toast.success("Note deleted");
		},
		[mutate],
	);

	return (
		<>
			{!hideTrigger && (
				<div className="relative">
					<button
						type="button"
						onClick={() => setIsOpen((v) => !v)}
						className={cn(
							"inline-flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[var(--inbox-control)] transition-colors hover:bg-[var(--inbox-control-hover)]",
							notes.length > 0 && "text-amber-400",
						)}
						aria-label="Notes"
					>
						<StickyNote className="h-3.5 w-3.5" />
						{notes.length > 0 && (
							<span className="-top-1 -right-1 absolute flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-amber-500 px-0.5 font-semibold text-[9px] text-black">
								{notes.length}
							</span>
						)}
					</button>
				</div>
			)}

			{isOpen && (
				<div
					role="dialog"
					aria-label="Thread notes"
					className="absolute top-12 right-3 z-50 flex w-[min(350px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-mail-border bg-panel-light shadow-xl md:right-5 dark:bg-panel-dark"
					onClick={(e) => e.stopPropagation()}
					onKeyDown={(e) => e.stopPropagation()}
				>
					<div className="flex items-center justify-between border-mail-border border-b px-3 py-2">
						<div className="flex items-center gap-2">
							<span className="font-medium text-mail-foreground text-sm">
								Notes
							</span>
							{notes.length > 0 && (
								<span className="rounded-full bg-[var(--inbox-control-hover)] px-1.5 text-[10px] text-mail-muted">
									{notes.length}
								</span>
							)}
						</div>
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="rounded-md p-1 text-mail-muted hover:bg-[var(--inbox-control-hover)]"
							aria-label="Close notes"
						>
							<Icon name="cross" className="h-3.5 w-3.5" />
						</button>
					</div>

					{notes.length > 0 && (
						<div className="border-mail-border border-b px-3 py-2">
							<input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search notes…"
								className="w-full rounded-md bg-[var(--inbox-control)] px-2 py-1.5 text-mail-foreground text-xs outline-none placeholder:text-mail-muted"
							/>
						</div>
					)}

					<div className="max-h-72 space-y-2 overflow-y-auto p-3">
						{filtered.length === 0 && !isAdding && (
							<p className="py-4 text-center text-mail-muted text-xs">
								{notes.length === 0
									? "No notes yet"
									: "No notes match your search"}
							</p>
						)}

						{filtered.map((note) => (
							<div
								key={note.id}
								className={cn(
									"rounded-lg border border-mail-border border-l-4 bg-[var(--inbox-muted-bg)] p-2.5",
									colorClass(note.color),
								)}
							>
								{editingId === note.id ? (
									<div className="space-y-2">
										<textarea
											value={editContent}
											onChange={(e) => setEditContent(e.target.value)}
											rows={3}
											className="w-full resize-none rounded-md bg-[var(--inbox-control)] p-2 text-mail-foreground text-xs outline-none"
										/>
										<div className="flex justify-end gap-1.5">
											<button
												type="button"
												className="rounded-md px-2 py-1 text-mail-muted text-xs hover:bg-[var(--inbox-control-hover)]"
												onClick={() => setEditingId(null)}
											>
												Cancel
											</button>
											<button
												type="button"
												className="rounded-md bg-mail-primary px-2 py-1 text-panel-light text-xs"
												onClick={async () => {
													await updateNote(note.id, {
														content: editContent.trim(),
													});
													setEditingId(null);
												}}
											>
												Save
											</button>
										</div>
									</div>
								) : (
									<>
										<div className="flex items-start justify-between gap-2">
											<p className="whitespace-pre-wrap text-mail-foreground text-xs">
												{note.content}
											</p>
											<Dropdown.Root>
												<Dropdown.Trigger asChild>
													<button
														type="button"
														className="shrink-0 rounded p-0.5 text-mail-muted hover:bg-[var(--inbox-control-hover)]"
													>
														<MoreVertical className="h-3.5 w-3.5" />
													</button>
												</Dropdown.Trigger>
												<Dropdown.Content
													align="end"
													className="min-w-36 border-mail-border bg-[var(--inbox-control)]"
												>
													<Dropdown.Item
														onSelect={() => {
															setEditingId(note.id);
															setEditContent(note.content);
														}}
													>
														Edit
													</Dropdown.Item>
													<Dropdown.Item
														onSelect={() => {
															navigator.clipboard.writeText(note.content);
															toast.success("Copied");
														}}
													>
														<Copy className="mr-2 h-3.5 w-3.5" />
														Copy
													</Dropdown.Item>
													<Dropdown.Item
														onSelect={() =>
															updateNote(note.id, { isPinned: !note.isPinned })
														}
													>
														<Icon name="pin" className="mr-2 h-3.5 w-3.5" />
														{note.isPinned ? "Unpin" : "Pin"}
													</Dropdown.Item>
													{NOTE_COLORS.map((c) => (
														<Dropdown.Item
															key={c}
															onSelect={() => updateNote(note.id, { color: c })}
														>
															Color: {c}
														</Dropdown.Item>
													))}
													<Dropdown.Item
														onSelect={() => deleteNote(note.id)}
														className="text-rose-400"
													>
														<Icon name="trash" className="mr-2 h-3.5 w-3.5" />
														Delete
													</Dropdown.Item>
												</Dropdown.Content>
											</Dropdown.Root>
										</div>
										{note.isPinned && (
											<span className="mt-1 inline-flex items-center gap-1 text-[10px] text-amber-400">
												<Icon name="pin" className="h-2.5 w-2.5" /> Pinned
											</span>
										)}
									</>
								)}
							</div>
						))}

						{isAdding && (
							<div className="space-y-2 rounded-lg border border-mail-border bg-[var(--inbox-muted-bg)] p-2.5">
								<textarea
									value={newContent}
									onChange={(e) => setNewContent(e.target.value)}
									placeholder="Write a note…"
									rows={3}
									className="w-full resize-none rounded-md bg-[var(--inbox-control)] p-2 text-mail-foreground text-xs outline-none"
									onKeyDown={(e) => {
										if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
											e.preventDefault();
											createNote();
										}
									}}
								/>
								<div className="flex flex-wrap gap-1">
									{NOTE_COLORS.map((c) => (
										<button
											key={c}
											type="button"
											onClick={() => setSelectedColor(c)}
											className={cn(
												"h-4 w-4 rounded-full border border-mail-border",
												colorClass(c)
													.replace("border-l-", "bg-")
													.replace("-500", "-500"),
												selectedColor === c && "ring-2 ring-white/40",
											)}
											style={{
												background: c === "default" ? "#737373" : undefined,
											}}
											aria-label={c}
										/>
									))}
								</div>
								<div className="flex justify-end gap-1.5">
									<button
										type="button"
										className="rounded-md px-2 py-1 text-mail-muted text-xs hover:bg-[var(--inbox-control-hover)]"
										onClick={() => {
											setIsAdding(false);
											setNewContent("");
										}}
									>
										Cancel
									</button>
									<button
										type="button"
										className="rounded-md bg-mail-primary px-2 py-1 text-panel-light text-xs disabled:opacity-40"
										disabled={!newContent.trim()}
										onClick={createNote}
									>
										Save
									</button>
								</div>
							</div>
						)}
					</div>

					{!isAdding && (
						<div className="border-mail-border border-t p-2">
							<button
								type="button"
								onClick={() => setIsAdding(true)}
								className="w-full rounded-md bg-[var(--inbox-control)] py-1.5 text-mail-muted text-xs transition-colors hover:bg-[var(--inbox-control-hover)]"
							>
								Add note
							</button>
						</div>
					)}
				</div>
			)}
		</>
	);
};
