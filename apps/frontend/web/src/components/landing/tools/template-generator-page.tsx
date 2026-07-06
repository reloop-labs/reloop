"use client";

import * as Button from "@reloop/ui/button";
import {
	ToolTopBar,
	ToolUpsell,
} from "@reloop/web/components/landing/tools/tool-chrome";
import { useMemo, useState } from "react";

const TEMPLATES = {
	newsletter: {
		label: "Newsletter",
		html: `<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
  <tr><td style="padding:32px 24px;background:#111;color:#fff;">
    <h1 style="margin:0;font-size:24px;">Weekly Update</h1>
  </td></tr>
  <tr><td style="padding:24px;color:#333;line-height:1.6;">
    <p>Hi {{first_name}},</p>
    <p>Here's what shipped this week…</p>
    <a href="#" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:8px;">Read more</a>
  </td></tr>
</table>`,
	},
	transactional: {
		label: "Receipt",
		html: `<table width="100%" style="max-width:560px;margin:0 auto;font-family:system-ui,sans-serif;">
  <tr><td style="padding:24px;">
    <h2 style="margin:0 0 8px;">Order confirmed</h2>
    <p style="color:#666;margin:0 0 16px;">Order #{{order_id}}</p>
    <table width="100%" style="border-top:1px solid #eee;padding-top:16px;">
      <tr><td>Item</td><td align="right">$49.00</td></tr>
    </table>
  </td></tr>
</table>`,
	},
	welcome: {
		label: "Welcome",
		html: `<table width="100%" style="max-width:560px;margin:0 auto;font-family:Georgia,serif;">
  <tr><td style="padding:40px 24px;text-align:center;">
    <h1 style="font-size:28px;margin:0 0 12px;">Welcome aboard</h1>
    <p style="color:#555;line-height:1.6;">We're glad you're here. Get started in minutes.</p>
  </td></tr>
</table>`,
	},
} as const;

type TemplateKey = keyof typeof TEMPLATES;

export function TemplateGeneratorPageView() {
	const [active, setActive] = useState<TemplateKey>("newsletter");
	const [copied, setCopied] = useState(false);
	const html = useMemo(() => TEMPLATES[active].html, [active]);

	async function copyHtml() {
		await navigator.clipboard.writeText(html);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="min-h-screen bg-[#fafafa] dark:bg-black">
			<ToolTopBar
				accent="violet"
				breadcrumb={[
					{ label: "Tools", href: "/tools" },
					{ label: "Template Generator", href: "/tools/template-generator" },
				]}
				title="HTML Email Template Generator"
				subtitle="Pick a starter layout and copy HTML—similar to Stripo and Beefree starter templates."
			/>

			<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
				<div className="mb-4 flex flex-wrap gap-2">
					{(Object.keys(TEMPLATES) as TemplateKey[]).map((key) => (
						<button
							key={key}
							type="button"
							onClick={() => setActive(key)}
							className={`rounded-lg px-4 py-2 font-medium text-[14px] transition-colors ${
								active === key
									? "bg-violet-600 text-white"
									: "bg-white text-text-sub-600 ring-1 ring-stroke-soft-200 dark:bg-[#111] dark:text-white/60 dark:ring-white/10"
							}`}
						>
							{TEMPLATES[key].label}
						</button>
					))}
					<button
						type="button"
						onClick={copyHtml}
						className={`${Button.buttonVariants({ mode: "stroke", variant: "neutral" }).root()} ml-auto rounded-lg`}
					>
						{copied ? "Copied!" : "Copy HTML"}
					</button>
				</div>

				<div className="grid gap-6 lg:grid-cols-2">
					<div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-white dark:border-white/10 dark:bg-[#111]">
						<div className="border-stroke-soft-200 border-b bg-bg-weak-50 px-4 py-2 font-mono text-[12px] text-text-sub-600 dark:border-white/10 dark:bg-black dark:text-white/40">
							HTML source
						</div>
						<pre className="max-h-[480px] overflow-auto p-4 font-mono text-[11px] text-text-sub-600 leading-relaxed dark:text-white/60">
							{html}
						</pre>
					</div>
					<div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-white dark:border-white/10">
						<div className="border-stroke-soft-200 border-b bg-bg-weak-50 px-4 py-2 text-[12px] text-text-sub-600 dark:border-white/10 dark:bg-black dark:text-white/40">
							Preview
						</div>
						<div
							className="min-h-[480px] bg-[#eef0f2] p-6"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: email template preview
							dangerouslySetInnerHTML={{ __html: html }}
						/>
					</div>
				</div>
			</div>

			<ToolUpsell
				title="Design templates in Reloop"
				description="Use the visual editor and campaign builder for drag-and-drop email design."
				primaryHref="/features/email-templates"
				primaryLabel="Email templates"
				secondaryHref="/dashboard/signup"
				secondaryLabel="Start free"
			/>
		</div>
	);
}
