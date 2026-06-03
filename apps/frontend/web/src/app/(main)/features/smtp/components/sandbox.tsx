"use client";

import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useState } from "react";
import { siNodedotjs, siPython } from "simple-icons";

type Language = "node" | "python";

const SMTP_HOST = "smtp.reloop.sh";
const SMTP_PORT = "587/2587/2465";
const SMTP_USER = "reloop";

const copySettings = [
	{ label: "Host", value: SMTP_HOST },
	{ label: "Port", value: SMTP_PORT },
	{ label: "Username", value: SMTP_USER },
];

const snippets: Record<Language, string> = {
	node: `import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: '${SMTP_HOST}',
  port: ${SMTP_PORT},
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

with smtplib.SMTP("${SMTP_HOST}", ${SMTP_PORT}) as server:
    server.starttls()
    server.login("${SMTP_USER}", os.environ["RELOOP_API_KEY"])
    server.send_message(msg)`,
};

function CopySetting({ label, value }: { label: string; value: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(value);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="group flex w-full flex-col rounded-xl border border-stroke-soft-200 px-4 py-3 text-left transition-colors hover:border-primary-base/40 hover:bg-primary-base/[0.03] dark:border-white/10 dark:hover:border-primary-base/30"
		>
			<div className="flex items-center justify-between gap-2">
				<span className="font-semibold text-[11px] text-primary-base uppercase tracking-[0.12em]">
					{label}
				</span>
				<span className="flex items-center gap-1 font-medium text-[11px] text-text-sub-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-white/40">
					<Icon name="copy" className="size-3" />
					{copied ? "Copied" : "Copy"}
				</span>
			</div>
			<span className="mt-1.5 font-mono text-[14px] text-text-strong-950 dark:text-white">
				{value}
			</span>
		</button>
	);
}

function PasswordSetting() {
	return (
		<Link
			href="/dashboard/signup"
			className="group flex w-full flex-col rounded-xl border border-stroke-soft-200 px-4 py-3 transition-colors hover:border-primary-base/40 hover:bg-primary-base/[0.03] dark:border-white/10 dark:hover:border-primary-base/30"
		>
			<span className="font-semibold text-[11px] text-primary-base uppercase tracking-[0.12em]">
				Password
			</span>
			<span className="mt-1.5 inline-flex items-center gap-1.5 font-semibold text-[14px] text-text-strong-950 dark:text-white">
				Get your API key
				<svg
					viewBox="0 0 24 24"
					className="size-4 transition-transform group-hover:translate-x-0.5"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					aria-hidden
				>
					<path
						d="M5 12h14M13 6l6 6-6 6"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</span>
		</Link>
	);
}

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
						Connect
					</p>
					<h2 className="mt-3 font-serif text-[2rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2.6rem] dark:text-white">
						Copy settings,{" "}
						<span className="text-primary-base">paste into your app.</span>
					</h2>
					<p className="mt-4 text-[15px] text-text-sub-600 leading-7 dark:text-white/50">
						Same host and port everywhere. Grab an API key from the dashboard
						for the password.
					</p>
				</div>

				<div className="mx-auto max-w-3xl space-y-4">
					<div className="grid gap-3 sm:grid-cols-2">
						{copySettings.map((setting) => (
							<CopySetting key={setting.label} {...setting} />
						))}
						<PasswordSetting />
					</div>

					<div className="rounded-2xl border border-stroke-soft-200 p-5 md:p-6 dark:border-white/10">
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
								Or paste into any SMTP mailer
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
			</div>
		</section>
	);
}
