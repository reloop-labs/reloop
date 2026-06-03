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

export class BadRequestError extends InboxError {
	constructor(message: string) {
		super(400, message, "BAD_REQUEST");
		this.name = "BadRequestError";
	}
}

export class UnauthorizedError extends InboxError {
	constructor(message = "Authentication required") {
		super(401, message, "UNAUTHORIZED");
		this.name = "UnauthorizedError";
	}
}

export class ForbiddenError extends InboxError {
	constructor(message = "User is not a member of an organization") {
		super(403, message, "FORBIDDEN");
		this.name = "ForbiddenError";
	}
}

export class MailboxNotFoundError extends InboxError {
	constructor(address: string) {
		super(
			404,
			`Mailbox ${address} not found or not authorized`,
			"MAILBOX_NOT_FOUND",
		);
		this.name = "MailboxNotFoundError";
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
