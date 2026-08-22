"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { ChevronDown, Paperclip, Plus, Send, Sparkles } from "lucide-react";
import {
	type FormEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { InboundThread } from "../types";

type ChatMessage = {
	id: string;
	role: "user" | "assistant";
	content: string;
};

const STUB_REPLY =
	"Got it. Agent runtime isn’t connected yet — this panel is UI-ready for when it is.";

export const AiSidebar = ({
	open = true,
	onClose,
	thread,
}: {
	open?: boolean;
	onClose?: () => void;
	thread: InboundThread | null;
}) => {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [draft, setDraft] = useState("");
	const [model] = useState("Reloop Agent");
	const scrollRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const suggestions = useMemo(() => {
		if (!thread) {
			return [
				"Summarize my unread inbox",
				"Draft a polite follow-up",
				"Find threads that need approval",
			];
		}
		return [
			`Summarize: ${thread.subject}`,
			"Draft a reply in a professional tone",
			"Extract action items from this thread",
		];
	}, [thread]);

	useEffect(() => {
		if (!open) return;
		const el = scrollRef.current;
		if (el) el.scrollTop = el.scrollHeight;
	}, [open]);

	const send = useCallback(
		(text: string) => {
			const trimmed = text.trim();
			if (!trimmed) return;
			const userMsg: ChatMessage = {
				id: `u-${Date.now()}`,
				role: "user",
				content: trimmed,
			};
			const assistantMsg: ChatMessage = {
				id: `a-${Date.now()}`,
				role: "assistant",
				content: thread
					? `Found context for “${thread.subject}”. ${STUB_REPLY}`
					: STUB_REPLY,
			};
			setMessages((prev) => [...prev, userMsg, assistantMsg]);
			setDraft("");
		},
		[thread],
	);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		send(draft);
	};

	const handleNewChat = () => {
		setMessages([]);
		setDraft("");
		inputRef.current?.focus();
	};

	if (!open) return null;

	return (
		<aside
			className={cn(
				"flex h-full w-[320px] shrink-0 flex-col overflow-hidden border-stroke-soft-100 border-l bg-bg-white-0 text-text-strong-950 dark:border-stroke-soft-100/40 dark:bg-black",
			)}
		>
			{/* Top Header */}
			<div className="flex h-11 shrink-0 items-center justify-between border-stroke-soft-100 border-b px-3 dark:border-stroke-soft-100/40">
				<div className="flex items-center gap-2">
					<div className="flex size-6 items-center justify-center rounded-lg bg-bg-weak-50 text-text-strong-950 dark:bg-white/[0.06]">
						<Icon name="agent" className="size-3.5 text-text-strong-950" />
					</div>
					<span className="font-semibold text-[13px] text-text-strong-950">
						Agent Copilot
					</span>
				</div>

				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={handleNewChat}
						className="flex size-7 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/[0.06]"
						aria-label="New chat"
						title="New chat"
					>
						<Plus className="size-4" />
					</button>
				</div>
			</div>

			{/* Messages Area */}
			<div
				ref={scrollRef}
				className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3.5 pt-3 pb-3"
			>
				{messages.length === 0 ? (
					<div className="mt-auto flex flex-col gap-2.5">
						{thread && (
							<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/70 p-3 dark:border-stroke-soft-100/40 dark:bg-white/[0.04]">
								<p className="mb-1 font-semibold text-[10px] text-text-soft-400 uppercase tracking-wider">
									Active Context
								</p>
								<p className="line-clamp-2 font-medium text-text-strong-950 text-xs leading-relaxed">
									{thread.subject}
								</p>
							</div>
						)}
						<p className="font-semibold text-[11px] text-text-soft-400 uppercase tracking-wider">
							Suggested Prompts
						</p>
						{suggestions.map((s) => (
							<button
								key={s}
								type="button"
								onClick={() => send(s)}
								className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 text-left font-medium text-text-sub-600 text-xs transition-all hover:border-stroke-soft-300 hover:bg-bg-weak-50 hover:text-text-strong-950 active:scale-[0.99] dark:border-stroke-soft-100/40 dark:bg-white/[0.03] dark:hover:bg-white/[0.07] dark:hover:text-white"
							>
								{s}
							</button>
						))}
					</div>
				) : (
					<div className="mt-auto flex flex-col gap-3">
						{messages.map((m) =>
							m.role === "user" ? (
								<div
									key={m.id}
									className="max-w-[85%] self-end rounded-2xl bg-bg-weak-50 px-3.5 py-2 font-medium text-[13px] text-text-strong-950 leading-relaxed dark:bg-white/[0.08]"
								>
									{m.content}
								</div>
							) : (
								<div
									key={m.id}
									className="rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-3 text-[13px] text-text-strong-950 leading-relaxed dark:border-stroke-soft-100/40 dark:bg-white/[0.02]"
								>
									{m.content}
								</div>
							),
						)}
					</div>
				)}
			</div>

			{/* Composer Area */}
			<div className="p-3 pt-0" data-focal="ai">
				<form
					onSubmit={handleSubmit}
					className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs focus-within:border-stroke-strong-950 dark:border-stroke-soft-100/40 dark:bg-white/[0.04] dark:focus-within:border-white/30"
				>
					<textarea
						ref={inputRef}
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								send(draft);
							}
						}}
						placeholder="Ask agent to reply, draft or filter..."
						rows={2}
						className="min-h-[44px] w-full resize-none bg-transparent px-3 pt-2.5 pb-1 text-[13px] text-text-strong-950 outline-none placeholder:text-text-soft-400"
					/>
					<div className="flex items-center justify-between px-2.5 pt-0.5 pb-2">
						<div className="flex items-center gap-1 text-[11px] text-text-sub-600">
							<Sparkles className="size-3 text-amber-500" />
							<span className="font-medium text-xs">{model}</span>
						</div>
						<button
							type="submit"
							disabled={!draft.trim()}
							className="grid size-6 place-items-center rounded-lg bg-blue-600 text-white transition-opacity hover:bg-blue-700 disabled:opacity-30"
							aria-label="Send"
						>
							<Send className="size-3" />
						</button>
					</div>
				</form>
			</div>
		</aside>
	);
};

export const useAiSidebar = (_opts?: { defaultOpen?: boolean }) => {
	const [open, setOpen] = useState(true);
	return {
		open,
		setOpen,
		toggle: () => setOpen((v) => !v),
	};
};

export const AiSidebarToggle = ({
	onClick,
	active,
}: {
	onClick: () => void;
	active?: boolean;
}) => (
	<button
		type="button"
		onClick={onClick}
		className={cn(
			"inline-flex h-7 items-center justify-center gap-1 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-2 text-xs transition-colors hover:bg-bg-soft-200 dark:border-stroke-soft-100/40 dark:bg-white/[0.06]",
			active && "ring-1 ring-blue-500",
		)}
	>
		<Icon name="agent" className="size-3.5 text-text-strong-950" />
		<span className="font-medium text-text-strong-950">Agent chat</span>
	</button>
);
