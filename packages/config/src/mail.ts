// Mail configuration
export const mailConfig = {
	smtp: {
		host: process.env.SMTP_HOST || "localhost",
		port: Number.parseInt(process.env.SMTP_PORT || "587", 10),
		secure: process.env.SMTP_SECURE === "true",
		auth: {
			user: process.env.SMTP_USER || "",
			pass: process.env.SMTP_PASS || "",
		},
	},
	postfix: {
		host: process.env.POSTFIX_HOST || "localhost",
		port: Number.parseInt(process.env.POSTFIX_PORT || "25", 10),
	},
	dovecot: {
		host: process.env.DOVECOT_HOST || "localhost",
		port: Number.parseInt(process.env.DOVECOT_PORT || "993", 10),
		secure: process.env.DOVECOT_SECURE === "true",
	},
	rspamd: {
		host: process.env.RSPAMD_HOST || "localhost",
		port: Number.parseInt(process.env.RSPAMD_PORT || "11333", 10),
		password: process.env.RSPAMD_PASSWORD || "",
	},
	defaults: {
		from: process.env.MAIL_FROM || "noreply@reloop.com",
		replyTo: process.env.MAIL_REPLY_TO || "support@reloop.com",
		subject: process.env.MAIL_SUBJECT || "Reloop Notification",
	},
	templates: {
		directory: process.env.MAIL_TEMPLATES_DIR || "./templates",
		engine: process.env.MAIL_TEMPLATE_ENGINE || "handlebars",
	},
} as const;

export type MailConfig = typeof mailConfig;
