import { cn } from "@reloop/ui/cn";
import {
	ChevronDown,
	ChevronsLeft,
	Clock,
	Mic,
	Paperclip,
	Plus,
	Sparkles,
	User,
} from "lucide-react";
import {
	type FormEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { InboundThread } from "../types";

const AI_OPEN_KEY = "reloop-inbox-ai-open";

type AiOpenListener = (open: boolean) => void;
const aiOpenListeners = new Set<AiOpenListener>();
let sharedAiOpen: boolean | null = null;

function readStoredAiOpen(defaultOpen?: boolean): boolean {
	if (typeof window === "undefined") return defaultOpen ?? false;
	const stored = window.localStorage.getItem(AI_OPEN_KEY);
	if (stored === "1") return true;
	if (stored === "0") return false;
	return defaultOpen ?? false;
}

function getSharedAiOpen(defaultOpen?: boolean): boolean {
	if (sharedAiOpen !== null) return sharedAiOpen;
	sharedAiOpen = readStoredAiOpen(defaultOpen);
	return sharedAiOpen;
}

/** Shared AI panel open state so top navbar + list shell stay in sync. */
export const useAiSidebar = (opts?: { defaultOpen?: boolean }) => {
	const [open, setOpenState] = useState(() =>
		getSharedAiOpen(opts?.defaultOpen),
	);

	useEffect(() => {
		const onChange: AiOpenListener = (next) => setOpenState(next);
		aiOpenListeners.add(onChange);
		return () => {
			aiOpenListeners.delete(onChange);
		};
	}, []);

	const setOpen = useCallback(
		(value: boolean | ((prev: boolean) => boolean)) => {
			const prev = sharedAiOpen ?? readStoredAiOpen(opts?.defaultOpen);
			const next = typeof value === "function" ? value(prev) : value;
			sharedAiOpen = next;
			try {
				window.localStorage.setItem(AI_OPEN_KEY, next ? "1" : "0");
			} catch {
				/* ignore */
			}
			for (const listener of aiOpenListeners) {
				listener(next);
			}
		},
		[opts?.defaultOpen],
	);

	return {
		open,
		setOpen,
		toggle: () => setOpen((v) => !v),
	};
};

type ChatMessage = {
	id: string;
	role: "user" | "assistant";
	content: string;
};

const STUB_REPLY =
	"Got it. Agent runtime isn’t connected yet — this panel is UI-ready for when it is.";

export const AiSidebar = ({
	open,
	onClose,
	thread,
}: {
	open: boolean;
	onClose: () => void;
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
				"mb-1 flex h-full w-[min(340px,100%)] shrink-0 flex-col overflow-hidden rounded-2xl border border-mail-border bg-panel-light dark:bg-panel-dark",
			)}
		>
			{/* Header tools */}
			<div className="flex items-center justify-between border-mail-border border-b px-2 py-1.5">
				<button
					type="button"
					onClick={onClose}
					className="rounded-lg p-1.5 text-mail-muted opacity-60 transition-opacity hover:bg-[var(--inbox-row-hover)] hover:opacity-100"
					aria-label="Collapse agent panel"
					title="Collapse"
				>
					<ChevronsLeft className="h-3.5 w-3.5" />
				</button>
				<div className="flex items-center gap-0.5 text-mail-muted">
					<span className="rounded-lg bg-[var(--inbox-selected)] p-1.5 text-mail-foreground">
						<Sparkles className="h-4 w-4" />
					</span>
					<span className="rounded-lg p-1.5 opacity-50">
						<Clock className="h-4 w-4" />
					</span>
					<span className="rounded-lg p-1.5 opacity-50">
						<User className="h-4 w-4" />
					</span>
				</div>
			</div>

			{/* New chat */}
			<div className="flex items-center justify-between py-2.5 pr-3 pl-4">
				<span className="flex items-center gap-1 font-medium text-[14px] text-mail-foreground">
					New Chat
					<ChevronDown className="h-3.5 w-3.5 text-mail-muted" />
				</span>
				<button
					type="button"
					onClick={handleNewChat}
					className="rounded-md p-1 text-mail-muted transition-colors hover:bg-[var(--inbox-row-hover)] hover:text-mail-foreground"
					aria-label="New chat"
					title="New chat"
				>
					<Plus className="h-4 w-4" />
				</button>
			</div>

			{/* Messages */}
			<div
				ref={scrollRef}
				className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-1 pb-3"
			>
				{messages.length === 0 ? (
					<div className="mt-auto flex flex-col gap-2">
						{thread && (
							<div className="mb-2 rounded-lg border border-mail-border bg-[var(--inbox-muted-bg)] p-2.5">
								<p className="mb-0.5 text-[10px] text-mail-muted uppercase tracking-wide">
									Current thread
								</p>
								<p className="line-clamp-2 font-medium text-mail-foreground text-xs">
									{thread.subject}
								</p>
							</div>
						)}
						<p className="mb-1 text-[11px] text-mail-muted">Suggestions</p>
						{suggestions.map((s) => (
							<button
								key={s}
								type="button"
								onClick={() => send(s)}
								className="w-full rounded-lg border border-mail-border bg-[var(--inbox-control)] px-2.5 py-2 text-left text-mail-foreground text-xs transition-colors hover:bg-[var(--inbox-control-hover)]"
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
									className="max-w-[85%] self-end rounded-2xl bg-[var(--inbox-row-hover)] px-3 py-2 text-[14px] text-mail-foreground leading-5"
								>
									{m.content}
								</div>
							) : (
								<p
									key={m.id}
									className="font-normal text-[14px] text-mail-foreground leading-5"
								>
									{m.content}
								</p>
							),
						)}
					</div>
				)}
			</div>

			{/* Composer */}
			<div className="px-4 pb-3" data-focal="ai">
				<form
					onSubmit={handleSubmit}
					className="rounded-xl border border-mail-border bg-panel-light dark:bg-panel-dark"
				>
					<div className="flex flex-wrap items-center gap-2 px-3 pt-2 pb-1 text-[11px]">
						<span className="rounded-full border border-mail-border px-2 py-0.5 font-medium text-mail-foreground">
							@
						</span>
						<span className="flex items-center gap-1 rounded-full border border-mail-border px-2 py-0.5 font-medium text-mail-foreground">
							<Paperclip className="h-3 w-3" />
							Attach
						</span>
					</div>
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
						placeholder="Tell Reloop what to handle"
						rows={2}
						className="min-h-[40px] w-full resize-none bg-transparent px-3 py-1.5 text-[14px] text-mail-foreground outline-none placeholder:text-mail-muted"
					/>
					<div className="flex items-center justify-between px-3 pt-1 pb-2">
						<button
							type="button"
							className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[14px] text-mail-muted hover:bg-[var(--inbox-row-hover)]"
						>
							<Sparkles className="h-3 w-3 text-amber-400" />
							{model}
							<ChevronDown className="h-3.5 w-3.5" />
						</button>
						<span className="flex items-center gap-1.5">
							<button
								type="button"
								className="rounded-md p-1.5 text-mail-muted opacity-60"
								aria-label="Voice (coming soon)"
								title="Voice (coming soon)"
								disabled
							>
								<Mic className="h-4 w-4" />
							</button>
							<button
								type="submit"
								disabled={!draft.trim()}
								className="grid size-7 place-items-center rounded-full bg-zero-blue text-white transition-opacity disabled:opacity-40"
								aria-label="Send"
							>
								<svg
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.7"
									strokeLinecap="round"
									strokeLinejoin="round"
									aria-hidden
								>
									<path d="M12 19V5M6 11l6-6 6 6" />
								</svg>
							</button>
						</span>
					</div>
				</form>
			</div>
		</aside>
	);
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
			"inline-flex h-7 items-center justify-center gap-1 overflow-hidden rounded-lg border-none bg-[var(--inbox-control)] px-2 transition-colors hover:bg-[var(--inbox-control-hover)]",
			active && "ring-1 ring-amber-400/40",
		)}
	>
		<Sparkles className="mr-1 h-3.5 w-3.5 fill-[#959595]" />
		<span className="text-mail-foreground text-sm leading-none">
			Agent chat
		</span>
	</button>
);
