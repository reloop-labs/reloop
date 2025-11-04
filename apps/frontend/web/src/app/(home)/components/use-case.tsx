import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

export default function UseCase() {
	return (
		<div className="border-stroke-soft-100 border-t">
			<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
				<div className="flex items-center justify-between border-stroke-soft-100 border-b px-10 py-4">
					<span className="text-sm text-text-sub-600">[03] USE CASES</span>
					<span className="text-sm text-text-sub-600">/ EMAIL SENDING</span>
				</div>
				<div className="grid grid-cols-2">
					<TransactionalEmail />
				</div>
			</div>
		</div>
	);
}

const TransactionalEmail = () => {
	return (
		<div>
			<div className="border-stroke-soft-100 border-r p-10">
				<div className="flex items-center gap-2">
					<Icon
						name="arrow-swap"
						className="h-3.5 w-3.5 stroke-1 text-text-sub-600"
					/>
					<p className="font-semibold text-text-sub-600 text-xs">
						Transactional
					</p>
				</div>
				<div className="flex-1 pt-3">
					<h2 className="mb-2 font-semibold text-3xl">Transactional Email</h2>
					<p className="text-text-sub-600 tracking-wide">
						Provide essential, real-time user updates.
					</p>

					<ul className="mt-4 mb-6 ml-4 list-inside list-disc text-sm text-text-sub-600 tracking-wide">
						<li>Password reset</li>
						<li>Order confirmation</li>
						<li>Account verification</li>
						<li>Payment receipts</li>
					</ul>
					<Button.Root variant="neutral" mode="lighter" size="small">
						View Docs
						<Icon
							name="chevron-right"
							className="h-3.5 w-3.5 stroke-1 text-text-sub-600"
						/>
					</Button.Root>
				</div>
			</div>
		</div>
	);
};
