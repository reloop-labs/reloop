import { create } from "zustand";

interface EmailHtmlEditorState {
	codeHtml: string;
	setCodeHtml: (html: string) => void;
	importedEmailCss: string;
	setImportedEmailCss: (css: string) => void;
	applyingFromSource: boolean;
	setApplyingFromSource: (applying: boolean) => void;
}

export const useEmailHtmlEditorStore = create<EmailHtmlEditorState>((set) => ({
	codeHtml: "",
	setCodeHtml: (codeHtml) =>
		set((s) => (s.codeHtml === codeHtml ? s : { codeHtml })),
	importedEmailCss: "",
	setImportedEmailCss: (importedEmailCss) =>
		set((s) =>
			s.importedEmailCss === importedEmailCss ? s : { importedEmailCss },
		),
	applyingFromSource: false,
	setApplyingFromSource: (applyingFromSource) =>
		set((s) =>
			s.applyingFromSource === applyingFromSource ? s : { applyingFromSource },
		),
}));
