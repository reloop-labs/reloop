import { db } from "../db";
import { mailbox, domain } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { createHash } from "crypto";
import { render } from "@react-email/render";
import { createTransport, type Transporter } from "nodemailer";

export interface SendMailRequest {
  from: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  template?: string;
  templateData?: Record<string, any>;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  // Authentication fields
  password?: string;
}

export interface SendMailResponse {
  success: boolean;
  messageId?: string;
  message: string;
  error?: string;
}

export class MailService {
  private static transporter: Transporter | null = null;

  private static getTransporter(): Transporter {
    if (!this.transporter) {
      this.transporter = createTransport({
        host: process.env.SMTP_HOST || "localhost",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER || "",
          pass: process.env.SMTP_PASS || "",
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    }
    return this.transporter;
  }

  private static verifyPassword(password: string, hashedPassword: string): boolean {
    try {
      if (hashedPassword.startsWith("$1$")) {
        const [, salt, hash] = hashedPassword.split("$");
        const testHash = createHash("md5").update(password + salt).digest("base64").replace(/[^a-zA-Z0-9]/g, '').substring(0, 22);
        return testHash === hash;
      }
      return false;
    } catch (error) {
      console.error("Error verifying password:", error);
      return false;
    }
  }

  static async sendMail(request: SendMailRequest): Promise<SendMailResponse> {
    try {
      const { from, to, subject, text, html, template, templateData, cc, bcc, replyTo, attachments, password } = request;

      // Validate required fields
      if (!from || !to || !subject) {
        return {
          success: false,
          message: "Missing required fields: from, to, subject",
        };
      }

      // Validate email format
      const fromDomain = from.split("@")[1];
      if (!fromDomain) {
        return {
          success: false,
          message: "Invalid sender email format",
        };
      }

      // Validate domain exists and is active
      const domainRecord = await db
        .select()
        .from(domain)
        .where(
          and(eq(domain.domain, fromDomain), eq(domain.active, true))
        )
        .limit(1);

      if (domainRecord.length === 0) {
        return {
          success: false,
          message: `Domain ${fromDomain} is not configured or inactive`,
        };
      }

      // Authenticate sender if password provided
      if (password) {
        const [localPart] = from.split("@");
        const mailboxRecord = await db
          .select()
          .from(mailbox)
          .where(
            and(eq(mailbox.localPart, localPart), eq(mailbox.domain, fromDomain), eq(mailbox.active, true))
          )
          .limit(1);

        if (mailboxRecord.length === 0) {
          return {
            success: false,
            message: "Sender email not found in database",
          };
        }

        const isValidPassword = this.verifyPassword(password, mailboxRecord[0].password);
        if (!isValidPassword) {
          return {
            success: false,
            message: "Invalid sender password",
          };
        }
      }

      // Render template if provided
      let finalHtml = html;
      if (template && templateData) {
        try {
          const templateModule = await import(`../emails/${template}`);
          const TemplateComponent = templateModule.default;
          finalHtml = await render(TemplateComponent(templateData));
        } catch (error) {
          console.error("Error rendering template:", error);
          return {
            success: false,
            message: "Error rendering email template",
          };
        }
      }

      // Validate content
      if (!text && !finalHtml) {
        return {
          success: false,
          message: "Either text content or HTML content is required",
        };
      }

      // // Get DKIM configuration
      // const dkimRecord = await db
      //   .select()
      //   .from(dkimKeys)
      //   .where(eq(dkimKeys.domain, fromDomain))
      //   .limit(1);

      const transporter = this.getTransporter();

      const mailOptions = {
        from,
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        text,
        html: finalHtml,
        cc: cc ? (Array.isArray(cc) ? cc.join(", ") : cc) : undefined,
        bcc: bcc ? (Array.isArray(bcc) ? bcc.join(", ") : bcc) : undefined,
        replyTo,
        attachments,
        // dkim: dkimRecord.length > 0 ? {
        //   domainName: fromDomain,
        //   keySelector: dkimRecord[0].selector,
        //   privateKey: dkimRecord[0].privateKey,
        // } : undefined,
      };

      const result = await transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: result.messageId,
        message: "Email sent successfully",
      };
    } catch (error) {
      console.error("Error sending mail:", error);
      return {
        success: false,
        message: "Failed to send email",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
