import { createError } from "evlog";

export class DomainServiceError extends Error {
	constructor(
		public status: number,
		public message: string,
		public code?: string,
	) {
		super(message);
		this.name = "DomainServiceError";
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

export const DomainErrors = {
	domainAlreadyExists: (domain: string) =>
		createError({
			status: 409,
			message: "Domain already exists",
			why: `The domain ${domain} is already registered in our system for your organization.`,
			fix: "Try using a different domain or manage the existing one from your dashboard.",
		}),
	domainNotFound: (domainId: string) =>
		createError({
			status: 404,
			message: "Domain not found",
			why: `The domain with ID ${domainId} was not found or you don't have permission to access it.`,
			fix: "Verify the domain ID and ensure it belongs to your active organization.",
		}),
	invalidDomain: (domain: string, reason?: string) =>
		createError({
			status: 400,
			message: "Invalid domain",
			why: reason ?? `The domain ${domain} is invalid or cannot be processed.`,
			fix: "Ensure you are providing a valid FQDN (e.g., example.com).",
		}),
	failedToUndelete: (domain: string) =>
		createError({
			status: 500,
			message: "Failed to undelete domain",
			why: `An error occurred while trying to restore the domain ${domain}.`,
			fix: "Please try again later or contact support if the issue persists.",
		}),
	verificationFailed: (domainName: string, details: string) =>
		createError({
			status: 500,
			message: "Verification process failed",
			why: `Could not start or complete verification for ${domainName}: ${details}`,
			fix: "Check your DNS settings and try again.",
		}),
	databaseError: (message: string) =>
		createError({
			status: 500,
			message: "Database operation failed",
			why: message,
			fix: "Please try again later or contact support.",
		}),
};
