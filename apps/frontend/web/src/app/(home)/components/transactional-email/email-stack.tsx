"use client";

import { cn } from "@reloop/ui/cn";
import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type StackEmail = {
	id: string;
	body: ReactNode;
};

const EMAILS: StackEmail[] = [
	{ id: "otp", body: <OtpEmailBody /> },
	{ id: "reset", body: <ResetEmailBody /> },
	{ id: "welcome", body: <WelcomeEmailBody /> },
	{ id: "invite", body: <InviteEmailBody /> },
];

export function EmailStack({ activeId = "otp" }: { activeId?: string }) {
	const shouldReduceMotion = useReducedMotion();
	const email = EMAILS.find((e) => e.id === activeId) ?? EMAILS[0]!;

	return (
		<div className="relative mx-auto h-[32rem] w-full">
			<article
				className={cn(
					"absolute inset-0 overflow-hidden rounded-[22px] border bg-bg-white-0 dark:bg-[#141414]",
					"border-stroke-soft-200 shadow-[0_24px_60px_rgba(15,23,42,0.14)] dark:border-white/10 dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)]",
				)}
			>
				<AnimatePresence mode="wait" initial={false}>
					<motion.div
						key={email.id}
						initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
						animate={{ opacity: 1, y: 0 }}
						exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
						transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
					>
						{email.body}
					</motion.div>
				</AnimatePresence>
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-bg-white-0 from-15% to-transparent dark:from-[#141414]"
				/>
			</article>
		</div>
	);
}

function EmailShell({ children }: { children: ReactNode }) {
	return (
		<div className="bg-bg-white-0 px-5 pt-6 pb-8 text-text-strong-950 sm:px-6 sm:pt-7 sm:pb-9 dark:bg-[#141414] dark:text-white">
			<Logo className="-ml-1.5 mb-4 size-[40px] dark:invert" />
			{children}
		</div>
	);
}

function MonoLabel({ children }: { children: ReactNode }) {
	return (
		<p className="m-0 font-medium font-mono text-[#707070] text-[12px] uppercase tracking-[0.2em]">
			{children}
		</p>
	);
}

function SerifHeading({
	children,
	muted,
}: {
	children: ReactNode;
	muted?: ReactNode;
}) {
	return (
		<h3
			className="mt-3.5 mb-4 p-0 font-medium text-[#0e0e0e] text-[20px] leading-snug tracking-tight sm:text-[22px] dark:text-white"
			style={{ fontFamily: "Georgia, serif" }}
		>
			{children}
			{muted ? <span className="text-[#707070]">{muted}</span> : null}
		</h3>
	);
}

function Rule() {
	return <div className="my-5 h-px w-full bg-[#e0e0e0] dark:bg-[#222]" />;
}

function BodyText({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<p
			className={cn(
				"mt-4 text-[#555555] text-[15px] leading-[1.6] dark:text-[#b0b0b0]",
				className,
			)}
		>
			{children}
		</p>
	);
}

function Cta({ children }: { children: ReactNode }) {
	return (
		<span className="mt-10 inline-flex items-center rounded-xl bg-[#0e0e0e] px-6 py-3 text-center font-bold font-mono text-[12px] text-white uppercase tracking-wider dark:bg-[#edece1] dark:text-black">
			{children}
		</span>
	);
}

function EmailFooter() {
	return (
		<div className="mt-10 text-[#707070] text-[12px] leading-[24px]">
			<div className="mb-4 font-mono tracking-[0.05em]">
				<span className="text-[18px]">𝕏</span>
				<span className="mx-2 text-[18px] text-[#d0d0d0] dark:text-[#333]">
					·
				</span>
				<span className="text-[13px]">GitHub</span>
				<span className="mx-2 text-[18px] text-[#d0d0d0] dark:text-[#333]">
					·
				</span>
				<span className="text-[13px]">LinkedIn</span>
			</div>
			<div className="my-8 h-px w-full bg-[#e0e0e0] dark:bg-[#222]" />
			<p className="m-0">
				If you&apos;d like to report an issue, reach out to{" "}
				<span className="underline">Reloop Help</span>.
			</p>
			<p className="m-0">
				<span className="underline">Manage your notification settings</span>
			</p>
			<p className="m-0 mt-4">
				Copyright © 2026 Reloop Inc. All rights reserved.
				<br />
				440 N Barranca Ave #4133 Covina, CA 91723
			</p>
		</div>
	);
}

function OtpEmailBody() {
	return (
		<EmailShell>
			<MonoLabel>One-Time Passcode</MonoLabel>
			<SerifHeading>Your verification code</SerifHeading>
			<Rule />
			<BodyText>
				Enter this 6-digit verification code to complete your sign-in to
				Reloop. This code expires in 10 minutes.
			</BodyText>

			<div className="my-6 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-5 text-center dark:border-white/10 dark:bg-white/[0.04]">
				<p className="m-0 font-bold font-mono text-[26px] text-text-strong-950 tracking-[0.2em] sm:text-[28px] dark:text-white">
					842 190
				</p>
				<p className="mt-2 mb-0 text-[#707070] text-[11.5px]">
					Valid for 10 minutes · Do not share this code
				</p>
			</div>

			<BodyText className="text-[12.5px] text-[#707070] dark:text-[#888]">
				If you didn&apos;t request this code, you can safely ignore this
				message.
			</BodyText>

			<EmailFooter />
		</EmailShell>
	);
}

function WelcomeEmailBody() {
	return (
		<EmailShell>
			<MonoLabel>Welcome to Reloop</MonoLabel>
			<SerifHeading muted="built for deliverability and scale.">
				Open-source email infrastructure
				<br />
			</SerifHeading>
			<Rule />
			<BodyText>Hey, welcome! Really glad you&apos;re here.</BodyText>
			<BodyText>
				A new era of software is being built — AI agents that run autonomously,
				indie developers shipping overnight, and startups moving from idea to
				launch in days. The builders are getting faster. The tools around email
				haven&apos;t changed much.
			</BodyText>
			<BodyText>That&apos;s why Reloop exists.</BodyText>

			<div className="mt-10 mb-10 border-stroke-soft-200 border-l border-solid pl-6 dark:border-white/10">
				<MonoLabel>Our Mission</MonoLabel>
				<p
					className="mt-4 mb-0 font-serif text-[#0e0e0e] text-[18px] italic leading-[1.6] dark:text-white"
					style={{ fontFamily: "Georgia, serif" }}
				>
					&ldquo;Open-source email infrastructure built for AI agents and
					developers — so you can focus on what you&apos;re building, and not on
					email deliverability.&rdquo;
				</p>
			</div>

			<BodyText>
				We&apos;ve seen the next generation of companies — smaller teams, bigger
				ambitions. They&apos;ll be powered by AI, built in the open, and run by
				founders who care more about their product than their billing stack.
			</BodyText>
			<BodyText>
				Reloop gives them the email layer they deserve: reliable, composable,
				and transparent, and self-hostable.
			</BodyText>

			<div className="mt-10 rounded-lg border border-stroke-soft-200 border-solid p-8 dark:border-white/10">
				<MonoLabel>What you can do with Reloop</MonoLabel>
				<div className="mt-6 flex gap-2">
					<p className="m-0 w-8 shrink-0 font-mono text-[#404040] text-[12px]">
						01
					</p>
					<div className="border-[#e0e0e0] border-b pb-6 dark:border-[#222]">
						<p className="m-0 font-semibold text-[#0e0e0e] text-[16px] dark:text-white">
							AI Agents
						</p>
						<p className="mt-1 mb-0 text-[#707070] text-[15px]">
							A dedicated email inbox for AI agents — a webhook to get notified,
							CLI to read and respond. Everything your agent needs.
						</p>
					</div>
				</div>
				<div className="mt-6 flex gap-2">
					<p className="m-0 w-8 shrink-0 font-mono text-[#404040] text-[12px]">
						02
					</p>
					<div>
						<p className="m-0 font-semibold text-[#0e0e0e] text-[16px] dark:text-white">
							Developers
						</p>
						<p className="mt-1 mb-0 text-[#707070] text-[15px]">
							Built for developers — clean APIs, great DX, and full control.
							Self-host or use our cloud. Your stack, your rules.
						</p>
					</div>
				</div>
			</div>

			<Cta>Get Started</Cta>

			<p className="mt-10 mb-8 text-[#555555] text-[15px] leading-[1.6] dark:text-[#b0b0b0]">
				Honestly? We&apos;ll probably get things wrong. But that&apos;s exactly
				why I&apos;m writing to you. Every critique, every &apos;this feels
				off&apos;, every &apos;why doesn&apos;t it do this&apos; — that&apos;s
				what shapes Reloop into something worth using. You&apos;re not just a
				user here. You&apos;re the reason it gets better. Hit reply. I read
				everything personally.
			</p>
			<EmailFooter />
		</EmailShell>
	);
}

function ResetEmailBody() {
	return (
		<EmailShell>
			<MonoLabel>Password Reset</MonoLabel>
			<SerifHeading>Reset your Reloop password.</SerifHeading>
			<Rule />
			<BodyText>
				We received a request to reset the password for your Reloop account.
				This link expires in 20 minutes.
			</BodyText>
			<BodyText>
				If you didn&apos;t ask for this, you can ignore the email — your
				password stays the same.
			</BodyText>
			<Cta>Choose a new password</Cta>
			<EmailFooter />
		</EmailShell>
	);
}

function InviteEmailBody() {
	return (
		<EmailShell>
			<MonoLabel>Team Invitation</MonoLabel>
			<SerifHeading>
				Join <span className="font-bold">Reloop</span> on{" "}
				<span className="font-bold">Reloop.</span>
			</SerifHeading>
			<Rule />
			<BodyText>
				Hello, <strong className="text-[#0e0e0e] dark:text-white">Maya.</strong>
			</BodyText>
			<BodyText>
				<strong className="text-[#0e0e0e] dark:text-white">Pranav Patel</strong>{" "}
				(
				<strong className="text-[#0e0e0e] dark:text-white">
					reloop.sh@gmail.com
				</strong>
				) has invited you to the{" "}
				<strong className="text-[#0e0e0e] dark:text-white">Reloop</strong> team
				on <strong className="text-[#0e0e0e] dark:text-white">Reloop</strong>.
			</BodyText>
			<Cta>Join the team</Cta>
			<p className="mt-8 text-[#888888] text-[13px] leading-[1.6] dark:text-[#707070]">
				or copy and paste this URL into your browser:{" "}
				<span className="text-[#0e0e0e] underline dark:text-[#edece1]">
					https://reloop.sh/invite/abc123
				</span>
			</p>
			<div className="my-10 h-px w-full bg-[#e0e0e0] dark:bg-[#222]" />
			<div className="text-[#707070] text-[12px] leading-[24px]">
				<p className="m-0">
					If you&apos;d like to report an issue, reach out to{" "}
					<span className="underline">Reloop Help</span>.
				</p>
				<p className="m-0">
					<span className="underline">Manage your notification settings</span>
				</p>
				<p className="m-0 mt-4">
					Copyright © 2026 Reloop Inc. All rights reserved.
					<br />
					440 N Barranca Ave #4133 Covina, CA 91723
				</p>
			</div>
		</EmailShell>
	);
}

function DigestEmailBody() {
	return (
		<EmailShell>
			<MonoLabel>Weekly Digest</MonoLabel>
			<SerifHeading muted="delivered, opened, bounced.">
				Your week in email,
				<br />
			</SerifHeading>
			<Rule />
			<BodyText>Here&apos;s what moved across Reloop this week.</BodyText>
			<div className="mt-10 rounded-lg border border-[#e0e0e0] border-solid p-8 dark:border-[#222]">
				<MonoLabel>This week</MonoLabel>
				<div className="mt-6 flex gap-2">
					<p className="m-0 w-8 shrink-0 font-mono text-[#404040] text-[12px]">
						01
					</p>
					<div className="border-[#e0e0e0] border-b pb-6 dark:border-[#222]">
						<p className="m-0 font-semibold text-[#0e0e0e] text-[16px] dark:text-white">
							48,210 sent
						</p>
						<p className="mt-1 mb-0 text-[#707070] text-[15px]">
							Transactional volume across welcome, reset, and invite.
						</p>
					</div>
				</div>
				<div className="mt-6 flex gap-2">
					<p className="m-0 w-8 shrink-0 font-mono text-[#404040] text-[12px]">
						02
					</p>
					<div>
						<p className="m-0 font-semibold text-[#0e0e0e] text-[16px] dark:text-white">
							99.2% delivered
						</p>
						<p className="mt-1 mb-0 text-[#707070] text-[15px]">
							Opens at 42%. Two domains need a DKIM look.
						</p>
					</div>
				</div>
			</div>
			<Cta>Open analytics</Cta>
			<EmailFooter />
		</EmailShell>
	);
}
