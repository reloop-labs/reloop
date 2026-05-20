import { errorCodes } from "@reloop/logs/error/logs.error-code";
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

export const LogsErrors = {
	notFound: (logId: string) =>
		createError({
			status: 404,
			message: "Log not found",
			why: `No log entry with ID "${logId}" was found.`,
			fix: "Verify the log ID and ensure you have permission to access it.",
		}),
	emailLogNotFound: (emailLogId: string) =>
		createError({
			status: 404,
			message: "Email log not found",
			why: `No email log with ID "${emailLogId}" exists for your organization.`,
			fix: "Verify the email log ID and ensure it belongs to your active organization.",
		}),
	badRequest: (why: string, fix?: string) =>
		createError({
			status: 400,
			message: "Bad request",
			why,
			fix: fix ?? "Modify your request parameters and try again.",
		}),
	databaseError: (message: string) =>
		createError({
			status: 500,
			message: "Database operation failed",
			why: message,
			fix: "Please try again later or contact support.",
		}),
};

export const logsErrorResponse = (errorMessage: string) => {
	if (errorMessage.includes("Log not found")) {
		return status(404, {
			message: "Log not found",
			errorCode: errorCodes.LOG_NOT_FOUND,
		});
	}
	if (errorMessage.includes("Email log not found")) {
		return status(404, {
			message: "Email log not found",
			errorCode: errorCodes.EMAIL_LOG_NOT_FOUND,
		});
	}
	if (errorMessage.includes("Bad request")) {
		return status(400, {
			message: "Bad request",
			errorCode: errorCodes.BAD_REQUEST,
		});
	}
	if (errorMessage.includes("Database operation failed")) {
		return status(500, {
			message: "Database operation failed",
			errorCode: errorCodes.INTERNAL_SERVER_ERROR,
		});
	}
	return status(500, {
		message: "Internal server error",
		errorCode: errorCodes.INTERNAL_SERVER_ERROR,
	});
};
