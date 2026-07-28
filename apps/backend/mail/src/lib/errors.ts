import { createError } from "evlog";

export class MailError extends Error {
	constructor(
		public status: number,
		public message: string,
		public code?: string,
	) {
		super(message);
		this.name = "MailError";
	}
}

export class BadRequestError extends MailError {
	constructor(message: string) {
		super(400, message, "BAD_REQUEST");
		this.name = "BadRequestError";
	}
}

export class UnauthorizedError extends MailError {
	constructor(message = "Authentication required") {
		super(401, message, "UNAUTHORIZED");
		this.name = "UnauthorizedError";
	}
}

export class ForbiddenError extends MailError {
	constructor(message = "User is not a member of an organization") {
		super(403, message, "FORBIDDEN");
		this.name = "ForbiddenError";
	}
}

export class DomainNotFoundError extends MailError {
	constructor(domainName: string) {
		super(
			404,
			`Domain ${domainName} not found or not authorized`,
			"DOMAIN_NOT_FOUND",
		);
		this.name = "DomainNotFoundError";
	}
}

export class MailboxNotFoundError extends MailError {
	constructor(address: string) {
		super(
			404,
			`Mailbox ${address} not found or not authorized`,
			"MAILBOX_NOT_FOUND",
		);
		this.name = "MailboxNotFoundError";
	}
}

export class DNSHealthError extends MailError {
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

export const MailErrors = {
	domainNotFound: (domainName: string) =>
		createError({
			status: 404,
			message: "Domain not found",
			why: `The domain ${domainName} was not found or is not authorized for your organization`,
			fix: "Ensure the domain is registered and verified in your dashboard",
		}),
	dnsHealthError: (domainName: string, missingRecords: string[]) =>
		createError({
			status: 400,
			message: "DNS health check failed",
			why: `Domain ${domainName} is missing required DNS records: ${missingRecords.join(", ")}`,
			fix: "Update your DNS configuration with the required SPF, DKIM, and DMARC records",
		}),
	invalidFromAddress: (from: string) =>
		createError({
			status: 400,
			message: "Invalid sender address",
			why: `The address '${from}' is not a valid email format`,
			fix: "Provide a valid email address in the 'from' field (e.g., user@example.com)",
		}),
	templateNotFound: (templateId: string) =>
		createError({
			status: 404,
			message: "Template not found",
			why: `The template with ID ${templateId} was not found or is not authorized for your organization`,
			fix: "Verify the template ID and ensure it exists and is not deleted",
		}),
	kumoMtaError: (status: number, body: string) =>
		createError({
			status: 500,
			message: "Failed to transmit email",
			why: `KumoMTA server rejected the request with status ${status}: ${body}`,
			fix: "Check the mail service logs and ensure KumoMTA is healthy",
		}),
	databaseError: (message: string) =>
		createError({
			status: 500,
			message: "Database operation failed",
			why: message,
			fix: "Please try again later or contact support if the issue persists",
		}),
	emailNotFound: (emailId: string) =>
		createError({
			status: 404,
			message: "Email not found",
			why: `The email with ID ${emailId} was not found or is not authorized for your organization`,
			fix: "Verify the email ID and ensure it belongs to your organization",
		}),
	attachmentNotFound: (attachmentId: string) =>
		createError({
			status: 404,
			message: "Attachment not found",
			why: `The attachment with ID ${attachmentId} was not found`,
			fix: "Verify the attachment ID and ensure it exists for the given email",
		}),
	invalidTrackingUrl: (url: string) =>
		createError({
			status: 400,
			message: "Invalid tracking URL",
			why: `The provided URL '${url}' is not valid or missing`,
			fix: "Ensure the tracking link includes a valid destination URL",
		}),
	invalidTrackingSignature: () =>
		createError({
			status: 403,
			message: "Invalid tracking signature",
			why: "The tracking link has been tampered with or is invalid",
			fix: "Ensure the tracking link has not been modified or corrupted",
		}),
	missingEmailBody: () =>
		createError({
			status: 400,
			message: "Missing email body",
			why: "Neither 'html' nor 'text' body was provided, and the referenced template has no rendered content",
			fix: "Provide at least one of 'html' or 'text' in the request body, or ensure the template has rendered HTML",
		}),
	platformDomainReserved: (domainName: string) =>
		createError({
			status: 400,
			message: "Platform domain not allowed",
			why: `You cannot send from ${domainName} via the public send API. That domain is reserved for Reloop platform test emails.`,
			fix: "Add and verify your own domain, then send from an address on that domain.",
		}),
	platformTestDisabled: () =>
		createError({
			status: 403,
			message: "Platform test email disabled",
			why: "Sending via the platform test domain is disabled on this deployment.",
			fix: "Configure PLATFORM_TEST_ENABLED and a verified platform sender domain, or use your own domain.",
		}),
	platformTestRecipientRequired: () =>
		createError({
			status: 400,
			message: "Recipient required",
			why: "Platform test emails can only be delivered to your account email, which is missing.",
			fix: "Update your profile email, then try again.",
		}),
	platformTestRecipientLocked: (allowedEmail: string) =>
		createError({
			status: 400,
			message: "Recipient not allowed",
			why: `Platform test emails can only be sent to your account email (${allowedEmail}).`,
			fix: "Send the test to your own inbox, or verify your own domain for production sends.",
		}),
	platformTestRateLimited: (retryAfter: number) =>
		createError({
			status: 429,
			message: "Too many test emails",
			why: "You have sent too many platform test emails in a short period.",
			fix: `Wait ${retryAfter} seconds before trying again.`,
		}),
};

export const RateLimitErrors = {
	rateLimitExceeded: (layer: string, retryAfter: number) =>
		createError({
			status: 429,
			message: "Too Many Requests",
			why: `Rate limit exceeded on the ${layer} layer. You have sent too many requests in the current time window.`,
			fix: `Please wait ${retryAfter} seconds before retrying, or contact support to increase your limits.`,
		}),
};
