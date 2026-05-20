import { createError } from "evlog";

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

export const WebhookErrors = {
	notFound: (webhookId: string) =>
		createError({
			status: 404,
			message: "Webhook not found",
			why: `No webhook with ID "${webhookId}" exists for your organization.`,
			fix: "Verify the webhook ID and ensure it belongs to your active organization.",
		}),
	alreadyExists: () =>
		createError({
			status: 409,
			message: "Webhook name already exists",
			why: "A webhook with this configuration or name already exists for your organization.",
			fix: "Use the existing webhook or delete it before creating a new one.",
		}),
	invalidUrl: (url: string) =>
		createError({
			status: 400,
			message: "Invalid webhook URL format",
			why: `The URL "${url}" is not a valid webhook destination.`,
			fix: "Ensure you are providing a valid HTTP/HTTPS URL (e.g., https://example.com/webhook).",
		}),
	createFailed: (message?: string) =>
		createError({
			status: 500,
			message: message || "Failed to create webhook",
			why: "An unexpected error occurred while inserting the webhook into the database.",
			fix: "Please try again later or contact support if the issue persists.",
		}),
	updateFailed: (webhookId: string) =>
		createError({
			status: 500,
			message: "Failed to update webhook",
			why: `An unexpected error occurred while updating the webhook "${webhookId}".`,
			fix: "Please try again later or contact support if the issue persists.",
		}),
	deleteFailed: (webhookId: string) =>
		createError({
			status: 500,
			message: "Failed to delete webhook",
			why: `An unexpected error occurred while deleting the webhook "${webhookId}".`,
			fix: "Please try again later or contact support if the issue persists.",
		}),
	databaseError: (message: string) =>
		createError({
			status: 500,
			message: "Database operation failed",
			why: message,
			fix: "Please try again later or contact support.",
		}),
};
