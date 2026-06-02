"use client";

import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

type TemplatePreset = "newsletter" | "transactional" | "marketing";

const presets: Record<
	TemplatePreset,
	{ label: string; html: string; variables: string }
> = {
	newsletter: {
		label: "Weekly Newsletter",
		html: `<h1>{{ headline }}</h1>
<p>Hi {{ user.firstName }},</p>
<p>{{ body }}</p>
<a href="{{ cta.url }}">{{ cta.label }}</a>`,
		variables: `{
  "headline": "This week at Acme",
  "user": { "firstName": "Alex" },
  "body": "Product updates and tips inside.",
  "cta": { "url": "https://acme.co/read", "label": "Read more" }
}`,
	},
	transactional: {
		label: "Order Confirmation",
		html: `<h1>Order confirmed</h1>
<p>Hi {{ user.firstName }},</p>
<p>Order #{{ order.id }} is on its way.</p>
<p>Total: {{ order.total }}</p>`,
		variables: `{
  "user": { "firstName": "Jordan" },
  "order": { "id": "28391", "total": "$124.00" }
}`,
	},
	marketing: {
		label: "Product Launch",
		html: `<h1>{{ product.name }} is live</h1>
<p>{{ product.tagline }}</p>
<a href="{{ product.url }}">Shop now</a>`,
		variables: `{
  "product": {
    "name": "Reloop Pro",
    "tagline": "Email infrastructure without lock-in.",
    "url": "https://reloop.dev"
  }
}`,
	},
};

export default function Sandbox() {
	const [preset, setPreset] = useState<TemplatePreset>("newsletter");
	const active = presets[preset];

	return (
		<section id="editor" className="scroll-mt-10">
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
				<div className="mx-auto mb-16 max-w-3xl text-center">
					<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
						Variables meet design
					</h2>
					<p className="mx-auto mt-6 max-w-[620px] text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/50">
						Select a preset, edit the template markup, and pass JSON variables at send time.
					</p>
				</div>

				<div className="rounded-4xl border border-stroke-soft-200 bg-bg-weak-50 p-6 md:p-8 dark:border-white/10">
					<div className="flex flex-wrap gap-2 border-stroke-soft-200 border-b pb-4 dark:border-white/10">
						{(Object.keys(presets) as TemplatePreset[]).map((key) => (
							<button
								key={key}
								type="button"
								onClick={() => setPreset(key)}
								className={`rounded-lg px-3 py-1.5 font-semibold text-xs transition-all ${
									preset === key
										? "bg-bg-white-0 text-text-strong-950 shadow-sm dark:bg-white dark:text-black"
										: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white"
								}`}
							>
								{presets[key].label}
							</button>
						))}
					</div>

					<div className="mt-6 grid gap-6 lg:grid-cols-2">
						<div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-[#0a0a0a] font-mono text-[13px] dark:border-white/10">
							<div className="border-white/5 border-b px-4 py-2 text-white/40 text-xs">
								template.html
							</div>
							<pre className="max-h-[280px] overflow-auto p-4 text-white/80 leading-relaxed">
								{active.html}
							</pre>
						</div>
						<div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-[#0a0a0a] font-mono text-[13px] dark:border-white/10">
							<div className="border-white/5 border-b px-4 py-2 text-white/40 text-xs">
								variables.json
							</div>
							<pre className="max-h-[280px] overflow-auto p-4 text-primary-base leading-relaxed">
								{active.variables}
							</pre>
						</div>
					</div>

					<div className="mt-6 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 dark:border-white/10">
						<div className="mb-3 flex items-center gap-2 font-mono text-text-soft-400 text-xs">
							<Icon name="eye-outline" className="size-3.5" />
							<span>Rendered preview (simulated)</span>
						</div>
						<div className="prose prose-sm max-w-none text-text-strong-950 dark:text-white">
							<p className="font-semibold text-lg">
								{preset === "newsletter" && "This week at Acme"}
								{preset === "transactional" && "Order confirmed"}
								{preset === "marketing" && "Reloop Pro is live"}
							</p>
							<p className="text-text-sub-600 dark:text-white/60">
								{preset === "newsletter" &&
									"Hi Alex, Product updates and tips inside."}
								{preset === "transactional" &&
									"Hi Jordan, Order #28391 is on its way. Total: $124.00"}
								{preset === "marketing" &&
									"Email infrastructure without lock-in."}
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
