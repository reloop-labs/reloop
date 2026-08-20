"use client";

import { SdkCodeBlock } from "@reloop/web/app/sdk/components/sdk-code-block";
import { getLanguageIcon } from "@reloop/web/components/mdx/language-icons";
import { useState } from "react";

const SEND_TABS = [
	{ id: "nodejs", label: "Node.js", si: getLanguageIcon("typescript")! },
	{ id: "python", label: "Python", si: getLanguageIcon("python")! },
] as const;

const SEND_CODE = {
	nodejs: `import Reloop from 'reloop-email';

const reloop = new Reloop(process.env.RELOOP_API_KEY);

const { data, error } = await reloop.emails.send({
  from: 'Acme <onboarding@yourdomain.com>',
  to: ['maya@northwind.io'],
  subject: 'Welcome to Acme',
  html: '<strong>Your workspace is ready.</strong>',
});`,
	python: `import os
from reloop_email import Reloop

reloop = Reloop(api_key=os.environ["RELOOP_API_KEY"])

result = reloop.mail.send({
    "from": "Acme <onboarding@yourdomain.com>",
    "to": ["maya@northwind.io"],
    "subject": "Welcome to Acme",
    "html": "<strong>Your workspace is ready.</strong>",
})`,
} as const;

export function SendCode() {
	const [lang, setLang] = useState<(typeof SEND_TABS)[number]["id"]>("nodejs");

	return (
		<SdkCodeBlock
			slug={lang}
			code={SEND_CODE[lang]}
			tabs={[...SEND_TABS]}
			activeTab={lang}
			onTabChange={(id) => setLang(id as typeof lang)}
			path={lang === "nodejs" ? "send.ts" : "send.py"}
		/>
	);
}
