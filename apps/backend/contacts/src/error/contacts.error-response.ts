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
	createFailed: (message?: string) =>
		createError({
			status: 500,
			message: message || "Failed to create contact",
			why: "An unexpected error occurred while inserting the contact into the database.",
			fix: "Please try again later or contact support if the issue persists.",
		}),
};

export const GroupErrors = {
	notFound: (groupId: string) =>
		createError({
			status: 404,
			message: "Group not found",
			why: `The group with ID "${groupId}" was not found or you don't have permission to access it.`,
			fix: "Verify the group ID and ensure it belongs to your organization.",
		}),
	alreadyExists: (name: string) =>
		createError({
			status: 409,
			message: "Group already exists",
			why: `A group with the name "${name}" is already registered in your organization.`,
			fix: "Choose a different name or edit the existing group.",
		}),
};

export const PropertyErrors = {
	notFound: (propertyId: string) =>
		createError({
			status: 404,
			message: "Property not found",
			why: `The property with ID "${propertyId}" was not found or you don't have permission to access it.`,
			fix: "Verify the property ID and ensure it exists in your active organization.",
		}),
	alreadyExists: (name: string) =>
		createError({
			status: 409,
			message: "Property already exists",
			why: `A property with the name "${name}" already exists in your organization.`,
			fix: "Use a different name or update the existing property.",
		}),
	invalidName: (name: string, reason: string) =>
		createError({
			status: 400,
			message: "Invalid property name",
			why: reason,
			fix: "Ensure the property name is lowercase and contains only alphanumeric characters and underscores.",
		}),
	typeMismatch: (name: string, expected: string, received: string) =>
		createError({
			status: 400,
			message: "Property type mismatch",
			why: `Property '${name}' expected type '${expected}' but received '${received}'.`,
			fix: "Provide a value matching the property's defined type.",
		}),
};

export const ChannelErrors = {
	notFound: (channelId: string) =>
		createError({
			status: 404,
			message: "Channel not found",
			why: `The channel with ID "${channelId}" was not found or you don't have permission to access it.`,
			fix: "Verify the channel ID and ensure it exists in your organization.",
		}),
	alreadyExists: (name: string) =>
		createError({
			status: 409,
			message: "Channel already exists",
			why: `A channel with the name "${name}" is already registered in your organization.`,
			fix: "Choose a different name or edit the existing channel.",
		}),
};

export const SubscriptionErrors = {
	notFound: (subscriptionId: string) =>
		createError({
			status: 404,
			message: "Subscription not found",
			why: `The subscription with ID "${subscriptionId}" was not found.`,
			fix: "Verify the subscription ID and try again.",
		}),
	alreadyExists: () =>
		createError({
			status: 409,
			message: "Subscription already exists",
			why: "The contact is already subscribed to this channel.",
			fix: "Check the subscription status and try again.",
		}),
};

export const PreferenceErrors = {
	notFound: (preferenceId: string) =>
		createError({
			status: 404,
			message: "Preference not found",
			why: `The preference with ID "${preferenceId}" was not found.`,
			fix: "Verify the preference ID and try again.",
		}),
	alreadyExists: () =>
		createError({
			status: 409,
			message: "Preference already exists",
			why: "A preference with this configuration already exists.",
			fix: "Modify the existing preference configuration.",
		}),
};
