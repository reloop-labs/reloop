export type SupportConversation = {
	id: string;
	userId: string;
	organizationId: string | null;
	status: "open" | "closed";
	lastMessageAt: string;
	lastMessagePreview: string | null;
	createdAt: string;
	updatedAt: string;
	userName: string | null;
	userEmail: string | null;
};

export type SupportMessage = {
	id: string;
	conversationId: string;
	senderUserId: string;
	senderRole: "user" | "admin";
	body: string;
	createdAt: string;
	senderName: string | null;
	senderEmail: string | null;
};

export type SupportServerEvent =
	| { type: "ready"; userId: string; isPlatformAdmin: boolean }
	| { type: "joined"; conversationId: string }
	| { type: "left"; conversationId: string }
	| { type: "message_created"; message: SupportMessage }
	| { type: "conversation_updated"; conversation: SupportConversation }
	| { type: "error"; message: string };

export function supportWsUrl() {
	if (typeof window === "undefined") return "";
	const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
	return `${proto}//${window.location.host}/api/admin/v1/support/ws`;
}
