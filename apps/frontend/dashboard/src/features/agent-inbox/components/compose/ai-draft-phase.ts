/** AI draft UX: shimmer existing text → stream replacement → review / reject. */
export type AiDraftPhase = "idle" | "thinking" | "streaming" | "review";

export const isAiDraftBusy = (phase: AiDraftPhase) =>
	phase === "thinking" || phase === "streaming";

export const isAiDraftActive = (phase: AiDraftPhase) => phase !== "idle";
