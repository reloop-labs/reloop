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
}));
