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
	dnsHealthError: (domainName: string, reason: string) => {
		const detail = `Email was not sent. ${domainName} failed DNS verification. ${reason}. The domain status is now failed.`;
		return createError({
			status: 400,
			message: detail,
			why: detail,
			fix: "Update the DNS records at your provider, verify the domain in the dashboard, then send again.",
		});
	},
	dnsLookupFailed: (domainName: string) => {
		const detail = `Email was not sent. DNS for ${domainName} could not be checked just now, so the message was not accepted.`;
		return createError({
			status: 503,
			message: detail,
			why: detail,
			fix: "Retry in a moment. If this keeps happening, confirm the domain's DNS records are still published.",
		});
	},
	sendingDisabled: (domainName: string) => {
		const detail = `Email was not sent. Sending is turned off for ${domainName}.`;
		return createError({
			status: 400,
			message: detail,
			why: detail,
			fix: "Enable sending on this domain in the dashboard, publish the SPF, DKIM, and DMARC records, then try again.",
		});
	},
	domainSuspended: (domainName: string) => {
		const detail = `Email was not sent. ${domainName} is suspended.`;
		return createError({
			status: 400,
			message: detail,
			why: detail,
			fix: "Contact support if this domain should be allowed to send.",
		});
	},
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
	attachmentLoadFailed: (path: string, reason: string) =>
		createError({
			status: 400,
			message: "Attachment could not be loaded",
			why: `Could not read attachment '${path}': ${reason}`,
			fix: "Re-upload the file and send again. Attachments are loaded from the upload service, not from the mail server disk.",
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
	quotaExceeded: ({
		remaining,
		required,
		monthlyCredits,
	}: {
		remaining: number;
		required: number;
		monthlyCredits: number;
	}) =>
		createError({
			status: 402,
			message: "Email quota exceeded",
			why: `This send needs ${required} credit${required === 1 ? "" : "s"}, but only ${remaining} remain of ${monthlyCredits} this period`,
			fix: "Upgrade your plan, wait for the monthly reset, or reduce recipients for this send",
		}),
	dailyQuotaExceeded: ({
		used,
		limit,
		required,
	}: {
		used: number;
		limit: number;
		required: number;
	}) =>
		createError({
			status: 402,
			message: "Daily email limit reached",
			why: `This send needs ${required} email${required === 1 ? "" : "s"}, but you have already sent ${used} of ${limit} today`,
			fix: "Wait until the daily limit resets, or upgrade your plan to remove the daily cap",
		}),
	abuseBlocked: (reasons: string[]) =>
		createError({
			status: 403,
			message: "Message rejected",
			why: `This send matches outbound abuse patterns (${reasons.join(", ")}) and was not accepted`,
			fix: "Remove phishing content and carrier SMS/MMS gateway recipients, then contact support if this is legitimate mail",
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
