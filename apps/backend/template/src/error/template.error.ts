import { createError } from "evlog";

export const AuthErrors = {
	unauthorized: (why?: string, fix?: string) =>
		createError({
			status: 401,
			message: "Unauthorized",
			why: why ?? "Authentication required",
			fix: fix ?? "Please provide valid credentials or log in.",
		}),
	forbidden: (why?: string, fix?: string) =>
		createError({
			status: 403,
			message: "Forbidden",
			why: why ?? "You do not have permission to perform this action",
			fix:
				fix ??
				"Verify that you are a member of the organization and have the required permissions.",
		}),
};

export const TemplateErrors = {
	notFound: (id: string) =>
		createError({
			status: 404,
			message: "Template not found",
			why: `Template with id "${id}" not found`,
			fix: "Verify the template ID and ensure it exists and has not been deleted.",
		}),
	nameRequired: () =>
		createError({
			status: 400,
			message: "Template name is required",
			why: "The request did not contain a valid template name.",
			fix: "Provide a non-empty name string in the request body.",
		}),
	invalidContent: (reason: string) =>
		createError({
			status: 400,
			message: "Invalid template content",
			why: `Invalid template content: ${reason}`,
			fix: "Ensure the template content matches the required schema and contains valid blocks.",
		}),
	renderFailed: (reason: string) =>
		createError({
			status: 500,
			message: "Failed to render template",
			why: `Failed to render template: ${reason}`,
			fix: "Check the template variables and components for syntax or rendering errors.",
		}),
	versionNotFound: (templateId: string, version: number) =>
		createError({
			status: 404,
			message: "Version not found",
			why: `Version ${version} not found for template "${templateId}"`,
			fix: "Verify the version number and template ID.",
		}),
	versionNotFoundById: (versionId: string) =>
		createError({
			status: 404,
			message: "Version not found",
			why: `Version with ID "${versionId}" was not found or doesn't belong to this template.`,
			fix: "Verify the version ID.",
		}),
	deleteFailed: (reason: string) =>
		createError({
			status: 400,
			message: "Cannot delete template version",
			why: reason,
			fix: "Ensure the version is not the active version of the template.",
		}),
};
