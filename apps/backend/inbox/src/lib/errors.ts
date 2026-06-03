import { createError } from "evlog";

export class InboxError extends Error {
	constructor(
		public status: number,
		public message: string,
		public code?: string,
	) {
		super(message);
		this.name = "InboxError";
	}
}

export const AuthErrors = {
	unauthorized: (why: string, fix?: string) =>
		createError({
			status: 401,
			message: "Unauthorized",
			why,
			fix: fix ?? "Please provide valid credentials",
		}),
	authenticationFailed: (why: string, fix?: string) =>
		createError({
			status: 401,
			message: "Authentication failed",
			why,
			fix: fix ?? "Check your credentials and try again",
		}),
};

export const InboxErrors = {
	mailboxNotFound: (address: string) =>
		createError({
			status: 404,
			message: "Mailbox not found",
			why: `The mailbox ${address} was not found or is not authorized for your organization`,
			fix: "Ensure the mailbox exists and belongs to your organization",
		}),
	messageNotFound: (messageId: string) =>
		createError({
			status: 404,
			message: "Message not found",
			why: `The message with ID ${messageId} was not found`,
			fix: "Verify the message ID and ensure it belongs to your organization",
		}),
	databaseError: (message: string) =>
		createError({
			status: 500,
			message: "Database operation failed",
			why: message,
			fix: "Please try again later or contact support if the issue persists",
		}),
};
