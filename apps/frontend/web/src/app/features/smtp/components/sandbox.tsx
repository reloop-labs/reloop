"use client";

import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";
import { siNodedotjs, siPython } from "simple-icons";

type Language = "node" | "python";

const SMTP_HOST = "smtp.reloop.sh";
const SMTP_USER = "reloop";
const DEFAULT_SMTP_PORT = 587;

const snippets: Record<Language, string> = {
	node: `import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: '${SMTP_HOST}',
  port: ${DEFAULT_SMTP_PORT},
  secure: false, // use STARTTLS
  auth: {
    user: '${SMTP_USER}',
    pass: process.env.RELOOP_API_KEY,
  },
});

await transporter.sendMail({
  from: 'noreply@yourdomain.com',
  to: 'user@example.com',
  subject: 'Hello from Reloop',
  html: '<p>Sent via SMTP relay.</p>',
});`,
	python: `import os
import smtplib
from email.message import EmailMessage

msg = EmailMessage()
msg["From"] = "noreply@yourdomain.com"
msg["To"] = "user@example.com"
msg["Subject"] = "Hello from Reloop"
msg.set_content("Sent via SMTP relay.")

with smtplib.SMTP("${SMTP_HOST}", ${DEFAULT_SMTP_PORT}) as server:
    server.starttls()
    server.login("${SMTP_USER}", os.environ["RELOOP_API_KEY"])
    server.send_message(msg)`,
};

const languageTabs = [
	{ id: "node", label: "Node.js", si: siNodedotjs },
	{ id: "python", label: "Python", si: siPython },
] as const;

export default function Sandbox() {
	const [lang, setLang] = useState<Language>("node");

	return (
		<section id="example" className="scroll-mt-24">
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
				<div className="mx-auto mb-16 max-w-3xl text-center">
					<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						Send your first email
					</h2>
					<p className="mx-auto mt-6 max-w-[620px] text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/50">
						Use the connection settings above with your API key as the password.
						Pick a language—the snippet updates, the guide stays the same.
					</p>
				</div>

				<div className="rounded-4xl border border-stroke-soft-200 bg-bg-weak-50 p-6 md:p-8 dark:border-white/10">
					<div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10">
						<div className="flex flex-col lg:pr-4">
							<ul className="space-y-3">
								{[
									"Port 587 with STARTTLS (or 2465 / 2587)",
									"Same host, user, and key for every mailer",
									"API key from the dashboard as password",
								].map((point) => (
									<li
										key={point}
										className="flex items-start gap-3 text-[14px] leading-snug"
									>
										<Icon
											name="check-circle"
											className="mt-0.5 size-4 shrink-0 text-text-sub-600 dark:text-white/35"
										/>
										<span className="text-text-sub-600 dark:text-white/60">
											{point}
										</span>
									</li>
								))}
							</ul>
							<a
								href="/docs/examples/smtp/introduction"
								className="group mt-8 inline-flex h-11 items-center justify-center overflow-hidden rounded-full border border-stroke-soft-200 bg-bg-white-0 px-5 font-medium text-[14px] text-text-strong-950 transition-colors duration-300 hover:bg-bg-weak-50 dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.1]"
							>
								<span className="inline-flex items-center">
									<span className="group-hover:-translate-x-1 transition-transform duration-300 ease-out">
										View SMTP docs
									</span>
									<Icon
										name="arrow-left"
										className="ml-0 size-4 max-w-0 shrink-0 translate-x-1 rotate-180 opacity-0 transition-all duration-300 ease-out group-hover:ml-2 group-hover:max-w-4 group-hover:translate-x-0 group-hover:opacity-100"
										aria-hidden
									/>
								</span>
							</a>
						</div>

						<CopyCodeBlock
							code={snippets[lang]}
							lang={lang === "node" ? "javascript" : "python"}
							tabs={[...languageTabs]}
							activeTab={lang}
							onTabChange={(id) => setLang(id as Language)}
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
