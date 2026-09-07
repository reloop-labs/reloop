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
	billingDisabled: () =>
		createError({
			status: 503,
			message: "Hosted billing is disabled",
			why: "This Reloop instance is not connected to Polar checkout.",
			fix: "Self-host has no Reloop Cloud subscription. On Reloop Cloud, enable BILLING_ENABLED and Polar credentials.",
		}),
	polarNotConfigured: (planId?: string) =>
		createError({
			status: 503,
			message: "Polar product was not found",
			why: planId
				? `No Polar subscription product maps to the ${planId} plan.`
				: "No Polar subscription products could be loaded.",
			fix: "In Polar, create a recurring product named Individual or Startup, or set metadata plan_id to individual/startup.",
		}),
	invalidCheckoutPlan: (planId: string) =>
		createError({
			status: 400,
			message: "This plan cannot be purchased here",
			why: `Plan "${planId}" is not a hosted checkout plan.`,
			fix: "Choose Individual or Startup, or contact sales for Enterprise.",
		}),
	alreadyOnPlan: (planId: string) =>
		createError({
			status: 409,
			message: "Already on this plan",
			why: `This organization is already on the ${planId} plan.`,
			fix: "Pick a different plan or manage billing in the customer portal.",
		}),
	polarCustomerMissing: (organizationId: string) =>
		createError({
			status: 409,
			message: "Billing customer is not ready",
			why: `Organization ${organizationId} does not have a Polar customer yet.`,
			fix: "Add a billing email on the organization and try again.",
		}),
	webhookInvalid: () =>
		createError({
			status: 403,
			message: "Invalid Polar webhook signature",
			why: "The webhook payload could not be verified.",
			fix: "Confirm POLAR_WEBHOOK_SECRET matches the Polar endpoint secret.",
		}),
};
