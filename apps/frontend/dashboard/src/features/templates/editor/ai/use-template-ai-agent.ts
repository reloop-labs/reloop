import { useCallback, useEffect, useRef, useState } from "react";
import { clearAiChat, loadAiChat, saveAiChat } from "./ai-storage";
import type {
	AgentSseEvent,
	AiAttachment,
	AiMessage,
	AiMode,
	AiPlan,
	AiStep,
	EditorSnapshot,
} from "./types";

function uid(prefix = "msg") {
	return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function parseSseChunk(buffer: string): {
	events: AgentSseEvent[];
	rest: string;
} {
	const parts = buffer.split("\n\n");
	const rest = parts.pop() ?? "";
	const events: AgentSseEvent[] = [];
	for (const part of parts) {
		const lines = part.split("\n");
		for (const line of lines) {
			if (!line.startsWith("data:")) continue;
			const raw = line.slice(5).trim();
			if (!raw || raw === "[DONE]") continue;
			try {
				events.push(JSON.parse(raw) as AgentSseEvent);
			} catch {
				// ignore malformed
			}
		}
	}
	return { events, rest };
}

export function useTemplateAiAgent(templateId?: string | null) {
	const stored = loadAiChat(templateId);
	const [messages, setMessages] = useState<AiMessage[]>(
		() => stored?.messages ?? [],
	);
	const [mode, setMode] = useState<AiMode>(() => stored?.mode ?? "agent");
	const [isRunning, setIsRunning] = useState(false);
	const [pendingPlan, setPendingPlan] = useState<AiPlan | null>(null);
	const abortRef = useRef<AbortController | null>(null);
	const messagesRef = useRef<AiMessage[]>(messages);
	messagesRef.current = messages;
	const templateIdRef = useRef(templateId);
	templateIdRef.current = templateId;

	const stop = useCallback(() => {
		abortRef.current?.abort();
		abortRef.current = null;
		setIsRunning(false);
	}, []);

	// Persist chat when it changes (skip while streaming to reduce thrash)
	useEffect(() => {
		if (isRunning) return;
		saveAiChat(templateIdRef.current, { mode, messages });
	}, [messages, mode, isRunning]);

	// Reload when template id changes
	useEffect(() => {
		abortRef.current?.abort();
		abortRef.current = null;
		setIsRunning(false);
		const next = loadAiChat(templateId);
		setMessages(next?.messages ?? []);
		setMode(next?.mode ?? "agent");
		setPendingPlan(null);
	}, [templateId]);

	const clearChat = useCallback(() => {
		stop();
		setMessages([]);
		setPendingPlan(null);
		clearAiChat(templateIdRef.current);
	}, [stop]);

	const runAgent = useCallback(
		async (input: {
			userText: string;
			attachments?: AiAttachment[];
			editorSnapshot?: EditorSnapshot;
			templateId?: string | null;
			executePlan?: AiPlan;
			modeOverride?: AiMode;
			/** When retrying, omit pushing a new user bubble */
			retryFromUserMessageId?: string;
			onHtmlDelta?: (html: string) => void;
			onHtmlFinal?: (html: string) => void;
		}) => {
			const runMode = input.modeOverride ?? mode;
			const controller = new AbortController();
			abortRef.current = controller;
			setIsRunning(true);

			const prior = messagesRef.current;
			let historyBase = prior;
			let userMsg: AiMessage;

			if (input.retryFromUserMessageId) {
				const idx = prior.findIndex(
					(m) => m.id === input.retryFromUserMessageId && m.role === "user",
				);
				if (idx >= 0 && prior[idx]) {
					userMsg = prior[idx];
					// Drop failed assistant after this user turn
					historyBase = prior.slice(0, idx + 1);
					setMessages(historyBase);
				} else {
					userMsg = {
						id: uid("user"),
						role: "user",
						content: input.userText,
						createdAt: Date.now(),
						attachments: input.attachments,
					};
					historyBase = [...prior, userMsg];
					setMessages(historyBase);
				}
			} else if (input.executePlan) {
				userMsg = {
					id: uid("user"),
					role: "user",
					content: `Execute plan: ${input.executePlan.summary}`,
					createdAt: Date.now(),
				};
				historyBase = [...prior, userMsg];
				setMessages(historyBase);
			} else {
				userMsg = {
					id: uid("user"),
					role: "user",
					content: input.userText,
					createdAt: Date.now(),
					attachments: input.attachments,
				};
				historyBase = [...prior, userMsg];
				setMessages(historyBase);
			}

			const assistantId = uid("assistant");
			const assistantMsg: AiMessage = {
				id: assistantId,
				role: "assistant",
				content: "",
				createdAt: Date.now(),
				steps: [],
				status: "streaming",
			};

			setMessages([...historyBase, assistantMsg]);

			const lastAssistantHtml = [...historyBase]
				.reverse()
				.find((m) => m.role === "assistant" && m.html)?.html;

			const history = [
				...historyBase
					.filter((m) => m.content.trim().length > 0)
					.map((m) => ({ role: m.role, content: m.content })),
			];

			const patchAssistant = (patch: Partial<AiMessage>) => {
				setMessages((prev) =>
					prev.map((m) => (m.id === assistantId ? { ...m, ...patch } : m)),
				);
			};

			const upsertStep = (
				stepId: string,
				label: string,
				status: AiStep["status"],
				extra?: { tool?: string; summary?: string },
			) => {
				setMessages((prev) =>
					prev.map((m) => {
						if (m.id !== assistantId) return m;
						const steps = [...(m.steps ?? [])];
						const idx = steps.findIndex((s) => s.id === stepId);
						const next: AiStep = {
							id: stepId,
							label,
							status,
							tool: extra?.tool,
							summary: extra?.summary,
						};
						if (idx >= 0 && steps[idx]) {
							steps[idx] = {
								...steps[idx],
								...next,
								summary: extra?.summary ?? steps[idx]?.summary,
								tool: extra?.tool ?? steps[idx]?.tool,
							};
						} else {
							steps.push(next);
						}
						return { ...m, steps };
					}),
				);
			};

			let assistantText = "";
			let finalHtml = "";
			let htmlAccum = "";

			try {
				const res = await fetch("/api/template/v1/ai/agent", {
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					signal: controller.signal,
					body: JSON.stringify({
						mode: runMode,
						messages: history,
						templateId: input.templateId ?? templateIdRef.current ?? undefined,
						editorSnapshot: {
							...input.editorSnapshot,
							renderedHtmlSnippet:
								lastAssistantHtml ||
								input.editorSnapshot?.renderedHtmlSnippet ||
								null,
						},
						attachments: input.attachments?.map((a) => ({
							url: a.url,
							mime: a.mime,
							name: a.name,
						})),
						executePlan: input.executePlan,
					}),
				});

				if (!res.ok || !res.body) {
					const err = await res.json().catch(() => null);
					throw new Error(
						err?.message || err?.error || `Agent failed (${res.status})`,
					);
				}

				const reader = res.body.getReader();
				const decoder = new TextDecoder();
				let buffer = "";

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					buffer += decoder.decode(value, { stream: true });
					const parsed = parseSseChunk(buffer);
					buffer = parsed.rest;

					for (const ev of parsed.events) {
						switch (ev.type) {
							case "step.started":
								if (ev.stepId && ev.label) {
									upsertStep(ev.stepId, ev.label, "running", {
										tool: ev.tool,
									});
								}
								break;
							case "step.finished":
								if (ev.stepId && ev.label) {
									upsertStep(
										ev.stepId,
										ev.label,
										ev.status === "error" ? "error" : "ok",
										{ tool: ev.tool, summary: ev.summary },
									);
								}
								break;
							case "text.delta":
								if (ev.text) {
									assistantText += ev.text;
									patchAssistant({ content: assistantText });
								}
								break;
							case "html.delta":
								if (ev.text) {
									htmlAccum += ev.text;
									input.onHtmlDelta?.(htmlAccum);
								}
								break;
							case "html.final":
								if (ev.html) {
									finalHtml = ev.html;
									htmlAccum = ev.html;
									patchAssistant({ html: ev.html });
									input.onHtmlFinal?.(ev.html);
								}
								break;
							case "plan":
								if (ev.plan) {
									setPendingPlan(ev.plan);
									patchAssistant({ plan: ev.plan, status: "planned" });
								}
								break;
							case "variables":
								if (ev.variables) {
									patchAssistant({ variables: ev.variables });
								}
								break;
							case "error":
								patchAssistant({
									error: ev.message || "Something went wrong",
									status: "error",
								});
								break;
							case "run.finished":
								patchAssistant({
									status:
										ev.status === "planned"
											? "planned"
											: ev.status === "error"
												? "error"
												: "done",
									html: finalHtml || undefined,
									content: assistantText,
								});
								break;
							default:
								break;
						}
					}
				}

				setMessages((prev) =>
					prev.map((m) =>
						m.id === assistantId && m.status === "streaming"
							? {
									...m,
									status: "done",
									content: assistantText,
									html: finalHtml || m.html,
								}
							: m,
					),
				);
			} catch (err) {
				if ((err as Error).name === "AbortError") {
					patchAssistant({
						content: `${assistantText}\n\n_Generation stopped._`,
						status: "done",
					});
				} else {
					const message =
						err instanceof Error ? err.message : "Agent run failed";
					patchAssistant({
						error: message,
						status: "error",
						content: assistantText || message,
					});
				}
			} finally {
				setIsRunning(false);
				abortRef.current = null;
			}
		},
		[mode],
	);

	return {
		messages,
		mode,
		setMode,
		isRunning,
		pendingPlan,
		setPendingPlan,
		stop,
		clearChat,
		runAgent,
		setMessages,
	};
}
