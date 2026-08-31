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

export const CampaignErrors = {
	notFound: (id: string) =>
		createError({
			status: 404,
			message: "Campaign not found",
			why: `Campaign with id "${id}" was not found`,
			fix: "Verify the campaign ID and that it belongs to this organization.",
		}),
	nameRequired: () =>
		createError({
			status: 400,
			message: "Campaign name is required",
			why: "The request did not contain a valid campaign name.",
			fix: "Provide a non-empty name string in the request body.",
		}),
	subjectRequired: () =>
		createError({
			status: 400,
			message: "Subject is required",
			why: "Campaigns need a subject line before they can be saved.",
			fix: "Provide a non-empty subject string.",
		}),
	fromRequired: () =>
		createError({
			status: 400,
			message: "Sender address is required",
			why: "fromName and fromEmail are required.",
			fix: "Set a display name and a from address on a verified domain.",
		}),
	invalidAudience: (why: string) =>
		createError({
			status: 400,
			message: "Invalid audience",
			why,
			fix: "Choose all contacts, a group, a channel, or a CSV list with at least one email.",
		}),
	emptyAudience: () =>
		createError({
			status: 400,
			message: "No sendable recipients",
			why: "After suppression and unsubscribe filters, this audience has no recipients.",
			fix: "Add subscribed contacts, pick a different group or channel, or fix the CSV list.",
		}),
	notDraft: (id: string) =>
		createError({
			status: 409,
			message: "Campaign cannot be edited",
			why: `Campaign "${id}" is not a draft.`,
			fix: "Duplicate the campaign to make a new draft, or cancel it first if it is scheduled.",
		}),
	cannotSend: (id: string, status: string) =>
		createError({
			status: 409,
			message: "Campaign cannot be sent",
			why: `Campaign "${id}" is ${status}.`,
			fix: "Only draft or scheduled campaigns can be sent.",
		}),
	cannotSchedule: (id: string, status: string) =>
		createError({
			status: 409,
			message: "Campaign cannot be scheduled",
			why: `Campaign "${id}" is ${status}.`,
			fix: "Only draft or scheduled campaigns can be scheduled.",
		}),
	cannotCancel: (id: string, status: string) =>
		createError({
			status: 409,
			message: "Campaign cannot be cancelled",
			why: `Campaign "${id}" is ${status}.`,
			fix: "Only scheduled or sending campaigns can be cancelled.",
		}),
	cannotDelete: (id: string, status: string) =>
		createError({
			status: 409,
			message: "Campaign cannot be deleted",
			why: `Campaign "${id}" is ${status}.`,
			fix: "Only draft or cancelled campaigns can be deleted.",
		}),
	invalidSchedule: () =>
		createError({
			status: 400,
			message: "Invalid schedule time",
			why: "scheduledAt must be a future ISO 8601 timestamp.",
			fix: "Pick a time in the future.",
		}),
	unverifiedDomain: (domain: string) =>
		createError({
			status: 400,
			message: "Sender domain is not verified",
			why: `No verified sending domain matched "${domain}".`,
			fix: "Verify the domain in Reloop before sending from it.",
		}),
	testFailed: (why: string) =>
		createError({
			status: 400,
			message: "Failed to send test email",
			why,
			fix: "Check the from address, recipient, and that the mail service is running.",
		}),
};
