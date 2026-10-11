import { create } from "zustand";

export type ToolVariableType = "string" | "number";

export interface ToolVariable {
	name: string;
	type: ToolVariableType;
	defaultValue: string | null;
}

export type EditorViewMode = "visual" | "code" | "variables";

/**
 * Browser-only editor state for the public tool. Mirrors the dashboard
 * store's editor fields; there is no save, send, history, or AI state.
 */
interface EditorState {
	viewMode: EditorViewMode;
	setViewMode: (mode: EditorViewMode) => void;

	previewText: string;
	setPreviewText: (text: string) => void;
	subject: string;
	setSubject: (subject: string) => void;
	isGenerating: boolean;

	isCreatingVar: boolean;
	setIsCreatingVar: (open: boolean) => void;
	variables: ToolVariable[];
	setVariables: (variables: ToolVariable[]) => void;
	upsertVariable: (variable: ToolVariable, originalName?: string) => void;
	removeVariable: (name: string) => void;

	// HTML currently shown in the code editor / HTML preview iframe
	codeHtml: string;
	setCodeHtml: (html: string) => void;
	htmlLocked: boolean;
	setHtmlLocked: (locked: boolean) => void;
	importedEmailCss: string;
	setImportedEmailCss: (css: string) => void;
	/** True while source HTML is being applied; canvas updates then are not user edits. */
	applyingFromSource: boolean;
	setApplyingFromSource: (applying: boolean) => void;
	setHasUnsavedChanges: (hasChanges: boolean) => void;

	reset: () => void;
}

const initialState = {
	viewMode: "visual" as EditorViewMode,
	previewText: "",
	subject: "",
	isGenerating: false,
	isCreatingVar: false,
	variables: [] as ToolVariable[],
	codeHtml: "",
	htmlLocked: false,
	importedEmailCss: "",
	applyingFromSource: false,
};

export const useEditorStore = create<EditorState>((set) => ({
	...initialState,
	setViewMode: (viewMode) => set({ viewMode }),
	setPreviewText: (previewText) => set({ previewText }),
	setSubject: (subject) => set({ subject }),
	setIsCreatingVar: (isCreatingVar) => set({ isCreatingVar }),
	setVariables: (variables) => set({ variables }),
	upsertVariable: (variable, originalName) =>
		set((s) => {
			const key = originalName ?? variable.name;
			const exists = s.variables.some((v) => v.name === key);
			return {
				variables: exists
					? s.variables.map((v) => (v.name === key ? variable : v))
					: [...s.variables, variable],
			};
		}),
	removeVariable: (name) =>
		set((s) => ({ variables: s.variables.filter((v) => v.name !== name) })),
	codeHtml: "",
	setCodeHtml: (codeHtml) =>
		set((s) => (s.codeHtml === codeHtml ? s : { codeHtml })),
	setHtmlLocked: (htmlLocked) =>
		set((s) => (s.htmlLocked === htmlLocked ? s : { htmlLocked })),
	setImportedEmailCss: (importedEmailCss) =>
		set((s) =>
			s.importedEmailCss === importedEmailCss ? s : { importedEmailCss },
		),
	setApplyingFromSource: (applyingFromSource) =>
		set((s) =>
			s.applyingFromSource === applyingFromSource ? s : { applyingFromSource },
		),
	// Nothing is saved in the tool, so unsaved-change tracking is a no-op.
	setHasUnsavedChanges: () => {},
	reset: () => set(initialState),
}));
