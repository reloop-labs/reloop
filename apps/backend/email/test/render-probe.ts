import { render } from "@reloop/email/render";
import React from "react";

const props: Record<string, Record<string, unknown>> = {
	invite: { teamName: "Contoso", inviterName: "Dana" },
	"org-joined": { orgName: "Contoso", inviterName: "Dana" },
};

const templates = [
	"otp",
	"welcome",
	"invite",
	"org-joined",
	"signin-detected",
	"api-key-created",
	"domain-verified",
	"dns-config",
	"export-ready",
	"payment-failed",
	"quota-warning",
	"trial-ending",
	"onboarding-test",
];

const out: Record<
	string,
	{ brand: number; reloop: number; selfHosted: string }
> = {};
const brand = process.env.APP_NAME?.trim() || "Reloop";
const escaped = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

for (const name of templates) {
	const mod = await import(`@reloop/email/emails/${name}`);
	const html = await render(
		React.createElement(mod.default, props[name] ?? {}),
	);
	const text = html.replace(/https?:\/\/[^"'\s<>]+/g, "");
	const flat = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
	out[name] = {
		brand: (text.match(new RegExp(escaped, "g")) ?? []).length,
		reloop: (text.match(/Reloop/g) ?? []).length,
		selfHosted: (flat.match(/Self-hosted .*?(?= Copyright)/) ?? [""])[0].trim(),
	};
}

console.log(JSON.stringify(out));
process.exit(0);
