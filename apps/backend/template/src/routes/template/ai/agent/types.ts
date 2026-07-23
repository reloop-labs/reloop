export type AgentMode = "agent" | "plan";

export type AgentChatRole = "user" | "assistant" | "system";

export type AgentChatMessage = {
	role: AgentChatRole;
	content: string;
};

export type AgentAttachment = {
	url: string;
	mime: string;
	name: string;
};

export type EditorSnapshot = {
	subject?: string | null;
	previewText?: string | null;
	variables?: unknown;
	renderedHtmlSnippet?: string | null;
	/** TipTap JSON string (optional, truncated by client) */
	contentJson?: string | null;
};

export type AgentPlanStep = {
	id: string;
	title: string;
	detail?: string;
};

export type AgentPlan = {
	id: string;
	summary: string;
	steps: AgentPlanStep[];
};

export type AgentEventType =
	| "run.started"
	| "step.started"
	| "step.finished"
	| "plan"
	| "text.delta"
	| "html.delta"
	| "html.final"
	| "variables"
	| "error"
	| "run.finished";

export type AgentEvent = {
	type: AgentEventType;
	runId: string;
	ts: number;
	// biome-ignore lint/suspicious/noExplicitAny: event payloads vary by type
	[key: string]: any;
};

export type AgentRequestBody = {
	mode: AgentMode;
	messages: AgentChatMessage[];
	templateId?: string;
	editorSnapshot?: EditorSnapshot;
	attachments?: AgentAttachment[];
	/** When set in plan mode, execute this approved plan instead of only planning */
	executePlan?: AgentPlan;
	model?: string;
	system?: string;
};
