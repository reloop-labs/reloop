import { errorCodes } from "@be/upload/upload.error-code";
import { status } from "elysia";

export const uploadErrorResponse = (errorMessage: string): never => {
    if (errorMessage.includes("File not found")) {
        throw status(404, {
            message: "File not found",
            errorCode: errorCodes.FILE_NOT_FOUND,
        });
    }
    if (errorMessage.includes("File size exceeds")) {
        throw status(400, {
            message: "File size exceeds maximum allowed size",
            errorCode: errorCodes.FILE_TOO_LARGE,
        });
    }
    if (errorMessage.includes("Invalid file type")) {
        throw status(400, {
            message: "Invalid file type. Only images are allowed",
            errorCode: errorCodes.INVALID_FILE_TYPE,
        });
    }
    if (errorMessage.includes("No file provided")) {
        throw status(400, {
            message: "No file provided",
            errorCode: errorCodes.UPLOAD_FAILED,
        });
    }
    throw status(500, {
        message: "Internal server error",
        errorCode: errorCodes.INTERNAL_SERVER_ERROR,
    });
};

