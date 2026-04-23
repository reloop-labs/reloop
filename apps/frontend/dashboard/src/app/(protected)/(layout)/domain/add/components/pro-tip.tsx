import { Icon } from "@reloop/ui/icon";

export const ProTip = () => {
	return (
		<div className="max-w-[720px] rounded-xl bg-bg-weak-50/60 px-4 py-2">
			<div className="flex items-center gap-3">
				<div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-bg-white-0 text-text-soft-400 shadow-regular-xs">
					<Icon name="bulb" className="h-3.5 w-3.5" />
				</div>
				<p className="font-medium text-[11px] text-text-soft-400 uppercase tracking-[0.18em]">
					Pro Tip
				</p>
			</div>
			<p className="pt-2 text-sm text-text-sub-600">
				Use separate domain for domain reputation
			</p>
			<div className="pt-3 text-sm text-text-sub-600">
				<p>Subdomain example:</p>
				<ul className="list-disc pl-5">
					<li>marketing.example.com</li>
					<li>send.example.com</li>
					<li>transection.example.com</li>
				</ul>
			</div>
		</div>
	);
};
