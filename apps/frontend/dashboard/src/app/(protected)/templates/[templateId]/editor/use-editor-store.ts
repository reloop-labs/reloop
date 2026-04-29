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
	status: "draft" | "published" | "archived";

	// Actions — Metadata
	initializeTemplate: (template: {
		name?: string | null;
		subject?: string | null;
		status?: "draft" | "published" | "archived";
	}) => void;
	markDirty: () => void;
	markSaved: (status?: "draft" | "published" | "archived") => void;
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
	status: "draft",

	// ----- Metadata Actions -----
	initializeTemplate: (template) =>
		set({
			templateName: template.name || "Untitled Template",
			subject: template.subject || "",
			status: template.status || "draft",
			isDirty: false,
		}),
	markDirty: () => set({ isDirty: true }),
	markSaved: (status) =>
		set((state) => ({
			isDirty: false,
			status: status || state.status,
		})),
	setTemplateName: (name) => set({ templateName: name, isDirty: true }),
	setSenderName: (name) => set({ senderName: name, isDirty: true }),
	setFromEmail: (email) => set({ fromEmail: email, isDirty: true }),
	setReplyTo: (email) => set({ replyTo: email, isDirty: true }),
	setSubject: (subject) => set({ subject, isDirty: true }),
}));
