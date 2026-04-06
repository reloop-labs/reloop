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
			<div className="rounded-xl border border-stroke-soft-100 bg-bg-weak-50/60 p-5 dark:border-stroke-soft-100/40">
				<h3 className="mb-4 font-medium text-label-md text-text-strong-950">
					How it works
				</h3>
				<ul className="space-y-4">
					{HOW_IT_WORKS_STEPS.map((step, i) => (
						<li key={i} className="flex items-start gap-3">
							<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bg-white-0 font-medium text-[11px] text-text-sub-600 shadow-regular-xs">
								{i + 1}
							</div>
							<p className="pt-0.5 text-paragraph-sm text-text-sub-600">
								{step}
							</p>
						</li>
					))}
				</ul>
			</div>

			<div className="overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
				<div className="border-stroke-soft-100 border-b px-4 py-2.5 dark:border-stroke-soft-100/40">
					<h3 className="font-medium text-label-sm text-text-strong-950">
						Example payload
					</h3>
				</div>
				<pre className="overflow-x-auto bg-bg-weak-50/60 p-4 text-paragraph-xs text-text-sub-600">
					<code>{EXAMPLE_PAYLOAD}</code>
				</pre>
			</div>
		</div>
	);
}
