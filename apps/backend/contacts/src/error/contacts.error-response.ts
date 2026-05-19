import { errorCodes } from "@be/contacts/error/contacts.error-code";
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

export const ContactErrors = {
	contactAlreadyExists: (email: string) =>
		createError({
			status: 409,
			message: "Contact already exists",
			why: `The contact with email ${email} is already registered in our system for your organization.`,
			fix: "Try updating the existing contact or use a different email address.",
		}),
	contactNotFound: (contactId: string) =>
		createError({
			status: 404,
			message: "Contact not found",
			why: `The contact with ID ${contactId} was not found or you don't have permission to access it.`,
			fix: "Verify the contact ID and ensure it belongs to your active organization.",
		}),
	invalidEmail: (email: string, reason?: string) =>
		createError({
			status: 400,
			message: "Invalid email",
			why: reason ?? `The email ${email} is invalid or cannot be processed.`,
			fix: "Ensure you are providing a valid email address.",
		}),
	databaseError: (message: string) =>
		createError({
			status: 500,
			message: "Database operation failed",
			why: message,
			fix: "Please try again later or contact support.",
		}),
};

export const contactsErrorResponse = (errorMessage: string) => {
	if (errorMessage.includes("Contact already exists")) {
		return status(409, {
			message: "Contact already exists",
			errorCode: errorCodes.CONTACT_ALREADY_EXISTS,
		});
	}
	if (errorMessage.includes("Contact not found")) {
		return status(404, {
			message: "Contact not found",
			errorCode: errorCodes.CONTACT_NOT_FOUND,
		});
	}
	if (errorMessage.includes("Invalid email")) {
		return status(400, {
			message: "Invalid email",
			errorCode: errorCodes.INVALID_EMAIL,
		});
	}
	if (errorMessage.includes("Group already exists")) {
		return status(409, {
			message: "Group already exists",
			errorCode: errorCodes.GROUP_ALREADY_EXISTS,
		});
	}
	if (errorMessage.includes("Group not found")) {
		return status(404, {
			message: "Group not found",
			errorCode: errorCodes.GROUP_NOT_FOUND,
		});
	}
	if (errorMessage.includes("Property already exists")) {
		return status(409, {
			message: "Property already exists",
			errorCode: errorCodes.PROPERTY_ALREADY_EXISTS,
		});
	}
	if (errorMessage.includes("Property not found")) {
		return status(404, {
			message: "Property not found",
			errorCode: errorCodes.PROPERTY_NOT_FOUND,
		});
	}
	if (errorMessage.includes("Channel already exists")) {
		return status(409, {
			message: "Channel already exists",
			errorCode: errorCodes.CHANNEL_ALREADY_EXISTS,
		});
	}
	if (errorMessage.includes("Channel not found")) {
		return status(404, {
			message: "Channel not found",
			errorCode: errorCodes.CHANNEL_NOT_FOUND,
		});
	}
	if (errorMessage.includes("Subscription already exists")) {
		return status(409, {
			message: "Subscription already exists",
			errorCode: errorCodes.SUBSCRIPTION_ALREADY_EXISTS,
		});
	}
	if (errorMessage.includes("Subscription not found")) {
		return status(404, {
			message: "Subscription not found",
			errorCode: errorCodes.SUBSCRIPTION_NOT_FOUND,
		});
	}
	if (errorMessage.includes("Preference already exists")) {
		return status(409, {
			message: "Preference already exists",
			errorCode: errorCodes.PREFERENCE_ALREADY_EXISTS,
		});
	}
	if (errorMessage.includes("Preference not found")) {
		return status(404, {
			message: "Preference not found",
			errorCode: errorCodes.PREFERENCE_NOT_FOUND,
		});
	}
	if (errorMessage.includes("Database operation failed")) {
		return status(500, {
			message: "Database operation failed",
			errorCode: errorCodes.DATABASE_ERROR,
		});
	}
	return status(500, {
		message: "Internal server error",
		errorCode: errorCodes.INTERNAL_SERVER_ERROR,
	});
};
