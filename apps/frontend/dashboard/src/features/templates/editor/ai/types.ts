export type AiMode = "agent" | "plan";

export type AiChatRole = "user" | "assistant";

export type AiAttachment = {
	id: string;
	url: string;
	mime: string;
	name: string;
	previewUrl?: string;
};

export type AiPlanStep = {
	id: string;
	title: string;
	detail?: string;
};

export type AiPlan = {
	id: string;
	summary: string;
	steps: AiPlanStep[];
};

export type AiStepStatus = "running" | "ok" | "error";

export type AiStep = {
	id: string;
	label: string;
	status: AiStepStatus;
	/** Tool name when this step maps to a real agent tool */
	tool?: string;
	/** Short result summary from the tool */
	summary?: string;
};

export type AiMessage = {
	id: string;
	role: AiChatRole;
	content: string;
	createdAt: number;
	attachments?: AiAttachment[];
	/** Steps associated with this assistant turn */
	steps?: AiStep[];
	plan?: AiPlan;
	html?: string;
	variables?: string[];
	error?: string;
	status?: "streaming" | "done" | "error" | "planned";
};

export type AgentSseEvent = {
	type: string;
	runId?: string;
	ts?: number;
	stepId?: string;
	label?: string;
	status?: string;
	tool?: string;
	summary?: string;
	text?: string;
	html?: string;
	plan?: AiPlan;
	variables?: string[];
	message?: string;
	mode?: AiMode;
};

export type EditorSnapshot = {
	subject?: string | null;
	previewText?: string | null;
	variables?: unknown;
	renderedHtmlSnippet?: string | null;
	contentJson?: string | null;
};
