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

export const CreditErrors = {
	creditsNotFound: (organizationId: string) =>
		createError({
			status: 404,
			message: "Credits ledger not found",
			why: `No credit records or active plan found for organization ID ${organizationId}.`,
			fix: "Ensure the organization has been provisioned and has a subscription set up.",
		}),
	insufficientCredits: (
		organizationId: string,
		required: number,
		available: number,
	) =>
		createError({
			status: 403,
			message: "Insufficient credits",
			why: `Organization ${organizationId} requires ${required} credits, but only has ${available} available.`,
			fix: "Top up your organization's credits balance or upgrade your plan to continue.",
		}),
	invalidAmount: (amount: number) =>
		createError({
			status: 400,
			message: "Invalid top-up amount",
			why: `The specified top-up amount ${amount} is invalid (must be a positive number).`,
			fix: "Specify an amount greater than zero.",
		}),
	topupFailed: (organizationId: string, details?: string) =>
		createError({
			status: 500,
			message: "Credit top-up failed",
			why: `An error occurred while adding credits to organization ${organizationId}${details ? `: ${details}` : ""}.`,
			fix: "Please verify database connection and credentials, and try again.",
		}),
	databaseError: (message: string) =>
		createError({
			status: 500,
			message: "Database operation failed",
			why: message,
			fix: "Please try again later or contact support if the issue persists.",
		}),
};
