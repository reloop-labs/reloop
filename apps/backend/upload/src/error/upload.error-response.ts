import { errorCodes } from "@be/upload/error/upload.error-code";
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
	forbidden: (why: string, fix?: string) =>
		createError({
			status: 403,
			message: "Unauthorized access",
			why,
			fix:
				fix ??
				"Ensure you have the required permissions to perform this action",
		}),
};

export const UploadErrors = {
	fileNotFound: (fileId: string) =>
		createError({
			status: 404,
			message: "File not found",
			why: `The file with ID "${fileId}" was not found or you don't have permission to access it.`,
			fix: "Verify the file ID and ensure it exists and has not been deleted.",
		}),
	fileTooLarge: (size: number, maxSize: number) =>
		createError({
			status: 400,
			message: "File size exceeds maximum allowed size",
			why: `The uploaded file size (${(size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum allowed limit of ${(maxSize / 1024 / 1024).toFixed(0)}MB.`,
			fix: "Please compress or resize the file to be under the limit before uploading.",
		}),
	invalidFileType: (mimeType: string, allowedTypes: string[]) =>
		createError({
			status: 400,
			message: "Invalid file type. Only images are allowed",
			why: `The file type "${mimeType}" is not supported.`,
			fix: `Allowed mime types are: ${allowedTypes.join(", ")}.`,
		}),
	noFileProvided: () =>
		createError({
			status: 400,
			message: "No file provided",
			why: "The request did not contain any file in the 'file' field of the multipart form data.",
			fix: "Ensure you are sending a multipart form-data request containing a 'file' parameter with the file data.",
		}),
	uploadFailed: (why: string) =>
		createError({
			status: 500,
			message: "Failed to upload file",
			why,
			fix: "Please try again later or contact support if the issue persists.",
		}),
	deleteFailed: (fileId: string, why: string) =>
		createError({
			status: 500,
			message: "Failed to delete file",
			why: `Could not delete file "${fileId}": ${why}`,
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

export const uploadErrorResponse = (errorMessage: string) => {
	if (errorMessage.includes("File not found")) {
		return status(404, {
			message: "File not found",
			errorCode: errorCodes.FILE_NOT_FOUND,
		});
	}
	if (errorMessage.includes("File size exceeds")) {
		return status(400, {
			message: "File size exceeds maximum allowed size",
			errorCode: errorCodes.FILE_TOO_LARGE,
		});
	}
	if (errorMessage.includes("Invalid file type")) {
		return status(400, {
			message: "Invalid file type. Only images are allowed",
			errorCode: errorCodes.INVALID_FILE_TYPE,
		});
	}
	if (errorMessage.includes("No file provided")) {
		return status(400, {
			message: "No file provided",
			errorCode: errorCodes.UPLOAD_FAILED,
		});
	}
	return status(500, {
		message: "Internal server error",
		errorCode: errorCodes.INTERNAL_SERVER_ERROR,
	});
};
