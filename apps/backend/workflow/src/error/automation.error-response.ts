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
	databaseError: (message: string) =>
		createError({
			status: 500,
			message: "Database operation failed",
			why: message,
			fix: "Please try again later or contact support.",
		}),
};
