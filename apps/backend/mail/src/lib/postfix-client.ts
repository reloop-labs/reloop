import { logger } from "@reloop/logger";
import nodemailer from "nodemailer";

export interface SMTPConfig {
    host: string;
    port: number;
    secure?: boolean;
    auth?: {
        user: string;
        pass: string;
    };
}

export class PostfixClient {
    private transporter: nodemailer.Transporter;
    private config: SMTPConfig;

    constructor(config: SMTPConfig) {
        this.config = config;
        this.transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure || false,
            auth: config.auth,
            tls: {
                rejectUnauthorized: process.env.NODE_ENV !== "production",
            },
        });
    }

    async testConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            logger.info("SMTP connection verified successfully");
            return true;
        } catch (error) {
            logger.error(
                {
                    error: error instanceof Error ? error.message : String(error),
                    host: this.config.host,
                    port: this.config.port
                },
                "SMTP connection failed"
            );
            return false;
        }
    }

    async sendEmail(options: {
        from: string;
        to: string | string[];
        subject: string;
        text?: string;
        html?: string;
        replyTo?: string;
        cc?: string | string[];
        bcc?: string | string[];
    }): Promise<{ messageId: string; response: string }> {
        try {
            const info = await this.transporter.sendMail({
                from: options.from,
                to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
                replyTo: options.replyTo,
                cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(", ") : options.cc) : undefined,
                bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(", ") : options.bcc) : undefined,
            });

            logger.info(
                {
                    messageId: info.messageId,
                    from: options.from,
                    to: options.to,
                    subject: options.subject
                },
                "Email sent successfully"
            );

            return {
                messageId: info.messageId,
                response: info.response || "Email sent successfully",
            };
        } catch (error) {
            logger.error(
                {
                    error: error instanceof Error ? error.message : String(error),
                    from: options.from,
                    to: options.to,
                    subject: options.subject
                },
                "Failed to send email"
            );
            throw error;
        }
    }

    getConfig(): SMTPConfig {
        return { ...this.config };
    }
}

// Create singleton instance
const smtpHost = process.env.SMTP_HOST || "localhost";
const smtpPort = Number.parseInt(process.env.SMTP_PORT || "25");
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

export const postfixClient = new PostfixClient({
    host: smtpHost,
    port: smtpPort,
    secure: false,
    auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
});
