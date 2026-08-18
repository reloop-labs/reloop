import type { IconName } from "@reloop/ui/icon";
import type { ReactNode } from "react";

export type PreviewTabId = "send" | "templates" | "events";

export const PREVIEW_TABS: {
	id: PreviewTabId;
	icon?: IconName;
	title: string;
	description: string;
	href: string;
}[] = [
	{
		id: "send",
		icon: "send-2",
		title: "Send API",
		description: "One call from Node, Python, or a cron. Same payload every time.",
		href: "/docs/quickstart/nodejs",
	},
	{
		id: "templates",
		title: "React Email supported",
		description: "Write the email once in React. Variables fill in on every send.",
		href: "https://react.email",
	},
	{
		id: "events",
		icon: "webhook",
		title: "Live events",
		description:
			"POST delivered, opened, and bounced to your app the moment they fire.",
		href: "/features/webhooks",
	},
];

export const PREVIEW_FILES: Record<PreviewTabId, string> = {
	send: "send.ts",
	templates: "otp.tsx",
	events: "webhook.ts",
};

export function SendApiCode() {
	return <SendSnippet />;
}

function SendSnippet() {
	return (
		<code>
			<span className="text-[#c2410c] dark:text-[#fb923c]">import</span>
			<span className="text-text-strong-950 dark:text-white"> Reloop </span>
			<span className="text-[#c2410c] dark:text-[#fb923c]">from</span>
			<span className="text-emerald-700 dark:text-emerald-400">
				{" 'reloop-email'"}
			</span>
			<span className="text-text-soft-400">;</span>
			{"\n\n"}
			<span className="text-[#c2410c] dark:text-[#fb923c]">const</span>
			<span className="text-text-strong-950 dark:text-white"> reloop </span>
			<span className="text-text-soft-400">= </span>
			<span className="text-[#c2410c] dark:text-[#fb923c]">new</span>
			<span className="text-text-strong-950 dark:text-white"> Reloop</span>
			<span className="text-text-soft-400">(</span>
			<span className="text-text-sub-600 dark:text-white/55">
				process.env.RELOOP_API_KEY
			</span>
			<span className="text-text-soft-400">);</span>
			{"\n\n"}
			<span className="text-[#c2410c] dark:text-[#fb923c]">await</span>
			<span className="text-text-strong-950 dark:text-white">
				{" reloop.emails.send({"}
			</span>
			{"\n"}
			<span className="text-text-sub-600 dark:text-white/55">{"  from: "}</span>
			<span className="text-emerald-700 dark:text-emerald-400">
				{"'Acme <onboarding@acme.dev>'"}
			</span>
			<span className="text-text-soft-400">,</span>
			{"\n"}
			<span className="text-text-sub-600 dark:text-white/55">{"  to: ["}</span>
			<span className="text-emerald-700 dark:text-emerald-400">
				{"'maya@northwind.io'"}
			</span>
			<span className="text-text-soft-400">],</span>
			{"\n"}
			<span className="text-text-sub-600 dark:text-white/55">
				{"  subject: "}
			</span>
			<span className="text-emerald-700 dark:text-emerald-400">
				{"'Welcome to Acme'"}
			</span>
			<span className="text-text-soft-400">,</span>
			{"\n"}
			<span className="text-text-sub-600 dark:text-white/55">
				{"  template: "}
			</span>
			<span className="text-emerald-700 dark:text-emerald-400">
				{"'welcome'"}
			</span>
			<span className="text-text-soft-400">,</span>
			{"\n"}
			<span className="text-text-strong-950 dark:text-white">{"})"}</span>
			<span className="text-text-soft-400">;</span>
		</code>
	);
}

export function TemplatesCode() {
	return (
		<code>
			<span className="text-[#c2410c] dark:text-[#fb923c]">export</span>
			<span className="text-text-strong-950 dark:text-white"> function </span>
			<span className="text-primary-base">OtpEmail</span>
			<span className="text-text-soft-400">{"({ "}</span>
			<span className="text-text-strong-950 dark:text-white">code = </span>
			<span className="text-emerald-700 dark:text-emerald-400">
				{"'842 190'"}
			</span>
			<span className="text-text-soft-400">{" }) {"}</span>
			{"\n"}
			<span className="text-[#c2410c] dark:text-[#fb923c]">{"  return"}</span>
			<span className="text-text-soft-400"> (</span>
			{"\n"}
			<span className="text-text-sub-600 dark:text-white/55">
				{"    <Email>"}
			</span>
			{"\n"}
			<span className="text-text-sub-600 dark:text-white/55">
				{"      <Heading>Your verification code</Heading>"}
			</span>
			{"\n"}
			<span className="text-text-sub-600 dark:text-white/55">
				{
					"      <Text>Enter this 6-digit code to complete sign-in to Reloop.</Text>"
				}
			</span>
			{"\n"}
			<span className="text-text-sub-600 dark:text-white/55">
				{"      <OtpCode value={code} expiresIn=\"10 minutes\" />"}
			</span>
			{"\n"}
			<span className="text-text-sub-600 dark:text-white/55">
				{
					"      <Text muted>If you didn't request this code, ignore this email.</Text>"
				}
			</span>
			{"\n"}
			<span className="text-text-sub-600 dark:text-white/55">
				{"    </Email>"}
			</span>
			{"\n"}
			<span className="text-text-soft-400">{"  )"}</span>
			{"\n"}
			<span className="text-text-soft-400">{"}"}</span>
		</code>
	);
}

export function EventsCode() {
	return (
		<code>
			<span className="text-[#c2410c] dark:text-[#fb923c]">reloop</span>
			<span className="text-text-strong-950 dark:text-white">.webhooks.</span>
			<span className="text-primary-base">on</span>
			<span className="text-text-soft-400">(</span>
			<span className="text-emerald-700 dark:text-emerald-400">
				{"'email.opened'"}
			</span>
			<span className="text-text-soft-400">, </span>
			<span className="text-[#c2410c] dark:text-[#fb923c]">async</span>
			<span className="text-text-soft-400"> (</span>
			<span className="text-text-strong-950 dark:text-white">event</span>
			<span className="text-text-soft-400">{") => {"}</span>
			{"\n"}
			<span className="text-text-sub-600 dark:text-white/55">
				{"  console.log(event.to, event.openedAt)"}
			</span>
			{"\n"}
			<span className="text-text-soft-400">{"});"}</span>
		</code>
	);
}

export const PREVIEW_CODE: Record<PreviewTabId, () => ReactNode> = {
	send: SendApiCode,
	templates: TemplatesCode,
	events: EventsCode,
};

export const PREVIEW_CARD: Record<
	PreviewTabId,
	{
		badge: string;
		heading: string;
		body: string;
		cta: string;
	}
> = {
	send: {
		badge: "welcome",
		heading: "Welcome to Acme",
		body: "Hi Maya — your workspace is ready. Confirm your email and send the first message in a few lines of code.",
		cta: "Confirm email",
	},
	templates: {
		badge: "template",
		heading: "Reset your password",
		body: "Hi Alex — we received a request to reset your password. This link expires in 20 minutes.",
		cta: "Reset password",
	},
	events: {
		badge: "live",
		heading: "Opened 2 min ago",
		body: "Welcome to Acme reached Maya Chen. Delivered, then opened. The webhook fired as it happened.",
		cta: "View event",
	},
};
