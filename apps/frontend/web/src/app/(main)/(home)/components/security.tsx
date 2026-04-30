import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

const securityFeatures = [
	{
		icon: (
			<Icon
				name="shield-check"
				className="h-[42px] w-[42px] text-text-sub-600"
			/>
		),
		label: "SSL",
		description: "End-to-end encryption",
	},
	{
		icon: (
			<Icon
				name="verified"
				className="mt-3 h-[42px] w-[42px] text-text-sub-600"
			/>
		),
		label: "DKIM/SPF/DMARC",
		description: "Email Authentication",
	},
	{
		icon: (
			<Icon
				name="open-source"
				className="h-[42px] w-[42px] text-text-sub-600"
			/>
		),
		label: "OSS",
		description: "Transparent & Auditable",
	},
];

export default function Security() {
	return (
		<div className="border-stroke-soft-100 border-t border-b">
			<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
				<div className="flex items-stretch justify-between">
					{/* Left Section */}
					<div className="space-y-6 py-20 pl-10">
						<h2 className="max-w-2xl font-semibold text-3xl text-text-strong-950">
							Built for scale. Secured by design.{" "}
							<span className="text-text-sub-600 leading-8">
								Open-source platform you control—complete privacy, no vendor
								lock-in.
							</span>
						</h2>
						<div className="flex gap-4">
							<Button.Root variant="neutral" size="small">
								Get Started
							</Button.Root>
							<Button.Root variant="neutral" mode="stroke" size="small">
								View Pricing
							</Button.Root>
						</div>
					</div>

					{/* Right Section - Compliance Badges */}
					<div className="grid w-full max-w-sm grid-cols-3 divide-x divide-stroke-soft-100 self-stretch border-stroke-soft-100 border-l">
						{securityFeatures.map((feature, index) => (
							<div
								key={index}
								className="flex h-full flex-col items-center justify-center gap-4"
							>
								<div className="flex-shrink-0">{feature.icon}</div>
								<div className="flex gap-2">
									<div className="flex size-4 items-center justify-center">
										<svg
											className="size-4 text-text-sub-600"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
												clipRule="evenodd"
											/>
										</svg>
									</div>
									<span className="max-w-16 break-all text-center font-medium text-text-sub-600 text-xs">
										{feature.label}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
