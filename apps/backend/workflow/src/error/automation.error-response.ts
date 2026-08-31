import { createError } from "evlog";

export const AutomationErrors = {
	notFound: (id: string) =>
		createError({
			status: 404,
			message: "Automation not found",
			why: `No automation with ID "${id}" exists for your organization.`,
			fix: "Verify the ID and ensure it belongs to your active organization.",
		}),
	createFailed: () =>
		createError({
			status: 500,
			message: "Failed to create automation",
			why: "An unexpected error occurred while creating the automation.",
			fix: "Please try again later or contact support.",
		}),
	updateFailed: (id: string) =>
		createError({
			status: 500,
			message: "Failed to update automation",
			why: `An unexpected error occurred while updating automation "${id}".`,
			fix: "Please try again later or contact support.",
		}),
	deleteFailed: (id: string) =>
		createError({
			status: 500,
			message: "Failed to delete automation",
			why: `An unexpected error occurred while deleting automation "${id}".`,
			fix: "Please try again later or contact support.",
		}),
	invalidGraph: (errors: string[]) =>
		createError({
			status: 400,
			message: "Invalid workflow graph",
			why: errors.join(" "),
			fix: "Fix the validation issues and try again.",
		}),
	cannotActivate: (why: string) =>
		createError({
			status: 400,
			message: "Cannot activate automation",
			why,
			fix: "Complete the workflow configuration before activating.",
		}),
	notActive: () =>
		createError({
			status: 400,
			message: "Automation is not active",
			why: "Only an active automation can enroll contacts.",
			fix: "Activate the workflow, then enroll the contact.",
		}),
	contactRequired: () =>
		createError({
			status: 400,
			message: "Contact required",
			why: "Provide contactId or email so the automation can enroll a contact.",
			fix: "Pass contactId or email in the request body.",
		}),
	contactNotFound: () =>
		createError({
			status: 404,
			message: "Contact not found",
			why: "No matching contact was found for this organization.",
			fix: "Create the contact first or pass a valid contactId/email.",
		}),
	contactNotSendable: (status: string) =>
		createError({
			status: 400,
			message: "Contact cannot receive email",
			why: `This contact is ${status} and cannot be enrolled.`,
			fix: "Use a subscribed contact.",
		}),
	alreadyEnrolled: (enrollmentId: string) =>
		createError({
			status: 409,
			message: "Contact already enrolled",
			why: `This contact is already enrolled (${enrollmentId}). Automations enroll a contact once.`,
			fix: "Pick a different contact, or inspect the existing enrollment.",
		}),
	cannotEnroll: (why: string) =>
		createError({
			status: 400,
			message: "Cannot enroll contact",
			why,
			fix: "Fix the workflow (trigger connected to at least one step) and try again.",
		}),
	enrollmentNotFound: (id: string) =>
		createError({
			status: 404,
			message: "Enrollment not found",
			why: `No enrollment with ID "${id}" exists for this automation.`,
			fix: "Verify the enrollment ID.",
		}),
	databaseError: (message: string) =>
		createError({
			status: 500,
			message: "Database operation failed",
			why: message,
			fix: "Please try again later or contact support.",
		}),
};
