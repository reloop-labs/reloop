import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useCurrentEditor } from "@tiptap/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import { useTemplateId } from "#/features/templates/editor/hooks/use-template-id";
import { AiApplyModal } from "./ai-apply-modal";
import { AiComposer } from "./ai-composer";
import { AiMessageBubble } from "./ai-message";
import type { AiPlan, EditorSnapshot } from "./types";
import { useAiAttachments } from "./use-ai-attachments";
import { useTemplateAiAgent } from "./use-template-ai-agent";

function buildSnapshot(
	editor: ReturnType<typeof useCurrentEditor>["editor"],
	subject: string,
	previewText: string,
): EditorSnapshot {
	let renderedHtmlSnippet: string | null = null;
	let contentJson: string | null = null;
	try {
		if (editor) {
			renderedHtmlSnippet = editor.getHTML().slice(0, 14000);
			contentJson = JSON.stringify(editor.getJSON()).slice(0, 14000);
		}
	} catch {
		// ignore
	}
	return {
		subject: subject || null,
		previewText: previewText || null,
		renderedHtmlSnippet,
		contentJson,
	};
}

function canvasIsEmpty(
	editor: ReturnType<typeof useCurrentEditor>["editor"],
): boolean {
	if (!editor) return true;
	const text = editor.getText().trim();
	const html = editor
		.getHTML()
		.replace(/<[^>]+>/g, "")
		.trim();
	return text.length === 0 && html.length === 0;
}

export function AIPanel({ onClose }: { onClose?: () => void }) {
	const templateId = useTemplateId();
	const { editor } = useCurrentEditor();
	const subject = useEditorStore((s) => s.subject);
	const previewText = useEditorStore((s) => s.previewText);
	const setIsGeneratingStore = useEditorStore((s) => s.setIsGenerating);
	const setGeneratingContent = useEditorStore((s) => s.setGeneratingContent);
	const setLastAiPrompt = useEditorStore((s) => s.setLastAiPrompt);

	const [draft, setDraft] = useState("");
	const [undoStack, setUndoStack] = useState<{
		json: unknown;
		html: string;
	} | null>(null);
	const [pendingApplyHtml, setPendingApplyHtml] = useState<string | null>(null);
	const [showJump, setShowJump] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);

	const {
		messages,
		mode,
		setMode,
		isRunning,
		stop,
		clearChat,
		runAgent,
		pendingPlan,
		setPendingPlan,
	} = useTemplateAiAgent(templateId);

	const { attachments, uploading, addFiles, remove, clear } =
		useAiAttachments();

	useEffect(() => {
		setIsGeneratingStore(isRunning);
	}, [isRunning, setIsGeneratingStore]);

	// Esc stops generation
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isRunning) {
				e.preventDefault();
				stop();
				toast.message("Generation stopped");
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [isRunning, stop]);

	// Auto-scroll unless user scrolled up
	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
		if (distanceFromBottom < 80) {
			el.scrollTop = el.scrollHeight;
			setShowJump(false);
		} else {
			setShowJump(true);
		}
	}, [messages]);

	const isSafeEmailHtml = (html: string) => {
		const t = html.trim();
		if (!t || !/<[a-z][\s\S]*>/i.test(t)) return false;
		// Block agent prompt dumps that slipped through
		if (/##\s*Current editor context/i.test(t)) return false;
		if (/##\s*Conversation/i.test(t)) return false;
		if (/Respond with the complete email HTML only/i.test(t)) return false;
		if (/Current HTML \(may be truncated\)/i.test(t)) return false;
		return true;
	};

	const commitApply = useCallback(
		async (html: string) => {
			if (!editor || !html) return;
			if (!isSafeEmailHtml(html)) {
				toast.error(
					"AI returned invalid content (looks like a prompt dump). Retry — ensure OpenRouter/Ollama/Gemini/OpenAI is available.",
				);
				return;
			}
			try {
				const prevJson = editor.getJSON();
				const prevHtml = editor.getHTML();
				setUndoStack({ json: prevJson, html: prevHtml });
				editor.commands.setContent(html);

				if (templateId) {
					await fetch(`/api/template/v1/${templateId}`, {
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						credentials: "include",
						body: JSON.stringify({
							content: [{ type: "html", html }],
						}),
					}).catch(() => null);
				}

				toast.success("Applied to canvas", {
					action: {
						label: "Undo",
						onClick: () => {
							try {
								editor.commands.setContent(prevJson as never);
								setUndoStack(null);
								toast.message("Reverted");
							} catch {
								// ignore
							}
						},
					},
				});
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Failed to apply HTML",
				);
			}
		},
		[editor, templateId],
	);

	const requestApply = useCallback(
		async (html: string, opts?: { forceConfirm?: boolean }) => {
			if (!editor || !html) return;
			const dirty = !canvasIsEmpty(editor);
			if (dirty || opts?.forceConfirm) {
				setPendingApplyHtml(html);
				return;
			}
			await commitApply(html);
		},
		[editor, commitApply],
	);

	const undoApply = useCallback(() => {
		if (!editor || !undoStack) return;
		try {
			editor.commands.setContent(undoStack.json as never);
			setUndoStack(null);
			toast.success("Reverted last apply");
		} catch {
			toast.error("Could not undo");
		}
	}, [editor, undoStack]);

	const snapshot = useMemo(
		() => buildSnapshot(editor, subject, previewText),
		[editor, subject, previewText],
	);

	const send = useCallback(async () => {
		const text =
			draft.trim() ||
			(attachments.length > 0
				? "Design an email template that matches the attached reference image(s). Keep it email-client safe."
				: "");
		if ((!text && attachments.length === 0) || isRunning) return;
		setLastAiPrompt(text);
		setDraft("");
		const atts = [...attachments];
		clear();
		setGeneratingContent("");

		await runAgent({
			userText: text,
			attachments: atts,
			editorSnapshot: snapshot,
			templateId,
			modeOverride: mode,
			onHtmlDelta: (h) => setGeneratingContent(h),
			onHtmlFinal: async (html) => {
				setGeneratingContent(html);
				const empty = canvasIsEmpty(editor);
				if (empty) {
					await commitApply(html);
				} else {
					// Soft confirm — don't block stream; offer apply modal
					setPendingApplyHtml(html);
				}
			},
		});
	}, [
		draft,
		isRunning,
		attachments,
		clear,
		runAgent,
		snapshot,
		templateId,
		mode,
		setLastAiPrompt,
		setGeneratingContent,
		editor,
		commitApply,
	]);

	const executePlan = useCallback(
		async (plan: AiPlan) => {
			if (isRunning) return;
			setPendingPlan(null);
			setGeneratingContent("");
			await runAgent({
				userText: plan.summary,
				editorSnapshot: snapshot,
				templateId,
				executePlan: plan,
				modeOverride: "agent",
				onHtmlDelta: (h) => setGeneratingContent(h),
				onHtmlFinal: async (html) => {
					setGeneratingContent(html);
					const empty = canvasIsEmpty(editor);
					if (empty) await commitApply(html);
					else setPendingApplyHtml(html);
				},
			});
		},
		[
			isRunning,
			runAgent,
			snapshot,
			templateId,
			setPendingPlan,
			setGeneratingContent,
			editor,
			commitApply,
		],
	);

	const retryFromAssistant = useCallback(
		async (assistantMessageId: string) => {
			const idx = messages.findIndex((m) => m.id === assistantMessageId);
			if (idx < 0) return;
			// Find nearest preceding user message
			let userId: string | null = null;
			let userText = "";
			for (let i = idx - 1; i >= 0; i--) {
				const m = messages[i];
				if (m?.role === "user") {
					userId = m.id;
					userText = m.content;
					break;
				}
			}
			if (!userId) return;
			setGeneratingContent("");
			await runAgent({
				userText,
				retryFromUserMessageId: userId,
				editorSnapshot: snapshot,
				templateId,
				modeOverride: mode,
				onHtmlDelta: (h) => setGeneratingContent(h),
				onHtmlFinal: async (html) => {
					setGeneratingContent(html);
					const empty = canvasIsEmpty(editor);
					if (empty) await commitApply(html);
					else setPendingApplyHtml(html);
				},
			});
		},
		[
			messages,
			runAgent,
			snapshot,
			templateId,
			mode,
			setGeneratingContent,
			editor,
			commitApply,
		],
	);

	const jumpToLatest = () => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollTop = el.scrollHeight;
		setShowJump(false);
	};

	return (
		<div className="flex h-full w-full flex-col overflow-hidden bg-bg-white-0 dark:bg-black">
			{/* Header */}
			<div className="flex shrink-0 items-center justify-between border-stroke-soft-200/60 border-b px-4 py-3 dark:border-stroke-soft-100/40">
				<div className="flex items-center gap-2">
					<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-feature-lighter text-feature-base">
						<Icon name="sparkling" className="h-4 w-4" />
					</div>
					<div>
						<h3 className="font-semibold text-label-sm text-text-strong-950">
							Template agent
						</h3>
						<p className="text-[10px] text-text-soft-400">
							{mode === "plan" ? "Plan mode" : "Agent mode"}
							{isRunning ? " · generating (Esc to stop)" : " · multi-turn"}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-1">
					{undoStack ? (
						<Button.Root
							type="button"
							variant="neutral"
							mode="ghost"
							size="xxsmall"
							onClick={undoApply}
							title="Undo last apply"
						>
							Undo
						</Button.Root>
					) : null}
					{messages.length > 0 ? (
						<Button.Root
							type="button"
							variant="neutral"
							mode="ghost"
							size="xxsmall"
							onClick={clearChat}
							disabled={isRunning}
							title="Clear chat"
						>
							Clear
						</Button.Root>
					) : null}
					{onClose ? (
						<button
							type="button"
							onClick={onClose}
							className="rounded-lg p-1 text-text-sub-600 hover:bg-bg-weak-50"
							aria-label="Close"
						>
							<Icon name="cross" className="h-4 w-4" />
						</button>
					) : null}
				</div>
			</div>

			{/* Transcript */}
			<div className="relative min-h-0 flex-1">
				<div
					ref={scrollRef}
					className="h-full space-y-3 overflow-y-auto p-3"
					onScroll={() => {
						const el = scrollRef.current;
						if (!el) return;
						const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
						setShowJump(distance > 100);
					}}
				>
					{messages.length === 0 ? (
						<div className="flex h-full flex-col items-center justify-center px-4 py-10 text-center">
							<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-feature-lighter text-feature-base">
								<Icon name="sparkling" className="h-5 w-5" />
							</div>
							<p className="font-semibold text-label-sm text-text-strong-950">
								Build emails message by message
							</p>
							<p className="mt-1 max-w-[240px] text-paragraph-xs text-text-soft-400">
								Like Cursor: plan, generate, then refine. Paste a screenshot —
								chat is saved for this template until you clear it.
							</p>
						</div>
					) : (
						messages.map((m) => (
							<AiMessageBubble
								key={m.id}
								message={m}
								isRunning={isRunning}
								onExecutePlan={executePlan}
								onApplyHtml={(html) => void requestApply(html)}
								onRetry={(assistantId) => void retryFromAssistant(assistantId)}
							/>
						))
					)}
				</div>

				{showJump && messages.length > 0 ? (
					<button
						type="button"
						onClick={jumpToLatest}
						className="-translate-x-1/2 absolute bottom-3 left-1/2 z-10 flex items-center gap-1 rounded-full border border-stroke-soft-100 bg-bg-white-0 px-3 py-1 font-medium text-[11px] text-text-sub-600 shadow-regular-sm hover:text-text-strong-950"
					>
						<Icon name="arrow-down" className="h-3 w-3" />
						Latest
					</button>
				) : null}
			</div>

			{pendingPlan && !messages.some((m) => m.plan?.id === pendingPlan.id) ? (
				<div className="px-3 pb-1 text-[10px] text-text-soft-400">
					Plan ready — execute from the card above.
				</div>
			) : null}

			<AiComposer
				mode={mode}
				onModeChange={setMode}
				value={draft}
				onChange={setDraft}
				onSend={() => void send()}
				onStop={stop}
				isRunning={isRunning}
				attachments={attachments}
				onAddFiles={addFiles}
				onRemoveAttachment={remove}
				uploading={uploading}
			/>

			<AiApplyModal
				open={Boolean(pendingApplyHtml)}
				onOpenChange={(open) => {
					if (!open) setPendingApplyHtml(null);
				}}
				onDismiss={() => {
					setPendingApplyHtml(null);
					toast.message(
						"Kept current canvas — use Apply on the message anytime",
					);
				}}
				onApply={() => {
					if (pendingApplyHtml) {
						void commitApply(pendingApplyHtml);
					}
					setPendingApplyHtml(null);
				}}
			/>
		</div>
	);
}
