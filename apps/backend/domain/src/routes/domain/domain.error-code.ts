import { errorCodes } from "@be/domain/domain.error-code";
import { status } from "elysia";

export const domainErrorResponse = (errorMessage: string) => {
	if (errorMessage.includes("Domain already exists")) {
		return status(409, {
			message: "Domain already exists",
			errorCode: errorCodes.DOMAIN_ALREADY_EXISTS,
		});
	}
	return status(500, {
		message: "Internal server error",
		errorCode: errorCodes.INTERNAL_SERVER_ERROR,
	});
};
