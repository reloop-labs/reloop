import { t } from "elysia";
import { createError } from "evlog";

export const ErrorResponseSchema = t.Object({
	message: t.String(),
	why: t.Optional(t.String()),
	fix: t.Optional(t.String()),
	link: t.Optional(t.String()),
});

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
			message: reason ?? "Invalid domain",
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
	domainLimitReached: ({ used, limit }: { used: number; limit: number }) =>
		createError({
			status: 402,
			message: "Domain limit reached",
			why: `Your plan allows ${limit} custom domain${limit === 1 ? "" : "s"} and you already have ${used}.`,
			fix: "Delete an existing domain or upgrade your plan to add more.",
		}),
};

export const KumoMtaErrors = {
	domainNotFound: (domainName: string) =>
		createError({
			status: 404,
			message: "Domain not found",
			why: `The domain ${domainName} is not registered in our system.`,
			fix: "Please check the domain spelling and register it if needed.",
		}),
	domainNotActive: (domainName: string) =>
		createError({
			status: 404,
			message: "Domain not active",
			why: `The domain ${domainName} is found but is not active or verified.`,
			fix: "Verify the domain's DNS records and ensure its status is active.",
		}),
	domainDnsNotVerified: (domainName: string, reason: string) => {
		const detail = `Email was not sent. ${domainName} failed DNS verification. ${reason}. The domain status is now failed.`;
		return createError({
			status: 422,
			message: detail,
			why: detail,
			fix: "Update the DNS records at your provider, verify the domain in the dashboard, then send again.",
		});
	},
	dkimKeyNotFound: (domainName: string) =>
		createError({
			status: 404,
			message: "DKIM key not found",
			why: `Could not retrieve the DKIM signing key for domain ${domainName}.`,
			fix: "Generate a new DKIM record for this domain.",
		}),
	messageIdConflict: (messageId: string) =>
		createError({
			status: 409,
			message: "Message ID already exists",
			why: `An email with Message-ID ${messageId} has already been logged.`,
			fix: "Ensure that you are not sending duplicate logging requests.",
		}),
	failedToInsertLog: () =>
		createError({
			status: 400,
			message: "Failed to insert email log",
			why: "The system was unable to save the email log database entry.",
			fix: "Please try again later or verify database status.",
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
	messageTooLarge: ({
		actualBytes,
		limitBytes,
		planId,
	}: {
		actualBytes: number;
		limitBytes: number;
		planId: string;
	}) =>
		createError({
			status: 413,
			message: "Message too large",
			why: `This message is ${(actualBytes / (1024 * 1024)).toFixed(2)} MB, but your '${planId}' plan allows ${(limitBytes / (1024 * 1024)).toFixed(2)} MB per send`,
			fix: "Reduce attachment size or upgrade your plan for a larger limit",
		}),
	internalError: (reason: string) =>
		createError({
			status: 500,
			message: "Internal Error",
			why: reason,
			fix: "Check backend server logs.",
		}),
};
