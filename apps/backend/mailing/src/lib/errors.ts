import { createError } from "evlog";

export class MailingError extends Error {
	constructor(
		public status: number,
		public message: string,
		public code?: string,
	) {
		super(message);
		this.name = "MailingError";
	}
}

export class BadRequestError extends MailingError {
	constructor(message: string) {
		super(400, message, "BAD_REQUEST");
		this.name = "BadRequestError";
	}
}

export class UnauthorizedError extends MailingError {
	constructor(message = "Authentication required") {
		super(401, message, "UNAUTHORIZED");
		this.name = "UnauthorizedError";
	}
}

export class ForbiddenError extends MailingError {
	constructor(message = "User is not a member of an organization") {
		super(403, message, "FORBIDDEN");
		this.name = "ForbiddenError";
	}
}

export class DomainNotFoundError extends MailingError {
	constructor(domainName: string) {
		super(
			404,
			`Domain ${domainName} not found or not authorized`,
			"DOMAIN_NOT_FOUND",
		);
		this.name = "DomainNotFoundError";
	}
}

export class MailboxNotFoundError extends MailingError {
	constructor(address: string) {
		super(
			404,
			`Mailbox ${address} not found or not authorized`,
			"MAILBOX_NOT_FOUND",
		);
		this.name = "MailboxNotFoundError";
	}
}

export class DNSHealthError extends MailingError {
	constructor(domainName: string, missingRecords: string[]) {
		super(
			400,
			`Domain ${domainName} has invalid DNS records: ${missingRecords.join(", ")}`,
			"DNS_HEALTH_ERROR",
		);
		this.name = "DNSHealthError";
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
