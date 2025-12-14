import { errorCodes } from "@reloop/api-key/api-key.error-code";
import { status } from "elysia";

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
