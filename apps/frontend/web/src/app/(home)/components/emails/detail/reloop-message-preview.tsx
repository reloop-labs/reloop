"use client";

import { Logo } from "@reloop/ui/logo";
import { hostedSignupHref } from "@reloop/web/lib/site";

function firstNameFromEmail(address: string): string {
	const prefix = address.split("@")[0] ?? "there";
	const token = prefix.split(/[._-]/)[0] ?? prefix;
	if (!token) return "there";
	return token.charAt(0).toUpperCase() + token.slice(1);
}

export function ReloopMessagePreview({ to }: { to: string }) {
	const name = firstNameFromEmail(to);

	return (
		<div className="bg-white px-6 py-7 sm:px-8 sm:py-8 dark:bg-[#0e0e0e]">
			<div className="mx-auto max-w-[28rem]">
				<Logo className="-ml-1.5 mb-5 size-11" />

				<p className="m-0 font-medium font-mono text-[#707070] text-[11px] uppercase tracking-[0.2em]">
					You found Reloop
				</p>

				<h2
					className="mt-4 mb-0 font-normal text-[#0e0e0e] text-[28px] leading-[1.18] dark:text-white"
					style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
				>
					Open-source email
					<br />
					<span className="text-[#707070]">built for people who ship.</span>
				</h2>

				<div className="my-6 h-px w-full bg-[#e0e0e0] dark:bg-[#222]" />

				<div className="space-y-3.5 text-[#555] text-[14px] leading-[1.65] dark:text-[#b0b0b0]">
					<p className="text-[#0e0e0e] dark:text-white">Hey {name} —</p>
					<p>
						The list you clicked is a live send feed. This pane is the message.
						Not an invoice. Not a password reset. Reloop, talking like we do in
						the emails we actually send.
					</p>
					<p>
						We built the email layer we wanted for agents and side projects:
						API, SMTP, and an inbox your agent can read. On GitHub. Yours to
						extend.
					</p>
				</div>

				<div className="mt-6 border-[#e0e0e0] border-l border-solid pl-4 dark:border-[#222]">
					<p className="m-0 font-medium font-mono text-[#707070] text-[10px] uppercase tracking-[0.2em]">
						Our mission
					</p>
					<p
						className="mt-2 mb-0 text-[#0e0e0e] text-[15px] italic leading-[1.55] dark:text-white"
						style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
					>
						Focus on what you&apos;re building, not on deliverability.
					</p>
				</div>

				<div className="mt-6 space-y-4 rounded-xl border border-[#e0e0e0] px-4 py-4 dark:border-[#222]">
					<div className="flex gap-3">
						<span className="w-6 shrink-0 font-mono text-[#404040] text-[11px]">
							01
						</span>
						<div>
							<p className="m-0 font-semibold text-[#0e0e0e] text-[13px] dark:text-white">
								Developers
							</p>
							<p className="mt-0.5 mb-0 text-[#707070] text-[12.5px] leading-snug">
								Clean API, SMTP, self-host or cloud. Your stack, your rules.
							</p>
						</div>
					</div>
					<div className="h-px bg-[#e0e0e0] dark:bg-[#222]" />
					<div className="flex gap-3">
						<span className="w-6 shrink-0 font-mono text-[#404040] text-[11px]">
							02
						</span>
						<div>
							<p className="m-0 font-semibold text-[#0e0e0e] text-[13px] dark:text-white">
								Agents
							</p>
							<p className="mt-0.5 mb-0 text-[#707070] text-[12.5px] leading-snug">
								A real inbox, a webhook, a CLI. Everything an agent needs to
								read and reply.
							</p>
						</div>
					</div>
				</div>

				<a
					href={hostedSignupHref}
					tabIndex={-1}
					className="mt-6 inline-flex items-center rounded-xl bg-[#0e0e0e] px-5 py-2.5 font-bold font-mono text-[11px] text-white uppercase tracking-wider dark:bg-[#edece1] dark:text-black"
				>
					Get Started
				</a>

				<p className="mt-5 mb-0 text-[#888] text-[12px] leading-relaxed dark:text-[#707070]">
					P.S. If you can read this, the preview rendered. Hit reply in a real
					Reloop send — someone actually reads it.
				</p>
			</div>
		</div>
	);
}

export function reloopMessagePlainText(to: string, subject: string): string {
	const name = firstNameFromEmail(to);
	return `From: Reloop <notifications@reloop.sh>
To: ${to}
Subject: ${subject}

Hey ${name} —

The list you clicked is a live send feed. This pane is the message.
Not an invoice. Not a password reset. Reloop, talking like we do
in the emails we actually send.

We built the email layer we wanted for agents and side projects:
API, SMTP, and an inbox your agent can read. On GitHub. Yours to extend.

Our mission
"Focus on what you're building, not on deliverability."

01  Developers — Clean API, SMTP, self-host or cloud.
02  Agents — A real inbox, a webhook, a CLI.

Get started: https://reloop.sh/dashboard/signup

P.S. If you can read this, the preview rendered.`;
}

export function reloopMessageHtml(to: string, subject: string): string {
	const name = firstNameFromEmail(to);
	return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:32px 24px;background:#ffffff;color:#0e0e0e;font-family:ui-sans-serif,system-ui,sans-serif;">
    <p style="margin:0;font-family:ui-monospace,monospace;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#707070;">You found Reloop</p>
    <h1 style="margin:16px 0 0;font-family:Georgia,serif;font-weight:400;font-size:28px;line-height:1.2;">
      Open-source email<br>
      <span style="color:#707070;">built for people who ship.</span>
    </h1>
    <hr style="margin:24px 0;border:none;border-top:1px solid #e0e0e0;">
    <p style="font-size:15px;line-height:1.6;color:#555;">Hey ${name} —</p>
    <p style="font-size:15px;line-height:1.6;color:#555;">The list you clicked is a live send feed. This is the message.</p>
    <p style="margin:24px 0 0;padding-left:16px;border-left:1px solid #e0e0e0;font-family:Georgia,serif;font-size:17px;font-style:italic;color:#0e0e0e;">
      Focus on what you're building, not on deliverability.
    </p>
    <p style="margin-top:32px;">
      <a href="https://reloop.sh/dashboard/signup" style="display:inline-block;padding:12px 20px;border-radius:12px;background:#0e0e0e;color:#fff;font-family:ui-monospace,monospace;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;">Get Started</a>
    </p>
  </body>
</html>`;
}

export function reloopMessageRaw(
	id: string,
	to: string,
	subject: string,
): string {
	return `Received: by mail.reloop.sh with SMTP id msg_${id}
From: Reloop <notifications@reloop.sh>
To: ${to}
Subject: ${subject}
Date: Mon, 17 Aug 2026 18:24:10 +0000
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="_=_swift_178294_=_"
X-Entity-ID: ent_${id}
DKIM-Signature: v=1; a=rsa-sha256; d=reloop.sh; s=rel1; bh=...
Authentication-Results: reloop.sh; dkim=pass; spf=pass; dmarc=pass

--_=_swift_178294_=_
Content-Type: text/plain; charset=UTF-8

${reloopMessagePlainText(to, subject).split("\n\n").slice(3).join("\n\n")}

--_=_swift_178294_=_
Content-Type: text/html; charset=UTF-8

${reloopMessageHtml(to, subject)}
--_=_swift_178294_=_--`;
}
