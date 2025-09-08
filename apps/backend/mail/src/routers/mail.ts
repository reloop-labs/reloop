import { Elysia, t } from "elysia";
import { MailService } from "../lib/mail-service";

export const mailRouter = new Elysia()
  .post(
    "/send",
    async ({ body }) => {
      try {
        const result = await MailService.sendMail(body);
        return {
          success: result.success,
          data: result,
          message: result.message,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error occurred",
        };
      }
    },
    {
      body: t.Object({
        from: t.String({ 
          format: "email", 
          description: "Sender email address (must be from a configured domain)" 
        }),
        to: t.Union([
          t.String({ format: "email" }),
          t.Array(t.String({ format: "email" }))
        ], { 
          description: "Recipient email address(es)" 
        }),
        subject: t.String({ 
          minLength: 1, 
          description: "Email subject" 
        }),
        text: t.Optional(t.String({ 
          description: "Plain text content" 
        })),
        html: t.Optional(t.String({ 
          description: "HTML content" 
        })),
        template: t.Optional(t.String({ 
          description: "Email template name (without .tsx extension)" 
        })),
        templateData: t.Optional(t.Record(t.String(), t.Any(), { 
          description: "Data for template rendering" 
        })),
        cc: t.Optional(t.Union([
          t.String({ format: "email" }),
          t.Array(t.String({ format: "email" }))
        ], { 
          description: "CC recipients" 
        })),
        bcc: t.Optional(t.Union([
          t.String({ format: "email" }),
          t.Array(t.String({ format: "email" }))
        ], { 
          description: "BCC recipients" 
        })),
        replyTo: t.Optional(t.String({ 
          format: "email", 
          description: "Reply-to address" 
        })),
        attachments: t.Optional(t.Array(t.Object({
          filename: t.String(),
          content: t.String(),
          contentType: t.Optional(t.String())
        }), { 
          description: "Email attachments" 
        })),
        password: t.Optional(t.String({ 
          description: "Sender password for authentication (optional)" 
        })),
      }),
      response: t.Object({
        success: t.Boolean(),
        data: t.Optional(t.Object({
          success: t.Boolean(),
          messageId: t.Optional(t.String()),
          message: t.String(),
          error: t.Optional(t.String()),
        })),
        error: t.Optional(t.String()),
        message: t.Optional(t.String()),
      }),
      detail: {
        summary: "Send an email",
        description: "Send an email through the mail server with built-in validation and authentication. Supports plain text, HTML, and template-based emails with DKIM signing.",
        tags: ["Mail Service"],
        examples: [
          {
            summary: "Send simple text email",
            value: {
              from: "admin@example.com",
              to: "user@example.com",
              subject: "Test Email",
              text: "This is a test email message."
            }
          },
          {
            summary: "Send HTML email with authentication",
            value: {
              from: "admin@example.com",
              to: "user@example.com",
              subject: "Welcome!",
              html: "<h1>Welcome!</h1><p>Thank you for joining us.</p>",
              password: "yourpassword"
            }
          },
          {
            summary: "Send template-based email",
            value: {
              from: "noreply@example.com",
              to: "user@example.com",
              subject: "Your OTP Code",
              template: "otp",
              templateData: { otp: 123456 }
            }
          },
          {
            summary: "Send email to multiple recipients",
            value: {
              from: "admin@example.com",
              to: ["user1@example.com", "user2@example.com"],
              cc: ["manager@example.com"],
              subject: "Team Update",
              text: "This is a team update message.",
              html: "<h2>Team Update</h2><p>This is a team update message.</p>"
            }
          }
        ]
      }
    }
  );
