import type { CopyCodeBlockTab } from "@reloop/ui/copy-code-block";
import type { IconName } from "@reloop/ui/icon";
import { getLanguageIcon } from "@reloop/web/components/mdx/language-icons";

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
		description:
			"Send high-speed transactional emails with 99.9% inbox deliverability.",
		href: "/docs/quickstart/nodejs",
	},
	{
		id: "templates",
		title: "React Email supported",
		description:
			"Build responsive templates in React that render flawlessly in all inboxes.",
		href: "https://react.email",
	},
	{
		id: "events",
		icon: "webhook",
		title: "Live events",
		description:
			"Stream delivery, open, and bounce webhook events the moment they fire.",
		href: "/features/webhooks",
	},
];

export const PREVIEW_FILES: Record<PreviewTabId, string> = {
	send: "send.ts",
	templates: "otp.tsx",
	events: "webhook.ts",
};

export const SEND_API_TABS: CopyCodeBlockTab[] = [
	{ id: "send", label: "send.ts", si: getLanguageIcon("typescript")! },
	{ id: "contacts", label: "contacts.ts", si: getLanguageIcon("typescript")! },
	{ id: "groups", label: "groups.ts", si: getLanguageIcon("typescript")! },
	{ id: "batch", label: "batch.ts", si: getLanguageIcon("typescript")! },
];

export type SendApiTabId = "send" | "contacts" | "groups" | "batch";

export const SEND_CODE: Record<SendApiTabId, string> = {
	send: `import Reloop from 'reloop-email';

const reloop = new Reloop(process.env.RELOOP_API_KEY);

await reloop.emails.send({
  from: 'Acme <onboarding@acme.dev>',
  to: ['maya@northwind.io'],
  subject: 'Welcome to Acme',
  template: 'welcome',
});`,
	contacts: `import Reloop from 'reloop-email';

const reloop = new Reloop(process.env.RELOOP_API_KEY);

await reloop.contacts.create({
  email: 'maya@northwind.io',
  firstName: 'Maya',
  lastName: 'Chen',
  unsubscribed: false,
});`,
	groups: `import Reloop from 'reloop-email';

const reloop = new Reloop(process.env.RELOOP_API_KEY);

await reloop.audiences.create({
  name: 'Beta Testers',
  description: 'Early access user group',
});`,
	batch: `import Reloop from 'reloop-email';

const reloop = new Reloop(process.env.RELOOP_API_KEY);

await reloop.batch.send([
  {
    from: 'Acme <news@acme.dev>',
    to: ['maya@northwind.io'],
    subject: 'Welcome',
  },
  {
    from: 'Acme <news@acme.dev>',
    to: ['alex@harbor.co'],
    subject: 'Welcome',
  },
]);`,
};

export const TEMPLATE_TABS: CopyCodeBlockTab[] = [
	{ id: "otp", label: "otp.tsx", si: getLanguageIcon("typescript")! },
	{ id: "reset", label: "password-reset.tsx", si: getLanguageIcon("typescript")! },
	{ id: "welcome", label: "welcome-email.tsx", si: getLanguageIcon("typescript")! },
	{ id: "invite", label: "user-invite.tsx", si: getLanguageIcon("typescript")! },
];

export type TemplateTabId = "otp" | "reset" | "welcome" | "invite";

export const TEMPLATES_CODE: Record<TemplateTabId, string> = {
	otp: `export function OtpEmail({ code = '842 190' }) {
  return (
    <Email>
      <Heading>Your verification code</Heading>
      <Text>Enter this 6-digit code to complete sign-in to Reloop.</Text>
      <OtpCode value={code} expiresIn="10 minutes" />
      <Text muted>If you didn't request this code, ignore this email.</Text>
    </Email>
  );
}`,
	reset: `export function PasswordReset({ link = 'https://reloop.sh/reset?token=xyz' }) {
  return (
    <Email>
      <Heading>Reset your Reloop password</Heading>
      <Text>We received a request to reset your password. Link expires in 20 min.</Text>
      <Button href={link}>Choose a new password</Button>
      <Text muted>If you didn't request this, ignore this email.</Text>
    </Email>
  );
}`,
	welcome: `export function WelcomeEmail({ name = 'Maya' }) {
  return (
    <Email>
      <Heading>Welcome to Reloop, {name}</Heading>
      <Text>Open-source email infrastructure built for developers and AI agents.</Text>
      <Button href="https://reloop.sh/dashboard">Get Started</Button>
    </Email>
  );
}`,
	invite: `export function TeamInvite({ inviter = 'Pranav Patel', team = 'Reloop' }) {
  return (
    <Email>
      <Heading>Join {team} on Reloop</Heading>
      <Text>{inviter} has invited you to collaborate on the team.</Text>
      <Button href="https://reloop.sh/invite/abc123">Join the team</Button>
    </Email>
  );
}`,
};

export const EVENTS_CODE = `reloop.webhooks.on('email.opened', async (event) => {
  console.log(event.to, event.openedAt);
});`;

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
