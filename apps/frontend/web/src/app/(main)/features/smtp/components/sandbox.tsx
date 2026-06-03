"use client";

import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useState } from "react";
import { siNodedotjs, siPython } from "simple-icons";

type Language = "node" | "python";

const SMTP_HOST = "smtp.reloop.sh";
const SMTP_PORTS = "587/2587/2465";
const SMTP_USER = "reloop";
const DEFAULT_SMTP_PORT = 587;

const copySettings = [
	{ label: "Host", value: SMTP_HOST },
	{ label: "Port", value: SMTP_PORTS },
	{ label: "Username", value: SMTP_USER },
];

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

const codeGuide: Record<
	Language,
	{ eyebrow: string; title: string; description: string; points: string[] }
> = {
	node: {
		eyebrow: "Example",
		title: "Connect with Nodemailer",
		description:
			"Drop this into your backend. Your API key goes in RELOOP_API_KEY — the same value you use as the SMTP password.",
		points: [
			"Port 587 with STARTTLS",
			"Works with Express, Next.js, and any Node mailer",
		],
	},
	python: {
		eyebrow: "Example",
		title: "Connect with smtplib",
		description:
			"Python's standard library is enough. Set RELOOP_API_KEY in your environment and run the script.",
		points: [
			"Port 587 with STARTTLS",
			"No extra packages — smtplib ships with Python",
		],
	},
};

function CodeGuidePanel({ lang }: { lang: Language }) {
	const guide = codeGuide[lang];

	return (
		<div className="flex flex-col lg:pr-4">
			<p className="font-semibold text-[11px] text-primary-base uppercase tracking-[0.16em]">
				{guide.eyebrow}
			</p>
			<h3 className="mt-3 font-serif text-[1.75rem] text-text-strong-950 leading-[1.1] tracking-tighter sm:text-[2rem] dark:text-white">
				{guide.title}
			</h3>
			<p className="mt-4 text-[15px] text-text-sub-600 leading-7 dark:text-white/50">
				{guide.description}
			</p>
			<ul className="mt-6 space-y-3">
				{guide.points.map((point) => (
					<li
						key={point}
						className="flex items-start gap-2.5 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50"
					>
						<span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary-base" />
						{point}
					</li>
				))}
			</ul>
			<Link
				href="/docs/quickstart/smtp"
				className="mt-8 inline-flex items-center gap-1.5 font-semibold text-primary-base text-sm transition-colors hover:text-primary-dark"
			>
				View SMTP docs
				<svg
					viewBox="0 0 24 24"
					className="size-4"
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
			</Link>
		</div>
	);
}

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
			className="group flex w-full flex-col rounded-xl border border-stroke-soft-100 px-4 py-3 text-left transition-colors hover:border-primary-base/40 hover:bg-primary-base/[0.03] dark:border-stroke-soft-100/40 dark:hover:border-primary-base/30"
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
			className="group flex w-full flex-col rounded-xl border border-stroke-soft-100 px-4 py-3 transition-colors hover:border-primary-base/40 hover:bg-primary-base/[0.03] dark:border-stroke-soft-100/40 dark:hover:border-primary-base/30"
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
						Same host and port everywhere. Grab an API key from the dashboard for
						the password.
					</p>
				</div>

				<div className="mx-auto max-w-5xl space-y-8">
					<div className="grid gap-3 sm:grid-cols-2">
						{copySettings.map((setting) => (
							<CopySetting key={setting.label} {...setting} />
						))}
						<PasswordSetting />
					</div>

					<div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10">
						<CodeGuidePanel lang={lang} />
						<CopyCodeBlock
							code={snippets[lang]}
							lang={lang === "node" ? "javascript" : "python"}
							windowTitle={lang === "node" ? "smtp.js" : "smtp.py"}
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
