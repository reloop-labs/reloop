import { create } from "zustand";

interface EditorState {
	senderName: string;
	setSenderName: (name: string) => void;
	fromEmail: string;
	setFromEmail: (email: string) => void;
	replyTo: string;
	setReplyTo: (email: string) => void;
	previewText: string;
	setPreviewText: (text: string) => void;
	subject: string;
	setSubject: (subject: string) => void;
	isGenerating: boolean;
	setIsGenerating: (isGenerating: boolean) => void;
	generatingContent: string;
	setGeneratingContent: (content: string) => void;
	lastAiPrompt: string;
	setLastAiPrompt: (prompt: string) => void;

	// Draft/Publish save status tracking
	lastSavedAt: Date | null;
	lastSavedDraftNumber: number | null;
	hasUnsavedChanges: boolean;
	isSavingDraft: boolean;
	isPublishing: boolean;
	setLastSaved: (draftNumber: number | null, date: Date) => void;
	setHasUnsavedChanges: (hasChanges: boolean) => void;
	setIsSavingDraft: (saving: boolean) => void;
	setIsPublishing: (publishing: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
	senderName: "",
	setSenderName: (senderName) => set({ senderName }),
	fromEmail: "",
	setFromEmail: (fromEmail) => set({ fromEmail }),
	replyTo: "",
	setReplyTo: (replyTo) => set({ replyTo }),
	previewText: "",
	setPreviewText: (previewText) => set({ previewText }),
	subject: "",
	setSubject: (subject) => set({ subject }),
	isGenerating: false,
	setIsGenerating: (isGenerating) => set({ isGenerating }),
	generatingContent: "",
	setGeneratingContent: (generatingContent) => set({ generatingContent }),
	lastAiPrompt: "",
	setLastAiPrompt: (lastAiPrompt) => set({ lastAiPrompt }),

	// Draft/Publish save status
	lastSavedAt: null,
	lastSavedDraftNumber: null,
	hasUnsavedChanges: false,
	isSavingDraft: false,
	isPublishing: false,
	setLastSaved: (draftNumber, date) =>
		set({
			lastSavedDraftNumber: draftNumber,
			lastSavedAt: date,
			hasUnsavedChanges: false,
		}),
	setHasUnsavedChanges: (hasUnsavedChanges) => set({ hasUnsavedChanges }),
	setIsSavingDraft: (isSavingDraft) => set({ isSavingDraft }),
	setIsPublishing: (isPublishing) => set({ isPublishing }),
}));
