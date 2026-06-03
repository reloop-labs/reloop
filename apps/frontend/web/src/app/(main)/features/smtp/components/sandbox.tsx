"use client";

import { Icon } from "@reloop/ui/icon";
import { useState } from "react";
import { siNodedotjs, siPython } from "simple-icons";

type Language = "node" | "python";

const SMTP_HOST = "smtp.reloop.sh";

const snippets: Record<Language, string> = {
	node: `import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: '${SMTP_HOST}',
  port: 587,
  secure: false, // use STARTTLS
  auth: {
    user: process.env.RELOOP_SMTP_USER,
    pass: process.env.RELOOP_SMTP_PASSWORD,
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

with smtplib.SMTP("${SMTP_HOST}", 587) as server:
    server.starttls()
    server.login(
        os.environ["RELOOP_SMTP_USER"],
        os.environ["RELOOP_SMTP_PASSWORD"],
    )
    server.send_message(msg)`,
};

export default function Sandbox() {
	const [lang, setLang] = useState<Language>("node");
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(snippets[lang]);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<section id="setup" className="scroll-mt-24">
			<div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
				<div className="mx-auto mb-10 max-w-2xl text-center">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						Example code
					</p>
					<h2 className="mt-3 font-serif text-[2rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2.6rem] dark:text-white">
						Connect in{" "}
						<span className="text-primary-base">a few lines.</span>
					</h2>
				</div>

				<div className="mx-auto max-w-3xl rounded-2xl border border-stroke-soft-200 p-5 md:p-6 dark:border-white/10">
					<div className="flex flex-col gap-4 border-stroke-soft-200 border-b pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
						<div className="flex gap-1 rounded-xl border border-stroke-soft-200 bg-bg-soft-50 p-1 dark:border-white/10">
							{(["node", "python"] as Language[]).map((key) => (
								<button
									key={key}
									type="button"
									onClick={() => setLang(key)}
									className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold text-xs transition-colors ${
										lang === key
											? "bg-[#0a0d12] text-white dark:bg-white dark:text-black"
											: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/50"
									}`}
								>
									<svg viewBox="0 0 24 24" className="size-3.5 fill-current">
										<path
											d={key === "node" ? siNodedotjs.path : siPython.path}
										/>
									</svg>
									{key === "node" ? "Node.js" : "Python"}
								</button>
							))}
						</div>
						<p className="font-mono text-[12px] text-text-sub-600 dark:text-white/50">
							{SMTP_HOST}:587
						</p>
					</div>

					<div className="mt-4 overflow-hidden rounded-xl border border-stroke-soft-200 bg-[#0a0a0a] font-mono text-[13px] leading-relaxed dark:border-white/10">
						<div className="flex items-center justify-between border-white/5 border-b px-4 py-2 text-white/40 text-xs">
							<span>smtp.{lang === "node" ? "js" : "py"}</span>
							<button
								type="button"
								onClick={handleCopy}
								className="flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-white/5 hover:text-white"
							>
								<Icon name="copy" className="size-3.5" />
								{copied ? "Copied" : "Copy"}
							</button>
						</div>
						<pre className="max-h-[320px] overflow-auto p-4 text-white/80">
							{snippets[lang]}
						</pre>
					</div>
				</div>
			</div>
		</section>
	);
}
