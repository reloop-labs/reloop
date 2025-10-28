import { t } from "elysia";

export const sendEmailBodySchema = t.Object({
    from: t.String({
        description: "Sender email address",
        examples: ["user@example.com"]
    }),
    to: t.Union([t.String(), t.Array(t.String())], {
        description: "Recipient email address(es)",
        examples: ["recipient@example.com", ["user1@example.com", "user2@example.com"]]
    }),
    subject: t.String({
        description: "Email subject",
        examples: ["Test Email"]
    }),
    text: t.Optional(t.String({
        description: "Plain text content",
        examples: ["This is a test email"]
    })),
    html: t.Optional(t.String({
        description: "HTML content",
        examples: ["<h1>Test Email</h1><p>This is a test email</p>"]
    })),
    replyTo: t.Optional(t.String({
        description: "Reply-to email address",
        examples: ["noreply@example.com"]
    })),
    cc: t.Optional(t.Union([t.String(), t.Array(t.String())], {
        description: "CC email address(es)",
        examples: ["cc@example.com"]
    })),
    bcc: t.Optional(t.Union([t.String(), t.Array(t.String())], {
        description: "BCC email address(es)",
        examples: ["bcc@example.com"]
    })),
});

export const sendEmailResponseSchema = t.Object({
    success: t.Boolean({ description: "Whether the email was sent successfully" }),
    messageId: t.String({ description: "Unique message ID" }),
    status: t.String({ description: "Email status" }),
    timestamp: t.String({ description: "Timestamp when email was sent" }),
});

export const healthResponseSchema = t.Object({
    status: t.String({ description: "Service status" }),
    smtp: t.Object({
        connected: t.Boolean({ description: "SMTP connection status" }),
        host: t.String({ description: "SMTP host" }),
        port: t.Number({ description: "SMTP port" }),
    }),
    timestamp: t.String({ description: "Health check timestamp" }),
});

export type SendEmailBody = typeof sendEmailBodySchema.static;
export type SendEmailResponse = typeof sendEmailResponseSchema.static;
export type HealthResponse = typeof healthResponseSchema.static;
