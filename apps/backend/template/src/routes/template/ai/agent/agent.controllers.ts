import {
	TOOL_LABELS,
	shouldRevise,
	toolAnalyzeReferences,
	toolCreatePlan,
	toolCritiqueEmail,
	toolExtractVariables,
	toolGenerateEmailHtml,
	toolGetEditorSnapshot,
	toolReviseEmailHtml,
	type ToolContext,
} from "./tools";
import type { AgentEvent, AgentRequestBody } from "./types";

function encodeEvent(event: AgentEvent): Uint8Array {
	return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

function runId() {
	return `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

type EmitFn = (partial: Omit<AgentEvent, "runId" | "ts">) => void;

async function runToolStep<T>(
	emit: EmitFn,
	toolName: string,
	fn: () => Promise<{ ok: boolean; data: T; summary: string }> | {
		ok: boolean;
		data: T;
		summary: string;
	},
): Promise<{ ok: boolean; data: T; summary: string }> {
	const label = TOOL_LABELS[toolName] ?? toolName;
	emit({
		type: "step.started",
		stepId: toolName,
		label,
		tool: toolName,
	});
	try {
		const result = await fn();
		emit({
			type: "step.finished",
			stepId: toolName,
			label,
			tool: toolName,
			status: result.ok ? "ok" : "error",
			summary: result.summary,
		});
		return result;
	} catch (err) {
		const message = err instanceof Error ? err.message : "Tool failed";
		emit({
			type: "step.finished",
			stepId: toolName,
			label,
			tool: toolName,
			status: "error",
			summary: message,
		});
		throw err;
	}
}

/**
 * Multi-step tool loop over SSE.
 * Tools are real functions (snapshot, plan, generate/revise, extract, critique)
 * so steps reflect actual work even when the base model lacks native tool-calling.
 */
export function createAgentEventStream(body: AgentRequestBody): Response {
	const id = runId();
	const mode = body.mode === "plan" ? "plan" : "agent";
	const messages = body.messages?.length
		? body.messages
		: [{ role: "user" as const, content: "Create a simple welcome email" }];

	const stream = new ReadableStream<Uint8Array>({
		async start(controller) {
			const emit: EmitFn = (partial) => {
				controller.enqueue(
					encodeEvent({
						...partial,
						runId: id,
						ts: Date.now(),
					} as AgentEvent),
				);
			};

			const ctx: ToolContext = {
				messages,
				editorSnapshot: body.editorSnapshot,
				attachments: body.attachments,
				executePlan: body.executePlan,
				model: body.model,
			};

			try {
				emit({ type: "run.started", mode });

				// 1) Always read context
				const snapResult = await runToolStep(emit, "get_editor_snapshot", () =>
					toolGetEditorSnapshot(ctx),
				);
				emit({
					type: "text.delta",
					text: `${snapResult.summary}.\n`,
				});

				// 1b) Reference images / vision
				if (ctx.attachments?.length) {
					const refResult = await runToolStep(emit, "analyze_references", () =>
						toolAnalyzeReferences(ctx),
					);
					emit({
						type: "text.delta",
						text: `${refResult.summary}.\n`,
					});
					if (refResult.data.warning) {
						emit({
							type: "text.delta",
							text: `⚠️ ${refResult.data.warning}\n`,
						});
					} else if (refResult.data.vision) {
						emit({
							type: "text.delta",
							text: "I'll match layout and palette from your reference image(s).\n",
						});
					}
				}

				// 2) Plan-only
				if (mode === "plan" && !body.executePlan) {
					emit({
						type: "text.delta",
						text: "I'll outline a plan before writing any HTML.\n",
					});
					const planResult = await runToolStep(emit, "create_plan", () =>
						toolCreatePlan(ctx),
					);
					emit({ type: "plan", plan: planResult.data });
					emit({
						type: "text.delta",
						text: `\n**Plan ready:** ${planResult.data.summary}\n\nReview the steps, then click **Execute plan** to generate the email.`,
					});
					emit({ type: "run.finished", status: "planned" });
					controller.close();
					return;
				}

				// 3) Generate or revise HTML
				const revise = shouldRevise(ctx);
				emit({
					type: "text.delta",
					text: body.executePlan
						? "Executing your plan and writing the email HTML…\n"
						: revise
							? "Revising the current template from your instructions…\n"
							: "Designing and writing the email HTML…\n",
				});

				const htmlTool = revise ? "revise_email_html" : "generate_email_html";
				const htmlResult = await runToolStep(emit, htmlTool, () =>
					revise
						? toolReviseEmailHtml(ctx, (chunk) => {
								emit({ type: "html.delta", text: chunk });
							})
						: toolGenerateEmailHtml(ctx, (chunk) => {
								emit({ type: "html.delta", text: chunk });
							}),
				);

				if (!htmlResult.ok || !htmlResult.data.html) {
					emit({
						type: "error",
						message:
							htmlResult.summary ||
							"Model returned empty HTML. Try again with a clearer brief.",
					});
					emit({ type: "run.finished", status: "error" });
					controller.close();
					return;
				}

				const html = htmlResult.data.html;
				ctx.lastHtml = html;

				// 4) Extract variables
				const varsResult = await runToolStep(emit, "extract_variables", () =>
					toolExtractVariables(html),
				);
				emit({
					type: "variables",
					variables: varsResult.data.variables,
				});

				// 5) Critique
				const critique = await runToolStep(emit, "critique_email", () =>
					toolCritiqueEmail(html),
				);
				emit({
					type: "text.delta",
					text: `\n${critique.summary}`,
				});
				if (critique.data.notes.length > 1) {
					const extra = critique.data.notes
						.slice(1)
						.map((n) => `· ${n}`)
						.join("\n");
					if (extra) {
						emit({ type: "text.delta", text: `\n${extra}` });
					}
				}

				// 6) Final HTML for apply
				emit({ type: "html.final", html });
				const vars = varsResult.data.variables;
				emit({
					type: "text.delta",
					text:
						vars.length > 0
							? `\n\nDone. Variables: ${vars.map((v) => `{{${v}}}`).join(", ")}.`
							: "\n\nDone. You can refine with a follow-up message.",
				});

				emit({ type: "run.finished", status: "ok" });
				controller.close();
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Agent run failed";
				controller.enqueue(
					encodeEvent({
						type: "error",
						runId: id,
						ts: Date.now(),
						message,
					}),
				);
				controller.enqueue(
					encodeEvent({
						type: "run.finished",
						runId: id,
						ts: Date.now(),
						status: "error",
					}),
				);
				controller.close();
			}
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream; charset=utf-8",
			"Cache-Control": "no-cache, no-transform",
			Connection: "keep-alive",
			"X-Content-Type-Options": "nosniff",
		},
	});
}
