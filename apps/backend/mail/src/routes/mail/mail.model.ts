import { t } from "elysia";

export namespace MailModel {
	// Email validation pattern
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	export const sendEmailBody = t.Object({
		from: t.String({
			pattern: emailPattern.source,
			description: "Sender email address",
			examples: ["user@example.com"],
		}),
		to: t.Union([t.String(), t.Array(t.String())], {
			description: "Recipient email address(es)",
			examples: [
				"recipient@example.com",
				["user1@example.com", "user2@example.com"],
			],
		}),
		subject: t.String({
			minLength: 1,
			maxLength: 255,
			description: "Email subject",
			examples: ["Test Email"],
		}),
		text: t.Optional(
			t.String({
				description: "Plain text content",
				examples: ["This is a test email"],
			}),
		),
		html: t.Optional(
			t.String({
				description: "HTML content",
				examples: ["<h1>Test Email</h1><p>This is a test email</p>"],
			}),
		),
		replyTo: t.Optional(
			t.String({
				pattern: emailPattern.source,
				description: "Reply-to email address",
				examples: ["noreply@example.com"],
			}),
		),
		cc: t.Optional(
			t.Union([t.String(), t.Array(t.String())], {
				description: "CC email address(es)",
				examples: ["cc@example.com"],
			}),
		),
		bcc: t.Optional(
			t.Union([t.String(), t.Array(t.String())], {
				description: "BCC email address(es)",
				examples: ["bcc@example.com"],
			}),
		),
	});

	export type SendEmailBody = typeof sendEmailBody.static;

	export const sendEmailResponse = t.Object({
		success: t.Boolean({
			description: "Whether the email was sent successfully",
		}),
		messageId: t.String({
			description: "Unique message ID",
		}),
		status: t.String({
			description: "Email status",
		}),
		timestamp: t.String({
			description: "Timestamp when email was sent",
		}),
	});

	export type SendEmailResponse = typeof sendEmailResponse.static;

	export const unauthorized = t.Object({
		message: t.Literal("Authentication required"),
	});
	export type Unauthorized = typeof unauthorized.static;

	export const forbidden = t.Object({
		message: t.Literal("User is not a member of an organization"),
	});
	export type Forbidden = typeof forbidden.static;

	export const badRequest = t.Object({
		message: t.String({
			description: "Error message",
		}),
	});
	export type BadRequest = typeof badRequest.static;

	export const internalServerError = t.Object({
		message: t.String({
			description: "Error message",
		}),
	});
	export type InternalServerError = typeof internalServerError.static;

	export const domainNotFound = t.Object({
		message: t.String({
			description: "Domain not found or not authorized",
		}),
	});
	export type DomainNotFound = typeof domainNotFound.static;

	export const mailboxNotFound = t.Object({
		message: t.String({
			description: "Mailbox not found or not authorized",
		}),
	});
	export type MailboxNotFound = typeof mailboxNotFound.static;
}
