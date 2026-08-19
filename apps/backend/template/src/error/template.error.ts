import { t } from "elysia";
import { createError } from "evlog";

export const ErrorResponseSchema = t.Object(
	{
		message: t.String(),
		why: t.Optional(t.String()),
		fix: t.Optional(t.String()),
		link: t.Optional(t.String()),
	},
	{
		description: "Standard error response format",
	},
);

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
	createFailed: (message?: string) =>
		createError({
			status: 500,
			message: message || "Failed to create template",
			why: "An unexpected error occurred while inserting the template into the database.",
			fix: "Please try again later or contact support if the issue persists.",
		}),
	testFailed: (why: string, fix?: string) =>
		createError({
			status: 400,
			message: "Failed to send test email",
			why,
			fix:
				fix ??
				"Check your SMTP configuration, sender address, and recipient address.",
		}),
	updateFailed: (id: string) =>
		createError({
			status: 500,
			message: "Failed to update template",
			why: `An unexpected error occurred while updating the template "${id}".`,
			fix: "Please try again later or contact support if the issue persists.",
		}),
	duplicateFailed: (id: string) =>
		createError({
			status: 500,
			message: "Failed to duplicate template",
			why: `An unexpected error occurred while duplicating the template "${id}".`,
			fix: "Please try again later or contact support if the issue persists.",
		}),
	restoreFailed: (id: string, versionId: string) =>
		createError({
			status: 500,
			message: "Failed to restore template version",
			why: `An unexpected error occurred while restoring template "${id}" to version "${versionId}".`,
			fix: "Please try again later or contact support if the issue persists.",
		}),
	htmlRequired: () =>
		createError({
			status: 400,
			message: "HTML is required",
			why: "The request body did not include an html string to render.",
			fix: "Send a JSON body with a non-empty `html` field.",
		}),
	htmlTooLarge: (size: number, max: number) =>
		createError({
			status: 400,
			message: "HTML is too large",
			why: `The HTML payload is ${size} bytes, which exceeds the ${max} byte limit.`,
			fix: "Reduce the HTML size or split the document before converting.",
		}),
	invalidImageFormat: (format: string) =>
		createError({
			status: 400,
			message: "Invalid image format",
			why: `Format "${format}" is not supported.`,
			fix: "Use png, jpeg, or webp.",
		}),
	invalidImageWidth: (width: number, min: number, max: number) =>
		createError({
			status: 400,
			message: "Invalid image width",
			why: `Width ${width} is outside the allowed range ${min}–${max}.`,
			fix: `Pass a width between ${min} and ${max}.`,
		}),
	htmlToImageFailed: (reason: string) =>
		createError({
			status: 500,
			message: "Failed to convert HTML to an image",
			why: reason,
			fix: "Verify the HTML is valid and that Chromium is available to the template service.",
		}),
	thumbnailNotFound: (id: string) =>
		createError({
			status: 404,
			message: "Template thumbnail not found",
			why: `Template "${id}" has no saved HTML to preview.`,
			fix: "Save a draft of the template so a thumbnail can be generated.",
		}),
};
