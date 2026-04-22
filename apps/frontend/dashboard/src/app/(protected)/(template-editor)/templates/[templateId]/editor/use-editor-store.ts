import { create } from "zustand";

// ============ Editor State ============

interface EditorState {
	// Dirty state
	isDirty: boolean;

	// Email metadata
	templateName: string;
	senderName: string;
	fromEmail: string;
	replyTo: string;
	subject: string;

	// Actions — Metadata
	setTemplateName: (name: string) => void;
	setSenderName: (name: string) => void;
	setFromEmail: (email: string) => void;
	setReplyTo: (email: string) => void;
	setSubject: (subject: string) => void;
}

// ============ Store ============
export const useEditorStore = create<EditorState>((set) => ({
	// Initial state
	isDirty: false,

	// Email metadata
	templateName: "Untitled Template",
	senderName: "",
	fromEmail: "",
	replyTo: "",
	subject: "",

	// ----- Metadata Actions -----
	setTemplateName: (name) => set({ templateName: name, isDirty: true }),
	setSenderName: (name) => set({ senderName: name, isDirty: true }),
	setFromEmail: (email) => set({ fromEmail: email, isDirty: true }),
	setReplyTo: (email) => set({ replyTo: email, isDirty: true }),
	setSubject: (subject) => set({ subject, isDirty: true }),
}));
