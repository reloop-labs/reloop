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
	{ id: "otp", label: "otp.tsx", si: getLanguageIcon("react")! },
	{ id: "reset", label: "password-reset.tsx", si: getLanguageIcon("react")! },
	{ id: "welcome", label: "welcome-email.tsx", si: getLanguageIcon("react")! },
	{ id: "invite", label: "user-invite.tsx", si: getLanguageIcon("react")! },
];

export type TemplateTabId = "otp" | "reset" | "welcome" | "invite";

export const TEMPLATES_CODE: Record<TemplateTabId, string> = {
	otp: `import {
  Body,
  Button,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "react-email";

export const OTPTokenEmail = ({
  otp = "842190",
  baseUrl = "https://reloop.sh",
}) => (
  <Html>
    <Head />
    <Preview>Your login code for Reloop is {otp}</Preview>
    <Tailwind>
      <Body className="bg-white text-[#0e0e0e] font-sans">
        <Text className="font-mono text-[#707070] text-xs uppercase tracking-widest">
          Login Verification
        </Text>
        <Heading className="font-serif text-3xl text-[#0e0e0e]">
          Your login code for Reloop.
        </Heading>
        <Hr className="my-8 border-[#e0e0e0]" />
        <Text className="text-[#555] text-sm leading-relaxed">
          This link and code will only be valid for the next 10 minutes.
        </Text>
        <Section className="my-8 rounded-2xl border border-[#e0e0e0] py-8 text-center">
          <Text className="font-mono text-4xl text-[#0e0e0e] tracking-widest">{otp}</Text>
        </Section>
        <Button
          className="rounded-xl bg-[#0e0e0e] px-6 py-3 font-bold text-white uppercase"
          href={\`\${baseUrl}/dashboard/verify?otp=\${otp}\`}
        >
          Login to Reloop
        </Button>
      </Body>
    </Tailwind>
  </Html>
);`,
	reset: `import {
  Body,
  Button,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "react-email";

export const ResetPasswordEmail = ({
  resetUrl = "https://reloop.sh/reset?token=xyz",
}) => (
  <Html>
    <Head />
    <Preview>Reset your Reloop account password</Preview>
    <Tailwind>
      <Body className="bg-white text-[#0e0e0e] font-sans">
        <Text className="font-mono text-[#707070] text-xs uppercase tracking-widest">
          Password Reset
        </Text>
        <Heading className="font-serif text-3xl text-[#0e0e0e]">
          Reset your Reloop password.
        </Heading>
        <Hr className="my-8 border-[#e0e0e0]" />
        <Text className="text-[#555] text-sm leading-relaxed">
          We received a request to reset your password. This link expires in 20 minutes.
        </Text>
        <Section className="mt-8">
          <Button
            className="rounded-xl bg-[#0e0e0e] px-6 py-3 font-bold text-white uppercase"
            href={resetUrl}
          >
            Choose a new password
          </Button>
        </Section>
      </Body>
    </Tailwind>
  </Html>
);`,
	welcome: `import {
  Body,
  Button,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "react-email";

export const WelcomeEmail = ({
  fullName = "Maya",
  baseUrl = "https://reloop.sh",
}) => (
  <Html>
    <Head />
    <Preview>Open-source email infrastructure. Deliverability is on us.</Preview>
    <Tailwind>
      <Body className="bg-white text-[#0e0e0e] font-sans">
        <Text className="font-mono text-[#707070] text-xs uppercase tracking-widest">
          Welcome to Reloop
        </Text>
        <Heading className="font-serif text-3xl text-[#0e0e0e]">
          Open-source email infrastructure built for developers.
        </Heading>
        <Hr className="my-8 border-[#e0e0e0]" />
        <Text className="text-[#555] text-sm leading-relaxed">
          Hey {fullName}, welcome! Really glad you're here.
        </Text>
        <Section className="mt-8">
          <Button
            className="rounded-xl bg-[#0e0e0e] px-6 py-3 font-bold text-white uppercase"
            href={\`\${baseUrl}/dashboard\`}
          >
            Get Started
          </Button>
        </Section>
      </Body>
    </Tailwind>
  </Html>
);`,
	invite: `import {
  Body,
  Button,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "react-email";

export const InviteEmail = ({
  inviterName = "Pranav Patel",
  inviterEmail = "reloop.sh@gmail.com",
  teamName = "Reloop",
  inviteUrl = "https://reloop.sh/invite/abc123",
}) => (
  <Html>
    <Head />
    <Preview>Join {teamName} on Reloop</Preview>
    <Tailwind>
      <Body className="bg-white text-[#0e0e0e] font-sans">
        <Text className="font-mono text-[#707070] text-xs uppercase tracking-widest">
          Team Invitation
        </Text>
        <Heading className="font-serif text-3xl text-[#0e0e0e]">
          Join <span className="font-bold">{teamName}</span> on Reloop.
        </Heading>
        <Hr className="my-8 border-[#e0e0e0]" />
        <Text className="text-[#555] text-sm leading-relaxed">
          <strong>{inviterName}</strong> ({inviterEmail}) has invited you to the team.
        </Text>
        <Section className="mt-8">
          <Button
            className="rounded-xl bg-[#0e0e0e] px-6 py-3 font-bold text-white uppercase"
            href={inviteUrl}
          >
            Join the team
          </Button>
        </Section>
      </Body>
    </Tailwind>
  </Html>
);`,
};

export const WEBHOOK_TABS: CopyCodeBlockTab[] = [
	{ id: "nextjs", label: "route.ts", si: getLanguageIcon("typescript")! },
	{ id: "express", label: "express.ts", si: getLanguageIcon("typescript")! },
	{ id: "python", label: "fastapi.py", si: getLanguageIcon("python")! },
	{ id: "types", label: "events.ts", si: getLanguageIcon("typescript")! },
];

export type WebhookTabId = "nextjs" | "express" | "python" | "types";

export const WEBHOOK_CODE: Record<WebhookTabId, string> = {
	nextjs: `import { Webhook } from 'svix';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const payload = await req.text();
  const headerList = await headers();
  const wh = new Webhook(process.env.RELOOP_WEBHOOK_SECRET!);

  const evt = wh.verify(payload, {
    'svix-id': headerList.get('svix-id')!,
    'svix-timestamp': headerList.get('svix-timestamp')!,
    'svix-signature': headerList.get('svix-signature')!,
  }) as { type: string; data: Record<string, any> };

  switch (evt.type) {
    case 'email.delivered':
      console.log('Delivered to:', evt.data.to);
      break;
    case 'email.opened':
      console.log('Opened at:', evt.data.openedAt);
      break;
    case 'email.bounced':
      console.error('Bounced:', evt.data.reason);
      break;
  }

  return new Response('ok', { status: 200 });
}`,
	express: `import express from 'express';
import { Webhook } from 'svix';

const app = express();

app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const wh = new Webhook(process.env.RELOOP_WEBHOOK_SECRET!);
  const evt = wh.verify(req.body.toString(), req.headers as any) as any;

  if (evt.type === 'email.delivered') {
    console.log('Email delivered to', evt.data.to);
  } else if (evt.type === 'email.opened') {
    console.log('Email opened by', evt.data.to);
  }

  res.status(200).json({ received: true });
});`,
	python: `import os
from fastapi import FastAPI, Request, HTTPException
from svix.webhooks import Webhook

app = FastAPI()

@app.post("/api/webhook")
async def handle_webhook(request: Request):
    payload = await request.body()
    headers = dict(request.headers)
    wh = Webhook(os.environ["RELOOP_WEBHOOK_SECRET"])

    try:
        event = wh.verify(payload, headers)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "email.delivered":
        print(f"Delivered to {event['data']['to']}")
    return {"status": "ok"}`,
	types: `export type ReloopWebhookEvent =
  | {
      type: 'email.delivered';
      data: { id: string; to: string[]; deliveredAt: string };
    }
  | {
      type: 'email.opened';
      data: { id: string; to: string; openedAt: string; userAgent: string };
    }
  | {
      type: 'email.clicked';
      data: { id: string; to: string; link: string; clickedAt: string };
    }
  | {
      type: 'email.bounced';
      data: { id: string; to: string[]; reason: string; bouncedAt: string };
    };`,
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
