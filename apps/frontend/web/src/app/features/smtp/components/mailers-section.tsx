"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { motion } from "framer-motion";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import type { SimpleIcon } from "simple-icons";
import {
	siDjango,
	siGo,
	siLaravel,
	siNodedotjs,
	siPhp,
	siPython,
	siRubyonrails,
	siRust,
} from "simple-icons";
import { isDarkBrandColor } from "../../../sdk/components/language-icon";
import { SdkCodeBlock } from "../../../sdk/components/sdk-code-block";
import { SectionHeader } from "./section-header";
import { SMTP_HOST, SMTP_PORT, SMTP_USER } from "./smtp-data";

type Mailer = {
	id: string;
	name: string;
	icon: SimpleIcon;
	lang: string;
	path: string;
	href: string;
	code: string;
};

const SMTP_INTRO = "/docs/examples/smtp/introduction";

const MAILERS: Mailer[] = [
	{
		id: "nodemailer",
		name: "Nodemailer",
		icon: siNodedotjs,
		lang: "typescript",
		path: "mailer.ts",
		href: "/docs/examples/smtp/nodemailer",
		code: `import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: '${SMTP_HOST}',
  port: ${SMTP_PORT},
  auth: {
    user: '${SMTP_USER}',
    pass: process.env.RELOOP_API_KEY,
  },
});

await transporter.sendMail({
  from: 'Acme <receipts@acme.com>',
  to: 'jane@example.com',
  subject: 'Your receipt from Acme',
  html: '<p>Thanks for your order!</p>',
});`,
	},
	{
		id: "laravel",
		name: "Laravel",
		icon: siLaravel,
		lang: "bash",
		path: ".env",
		href: "/docs/examples/php/laravel",
		code: `MAIL_MAILER=smtp
MAIL_HOST=${SMTP_HOST}
MAIL_PORT=${SMTP_PORT}
MAIL_USERNAME=${SMTP_USER}
MAIL_PASSWORD=rl_your_api_key
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=receipts@acme.com`,
	},
	{
		id: "django",
		name: "Django",
		icon: siDjango,
		lang: "python",
		path: "settings.py",
		href: SMTP_INTRO,
		code: `import os

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "${SMTP_HOST}"
EMAIL_PORT = ${SMTP_PORT}
EMAIL_USE_TLS = True
EMAIL_HOST_USER = "${SMTP_USER}"
EMAIL_HOST_PASSWORD = os.environ["RELOOP_API_KEY"]
DEFAULT_FROM_EMAIL = "Acme <receipts@acme.com>"`,
	},
	{
		id: "rails",
		name: "Rails",
		icon: siRubyonrails,
		lang: "ruby",
		path: "config/environments/production.rb",
		href: "/docs/examples/smtp/ruby",
		code: `config.action_mailer.delivery_method = :smtp
config.action_mailer.smtp_settings = {
  address: "${SMTP_HOST}",
  port: ${SMTP_PORT},
  user_name: "${SMTP_USER}",
  password: ENV["RELOOP_API_KEY"],
  authentication: :plain,
  enable_starttls_auto: true
}`,
	},
	{
		id: "python",
		name: "Python",
		icon: siPython,
		lang: "python",
		path: "send.py",
		href: "/docs/examples/smtp/python",
		code: `import os
import smtplib
from email.message import EmailMessage

msg = EmailMessage()
msg["From"] = "Acme <receipts@acme.com>"
msg["To"] = "jane@example.com"
msg["Subject"] = "Your receipt from Acme"
msg.set_content("Thanks for your order!")

with smtplib.SMTP("${SMTP_HOST}", ${SMTP_PORT}) as server:
    server.starttls()
    server.login("${SMTP_USER}", os.environ["RELOOP_API_KEY"])
    server.send_message(msg)`,
	},
	{
		id: "phpmailer",
		name: "PHPMailer",
		icon: siPhp,
		lang: "php",
		path: "send.php",
		href: "/docs/examples/smtp/php",
		code: `$mail = new PHPMailer(true);

$mail->isSMTP();
$mail->Host       = '${SMTP_HOST}';
$mail->Port       = ${SMTP_PORT};
$mail->SMTPAuth   = true;
$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
$mail->Username   = '${SMTP_USER}';
$mail->Password   = getenv('RELOOP_API_KEY');

$mail->setFrom('receipts@acme.com', 'Acme');
$mail->addAddress('jane@example.com');
$mail->Subject = 'Your receipt from Acme';
$mail->Body    = 'Thanks for your order!';
$mail->send();`,
	},
	{
		id: "go",
		name: "Go",
		icon: siGo,
		lang: "go",
		path: "main.go",
		href: "/docs/examples/smtp/go",
		code: `auth := smtp.PlainAuth("", "${SMTP_USER}", os.Getenv("RELOOP_API_KEY"), "${SMTP_HOST}")

msg := []byte("From: receipts@acme.com\\r\\n" +
	"To: jane@example.com\\r\\n" +
	"Subject: Your receipt from Acme\\r\\n" +
	"\\r\\n" +
	"Thanks for your order!\\r\\n")

err := smtp.SendMail("${SMTP_HOST}:${SMTP_PORT}", auth,
	"receipts@acme.com", []string{"jane@example.com"}, msg)`,
	},
	{
		id: "rust",
		name: "Rust",
		icon: siRust,
		lang: "rust",
		path: "main.rs",
		href: "/docs/examples/smtp/rust",
		code: `let email = Message::builder()
    .from("Acme <receipts@acme.com>".parse()?)
    .to("jane@example.com".parse()?)
    .subject("Your receipt from Acme")
    .body(String::from("Thanks for your order!"))?;

let creds = Credentials::new("${SMTP_USER}".into(), env::var("RELOOP_API_KEY")?);

let mailer = SmtpTransport::starttls_relay("${SMTP_HOST}")?
    .credentials(creds)
    .build();

mailer.send(&email)?;`,
	},
];

const UNDERLINE_TRANSITION = { duration: 0.3, ease: "easeInOut" } as const;
const FILL_TRANSITION = { duration: 0.45, ease: "easeOut" } as const;

export function MailersSection() {
	const [activeId, setActiveId] = useState(MAILERS[0]?.id ?? "");
	const mailer = MAILERS.find((m) => m.id === activeId) ?? MAILERS[0];
	if (!mailer) return null;

	return (
		<section
			id="mailers"
			aria-labelledby="mailers-heading"
			className="w-full bg-bg-white-0 dark:bg-black"
		>
			<SectionHeader
				id="mailers-heading"
				icon="code"
				eyebrow="Developer first"
				title={
					<>
						Works with the mailer
						<br />
						you already have
					</>
				}
				description="Framework mailers only need config. Everything else, from queues to templates, keeps working exactly as before."
			/>

			<div
				role="tablist"
				aria-label="Mailer"
				className="flex overflow-x-auto border-stroke-soft-100 border-b [scrollbar-width:none] dark:border-white/10 [&::-webkit-scrollbar]:hidden"
			>
				{MAILERS.map((m) => {
					const active = m.id === mailer.id;
					// Near-black brands (Django) fall back to the neutral text color.
					const neutral = isDarkBrandColor(m.icon.hex);
					return (
						<button
							key={m.id}
							type="button"
							role="tab"
							aria-selected={active}
							onClick={() => setActiveId(m.id)}
							style={
								neutral
									? undefined
									: ({ "--brand": `#${m.icon.hex}` } as React.CSSProperties)
							}
							className={cn(
								"group relative flex flex-[1_0_7rem] flex-col items-center gap-2.5 border-stroke-soft-100 border-r bg-bg-white-0 px-2 py-5 transition-colors duration-300 last:border-r-0 dark:border-white/10 dark:bg-black",
								!active && "hover:bg-bg-weak-50 dark:hover:bg-[#080808]",
							)}
						>
							{active && (
								// Active tint grows out from the center of the tab.
								<motion.span
									aria-hidden
									initial={{ clipPath: "circle(0% at 50% 50%)" }}
									animate={{ clipPath: "circle(100% at 50% 50%)" }}
									transition={FILL_TRANSITION}
									className={cn(
										"absolute inset-0",
										neutral
											? "bg-bg-weak-50 dark:bg-[#0c0c0c]"
											: "bg-[color-mix(in_srgb,var(--brand)_8%,white)] dark:bg-[color-mix(in_srgb,var(--brand)_14%,black)]",
									)}
								/>
							)}
							{active && (
								<motion.span
									aria-hidden
									layoutId="smtp-mailer-underline"
									transition={UNDERLINE_TRANSITION}
									className={cn(
										"absolute inset-x-0 bottom-0 z-10 h-0.5",
										neutral
											? "bg-text-strong-950 dark:bg-white"
											: "bg-(--brand)",
									)}
								/>
							)}
							<svg
								viewBox="0 0 24 24"
								aria-hidden
								className={cn(
									"relative size-6 transition-all",
									active
										? "text-text-strong-950 dark:text-white"
										: "text-text-sub-600 opacity-70 grayscale group-hover:opacity-100 dark:text-white/60",
								)}
							>
								<path
									d={m.icon.path}
									fill={neutral ? "currentColor" : `#${m.icon.hex}`}
								/>
							</svg>
							<span
								className={cn(
									"relative font-medium text-[13px]",
									active
										? "text-text-strong-950 dark:text-white"
										: "text-text-sub-600 dark:text-white/50",
								)}
							>
								{m.name}
							</span>
						</button>
					);
				})}
			</div>

			<div className="px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
				<SdkCodeBlock
					key={mailer.id}
					code={mailer.code}
					lang={mailer.lang}
					path={mailer.path}
				/>
			</div>

			<div className="flex flex-wrap gap-x-6 gap-y-2 border-stroke-soft-100 border-t px-4 py-4 sm:px-8 lg:px-12 dark:border-white/10">
				<Link
					href={mailer.href}
					className="group inline-flex items-center gap-1.5 font-medium text-[13px] text-text-strong-950 hover:text-text-sub-600 dark:text-white dark:hover:text-white/70"
				>
					{mailer.name} guide
					<Icon
						name="arrow-right"
						className="size-3 transition-transform group-hover:translate-x-0.5"
						aria-hidden
					/>
				</Link>
				<Link
					href={SMTP_INTRO}
					className="group inline-flex items-center gap-1.5 font-medium text-[13px] text-text-sub-600 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
				>
					SMTP docs
					<Icon
						name="arrow-right"
						className="size-3 transition-transform group-hover:translate-x-0.5"
						aria-hidden
					/>
				</Link>
			</div>
		</section>
	);
}
