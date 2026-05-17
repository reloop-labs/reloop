import { errorCodes } from "@reloop/api-key/api-key.error-code";
import { status } from "elysia";
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

export const ApiKeyErrors = {
	notFound: (apiKeyId: string) =>
		createError({
			status: 404,
			message: "API key not found",
			why: `No API key with ID "${apiKeyId}" exists for your organization.`,
			fix: "Verify the API key ID and ensure it belongs to your active organization.",
		}),
	alreadyExists: () =>
		createError({
			status: 409,
			message: "API key already exists",
			why: "An API key with this configuration already exists for your organization.",
			fix: "Use the existing API key or delete it before creating a new one.",
		}),
	invalid: (why?: string) =>
		createError({
			status: 401,
			message: "Invalid API key",
			why: why ?? "The provided API key is not valid.",
			fix: "Ensure you are using a valid and active API key.",
		}),
	expired: (apiKeyId: string) =>
		createError({
			status: 401,
			message: "API key expired",
			why: `The API key "${apiKeyId}" has passed its expiration date.`,
			fix: "Create a new API key or rotate the existing one.",
		}),
	disabled: (apiKeyId: string) =>
		createError({
			status: 403,
			message: "API key disabled",
			why: `The API key "${apiKeyId}" is currently disabled.`,
			fix: "Enable the API key from your dashboard before using it.",
		}),
	rateLimited: (apiKeyId: string) =>
		createError({
			status: 429,
			message: "Rate limit exceeded",
			why: `The API key "${apiKeyId}" has exceeded its allowed request rate.`,
			fix: "Wait before retrying, or contact support to adjust your rate limits.",
		}),
	createFailed: () =>
		createError({
			status: 500,
			message: "Failed to create API key",
			why: "An unexpected error occurred while inserting the API key into the database.",
			fix: "Please try again later or contact support if the issue persists.",
		}),
	updateFailed: (apiKeyId: string) =>
		createError({
			status: 500,
			message: "Failed to update API key",
			why: `An unexpected error occurred while updating the API key "${apiKeyId}".`,
			fix: "Please try again later or contact support if the issue persists.",
		}),
	deleteFailed: (apiKeyId: string) =>
		createError({
			status: 500,
			message: "Failed to delete API key",
			why: `An unexpected error occurred while deleting the API key "${apiKeyId}".`,
			fix: "Please try again later or contact support if the issue persists.",
		}),
	rotateFailed: (apiKeyId: string) =>
		createError({
			status: 500,
			message: "Failed to rotate API key",
			why: `An unexpected error occurred while rotating the API key "${apiKeyId}".`,
			fix: "Please try again later or contact support if the issue persists.",
		}),
	enableFailed: (apiKeyId: string) =>
		createError({
			status: 500,
			message: "Failed to enable API key",
			why: `An unexpected error occurred while enabling the API key "${apiKeyId}".`,
			fix: "Please try again later or contact support if the issue persists.",
		}),
	disableFailed: (apiKeyId: string) =>
		createError({
			status: 500,
			message: "Failed to disable API key",
			why: `An unexpected error occurred while disabling the API key "${apiKeyId}".`,
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

export const apiKeyErrorResponse = (errorMessage: string) => {
	if (errorMessage.includes("API key not found")) {
		return status(404, {
			message: "API key not found",
			errorCode: errorCodes.API_KEY_NOT_FOUND,
		});
	}
	if (errorMessage.includes("API key already exists")) {
		return status(409, {
			message: "API key already exists",
			errorCode: errorCodes.API_KEY_ALREADY_EXISTS,
		});
	}
	if (errorMessage.includes("Invalid API key")) {
		return status(401, {
			message: "Invalid API key",
			errorCode: errorCodes.API_KEY_INVALID,
		});
	}
	if (errorMessage.includes("API key expired")) {
		return status(401, {
			message: "API key expired",
			errorCode: errorCodes.API_KEY_EXPIRED,
		});
	}
	if (errorMessage.includes("API key disabled")) {
		return status(403, {
			message: "API key disabled",
			errorCode: errorCodes.API_KEY_DISABLED,
		});
	}
	if (errorMessage.includes("Rate limit exceeded")) {
		return status(429, {
			message: "Rate limit exceeded",
			errorCode: errorCodes.API_KEY_RATE_LIMITED,
		});
	}
	return status(500, {
		message: "Internal server error",
		errorCode: errorCodes.INTERNAL_SERVER_ERROR,
	});
};
