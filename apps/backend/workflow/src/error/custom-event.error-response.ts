import { createError } from "evlog";

export const CustomEventErrors = {
	notFound: (idOrKey: string) =>
		createError({
			status: 404,
			message: "Event not found",
			why: `No custom event "${idOrKey}" exists for your organization.`,
			fix: "Create the event first, or verify the key / ID.",
		}),
	keyExists: (key: string) =>
		createError({
			status: 409,
			message: "Event key already exists",
			why: `An event with key "${key}" already exists in this organization.`,
			fix: "Use a different key or update the existing event.",
		}),
	invalidKey: (key: string) =>
		createError({
			status: 400,
			message: "Invalid event key",
			why: `The key "${key}" is not valid.`,
			fix: "Use lowercase letters, numbers, dots, underscores, or hyphens (e.g. user.signed_up).",
		}),
	invalidProperties: (why: string) =>
		createError({
			status: 400,
			message: "Invalid event properties",
			why,
			fix: "Fix property names/types and try again.",
		}),
	createFailed: () =>
		createError({
			status: 500,
			message: "Failed to create event",
			why: "An unexpected error occurred while creating the event.",
			fix: "Please try again later.",
		}),
	updateFailed: () =>
		createError({
			status: 500,
			message: "Failed to update event",
			why: "An unexpected error occurred while updating the event.",
			fix: "Please try again later.",
		}),
	trackFailed: (why: string) =>
		createError({
			status: 400,
			message: "Failed to track event",
			why,
			fix: "Check the event key, contact, and property payload.",
		}),
	contactRequired: () =>
		createError({
			status: 400,
			message: "Contact required",
			why: "Provide contactId or email so the automation can enroll a contact.",
			fix: "Pass contactId or email in the track body.",
		}),
	contactNotFound: () =>
		createError({
			status: 404,
			message: "Contact not found",
			why: "No matching contact was found for this organization.",
			fix: "Create the contact first or pass a valid contactId/email.",
		}),
};
