import { Icon } from "@reloop/ui/icon";
import { SdkCodeBlock } from "../../../sdk/components/sdk-code-block";

const SEND_CODE = `curl -X POST https://reloop.sh/api/mail/v1/send \\
  -H "x-api-key: $RELOOP_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "Acme <hello@acme.com>",
    "to": "jordan@example.com",
    "subject": "Your order is confirmed",
    "template": {
      "id": "tmpl_k3x9q2v7m1wz",
      "variables": {
        "first_name": "Jordan",
        "order_id": "28391",
        "total": "$124.00"
      }
    }
  }'`;

const STEPS: { icon: string; title: string; description: string }[] = [
	{
		icon: "variable",
		title: "Add variables",
		description:
			"Drop {{{first_name}}} into any block. Give each variable a default so nothing ever sends blank.",
	},
	{
		icon: "check-circle",
		title: "Publish a version",
		description:
			"Only the published version sends. Keep editing the draft without touching live email.",
	},
	{
		icon: "mail-send",
		title: "Send by ID",
		description:
			"Pass the template ID and your values in the send call. Values you pass override the defaults.",
	},
];

export function SendSection() {
	return (
		<section
			id="send-by-id"
			aria-labelledby="send-heading"
			className="w-full bg-bg-white-0 dark:bg-black"
		>
			<div className="border-stroke-soft-100 border-b px-4 py-16 text-left sm:px-8 sm:py-20 sm:text-center lg:px-12 dark:border-white/10">
				<span className="inline-flex items-center gap-1.5 font-medium text-[13px] text-text-sub-600 dark:text-white/60">
					<Icon name="code" className="size-3.5" aria-hidden />
					Developer first
				</span>
				<h2
					id="send-heading"
					className="mt-3 text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.1] tracking-tight sm:text-[2.6rem] dark:text-white"
				>
					Design in the dashboard,
					<br />
					send from your code
				</h2>
				<p className="mt-3 max-w-2xl text-balance text-[15px] text-text-sub-600 leading-relaxed sm:mx-auto sm:text-base dark:text-white/60">
					Your app sends a template ID and a few values. Your team owns the
					design and copy, and ships changes without waiting on a release.
				</p>
			</div>

			<div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
				<ol className="flex flex-col border-stroke-soft-100 border-b lg:border-r lg:border-b-0 dark:border-white/10">
					{STEPS.map((step, index) => (
						<li
							key={step.title}
							className="flex items-start gap-4 border-stroke-soft-100 border-b px-4 py-7 last:border-b-0 sm:px-8 sm:py-8 lg:px-10 dark:border-white/10"
						>
							<span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950 shadow-xs dark:border-white/10 dark:bg-white/[0.06] dark:text-white">
								<Icon name={step.icon} className="size-5" aria-hidden />
							</span>
							<div className="flex min-w-0 flex-col gap-1">
								<h3 className="font-semibold text-[16px] text-text-strong-950 sm:text-[17px] dark:text-white">
									<span className="mr-2 font-mono text-[13px] text-text-soft-400 dark:text-white/35">
										0{index + 1}
									</span>
									{step.title}
								</h3>
								<p className="text-[14px] text-text-sub-600 leading-relaxed dark:text-white/55">
									{step.description}
								</p>
							</div>
						</li>
					))}
				</ol>

				<div className="min-w-0 bg-bg-weak-50 px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10 dark:bg-white/[0.02]">
					<SdkCodeBlock code={SEND_CODE} lang="bash" path="send.sh" />
				</div>
			</div>
		</section>
	);
}
