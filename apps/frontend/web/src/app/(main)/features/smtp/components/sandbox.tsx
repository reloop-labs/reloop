"use client";

import { Icon } from "@reloop/ui/icon";
import { useState } from "react";
import { siNodedotjs, siPython } from "simple-icons";

type Language = "node" | "python";

const snippets: Record<Language, string> = {
	node: `import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.reloop.dev',
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: 'rl_smtp_live_xxxx',
    pass: process.env.RELOOP_SMTP_PASSWORD,
  },
});

await transporter.sendMail({
  from: 'noreply@yourdomain.com',
  to: 'user@example.com',
  subject: 'Hello from Reloop SMTP',
  html: '<p>Your first relayed message.</p>',
});`,
	python: `import smtplib
from email.message import EmailMessage

msg = EmailMessage()
msg["From"] = "noreply@yourdomain.com"
msg["To"] = "user@example.com"
msg["Subject"] = "Hello from Reloop SMTP"
msg.set_content("Your first relayed message.")

with smtplib.SMTP("smtp.reloop.dev", 587) as server:
    server.starttls()
    server.login("rl_smtp_live_xxxx", os.environ["RELOOP_SMTP_PASSWORD"])
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
		<section id="playground" className="scroll-mt-10">
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
				<div className="mx-auto mb-16 max-w-3xl text-center">
					<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
						Configure your mailer
					</h2>
					<p className="mx-auto mt-6 max-w-[620px] text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/50">
						Copy a starter snippet for Node.js or Python and point it at Reloop's SMTP relay.
					</p>
				</div>

				<div className="rounded-4xl border border-stroke-soft-200 bg-bg-weak-50 p-6 md:p-8 dark:border-white/10">
					<div className="flex flex-col gap-4 border-stroke-soft-200 border-b pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
						<div className="flex gap-1 rounded-xl border border-stroke-soft-200 bg-bg-soft-50 p-1 dark:border-white/10">
							{(["node", "python"] as Language[]).map((key) => {
								const isSelected = lang === key;
								return (
									<button
										key={key}
										type="button"
										onClick={() => setLang(key)}
										className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold text-xs transition-all ${
											isSelected
												? "bg-[#0a0d12] text-white dark:bg-white dark:text-black"
												: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white"
										}`}
									>
										{key === "node" && (
											<svg viewBox="0 0 24 24" className="size-3.5 fill-current">
												<path d={siNodedotjs.path} />
											</svg>
										)}
										{key === "python" && (
											<svg viewBox="0 0 24 24" className="size-3.5 fill-current">
												<path d={siPython.path} />
											</svg>
										)}
										<span>{key === "node" ? "Node.js" : "Python"}</span>
									</button>
								);
							})}
						</div>

						<div className="grid gap-2 font-mono text-[12px] sm:text-right">
							<div className="text-text-soft-400 dark:text-white/40">
								HOST{" "}
								<span className="text-text-strong-950 dark:text-white">
									smtp.reloop.dev
								</span>
							</div>
							<div className="text-text-soft-400 dark:text-white/40">
								PORT <span className="text-text-strong-950 dark:text-white">587</span>{" "}
								· TLS STARTTLS
							</div>
						</div>
					</div>

					<div className="mt-4 overflow-hidden rounded-xl border border-stroke-soft-200 bg-[#0a0a0a] font-mono text-[13px] leading-relaxed dark:border-white/10">
						<div className="flex items-center justify-between border-white/5 border-b px-4 py-2 text-white/40 text-xs">
							<span>smtp_setup.{lang === "node" ? "js" : "py"}</span>
							<button
								type="button"
								onClick={handleCopy}
								className="flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-white/5 hover:text-white"
							>
								<Icon name="copy" className="size-3.5" />
								{copied ? "Copied" : "Copy"}
							</button>
						</div>
						<pre className="max-h-[360px] overflow-auto p-4 text-white/80">
							{snippets[lang]}
						</pre>
					</div>
				</div>
			</div>
		</section>
	);
}
