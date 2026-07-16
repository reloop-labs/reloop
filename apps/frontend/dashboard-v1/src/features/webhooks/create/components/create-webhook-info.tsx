const HOW_IT_WORKS_STEPS = [
	"An event occurs in your account",
	"We POST a signed JSON payload to your endpoint",
	"Your server responds with HTTP 2xx to acknowledge",
];

const EXAMPLE_PAYLOAD = `{
  "id": "evt_01HX...",
  "type": "order.created",
  "created": 1712345678,
  "data": {
    "order_id": "ord_9fk2",
    "amount": 4900,
    "currency": "usd"
  }
}`;

export function CreateWebhookInfo() {
	return (
		<div className="space-y-5 lg:col-span-5">
			<div className="rounded-xl border border-stroke-soft-100 bg-bg-weak-50/60 px-4 py-5 dark:border-stroke-soft-100/30 dark:bg-bg-weak-50/30">
				<h3 className="mb-3 ml-1 font-semibold text-label-md text-text-strong-950">
					How it works
				</h3>
				<ul className="space-y-2">
					{HOW_IT_WORKS_STEPS.map((step, i) => (
						<li key={i} className="flex items-start gap-2">
							<div className="mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-stroke-soft-100 bg-neutral-alpha-10 px-1.5 font-medium text-[11px] text-text-sub-600 dark:border-stroke-soft-100/40">
								{i + 1}
							</div>
							<p className="font-medium text-paragraph-sm text-text-sub-600">
								{step}
							</p>
						</li>
					))}
				</ul>
			</div>

			<div className="overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/30">
				<div className="border-stroke-soft-100 border-b px-4 py-2.5 dark:border-stroke-soft-100/40">
					<h3 className="font-medium text-label-sm text-text-strong-950">
						Example payload
					</h3>
				</div>
				<pre className="overflow-x-auto bg-bg-weak-50/60 p-4 text-paragraph-xs text-text-sub-600 dark:bg-bg-weak-50/30">
					<code>{EXAMPLE_PAYLOAD}</code>
				</pre>
			</div>
		</div>
	);
}
