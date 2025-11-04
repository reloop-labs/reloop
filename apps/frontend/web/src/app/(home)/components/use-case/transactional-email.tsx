import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

export const TransactionalEmail = () => {
	return (
		<div className="relative flex border-stroke-soft-100 border-b">
			<div className="relative z-10 flex w-full border-stroke-soft-100">
				<div className="w-1/3 border-stroke-soft-100 border-r p-10">
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
				<div className="relative flex-1 border-stroke-soft-100 border-r">
					<div
						className="absolute inset-0 z-0"
						style={{
							backgroundImage:
								"radial-gradient(circle at 1px 1px, var(--stroke-soft-100) 1px, transparent 0)",
							backgroundSize: "10px 10px",
						}}
					/>
					<div className="relative z-10 mx-auto max-w-xl space-y-10 p-16">
						<div className="rounded-2xl border border-verified-base/50 bg-bg-white-0 px-4 py-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="flex h-6 w-6 items-center justify-center rounded-lg border border-stroke-soft-100 bg-verified-base/20">
										<Icon name="key" className="h-3 w-3 text-verified-base" />
									</div>
									<p className="font-semibold text-sm">Password Reset</p>
								</div>
								<p className="rounded-md border border-stroke-soft-100 bg-bg-weak-50 px-2 py-0.5 font-medium text-text-sub-600 text-xs">
									Transactional
								</p>
							</div>
							<div className="mt-3 border-stroke-soft-100 border-t pt-2">
								<p className="font-medium text-sm text-text-sub-600">
									Password reset instructions sent to{" "}
									<span className="font-semibold text-text-strong-950">
										acma@reloop.com
									</span>
									.
								</p>
							</div>
						</div>
						<div className="rounded-2xl border border-success-base/50 bg-bg-white-0 px-4 py-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="flex h-6 w-6 items-center justify-center rounded-lg border border-stroke-soft-100 bg-success-base/20">
										<Icon name="box" className="h-3 w-3 text-success-base" />
									</div>
									<p className="font-semibold text-sm">Order Confirmation</p>
								</div>
								<p className="rounded-md border border-stroke-soft-100 bg-bg-weak-50 px-2 py-0.5 font-medium text-text-sub-600 text-xs">
									Transactional
								</p>
							</div>
							<div className="mt-3 border-stroke-soft-100 border-t pt-2">
								<p className="font-medium text-sm text-text-sub-600">
									Your order #12345 has been confirmed and will ship to{" "}
									<span className="font-semibold text-text-strong-950">
										123 Main St
									</span>
									.
								</p>
							</div>
						</div>
						<div className="rounded-2xl border border-information-base/50 bg-bg-white-0 px-4 py-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="flex h-6 w-6 items-center justify-center rounded-lg border border-stroke-soft-100 bg-information-base/20">
										<Icon
											name="verified"
											className="h-3 w-3 text-information-base"
										/>
									</div>
									<p className="font-semibold text-sm">Account Verification</p>
								</div>
								<p className="rounded-md border border-stroke-soft-100 bg-bg-weak-50 px-2 py-0.5 font-medium text-text-sub-600 text-xs">
									Transactional
								</p>
							</div>
							<div className="mt-3 border-stroke-soft-100 border-t pt-2">
								<p className="font-medium text-sm text-text-sub-600">
									Please verify your account by clicking the link sent to{" "}
									<span className="font-semibold text-text-strong-950">
										acma@reloop.com
									</span>
									.
								</p>
							</div>
						</div>
						<div className="rounded-2xl border border-warning-base/50 bg-bg-white-0 px-4 py-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="flex h-6 w-6 items-center justify-center rounded-lg border border-stroke-soft-100 bg-warning-base/20">
										<Icon
											name="invoice"
											className="h-3 w-3 text-warning-base"
										/>
									</div>
									<p className="font-semibold text-sm">Payment Receipt</p>
								</div>
								<p className="rounded-md border border-stroke-soft-100 bg-bg-weak-50 px-2 py-0.5 font-medium text-text-sub-600 text-xs">
									Transactional
								</p>
							</div>
							<div className="mt-3 border-stroke-soft-100 border-t pt-2">
								<p className="font-medium text-sm text-text-sub-600">
									Payment of{" "}
									<span className="font-semibold text-text-strong-950">
										$99.00
									</span>{" "}
									has been processed for order #12345.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
