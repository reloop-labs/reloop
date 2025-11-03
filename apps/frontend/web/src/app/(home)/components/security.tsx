import * as Button from "@reloop/ui/button";
import Link from "next/link";

const securityFeatures = [
	{
		icon: (
			<svg
				className="size-12 text-text-sub-600"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
					d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
				/>
			</svg>
		),
		label: "SPF/DKIM",
		description: "Email Authentication",
	},
	{
		icon: (
			<svg
				className="size-12 text-text-sub-600"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
					d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
				/>
			</svg>
		),
		label: "GDPR",
		description: "Data Privacy",
	},
	{
		icon: (
			<svg
				className="size-12 text-text-sub-600"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
					d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
				/>
			</svg>
		),
		label: "SOC 2",
		description: "Security Compliance",
	},
];

export default function Security() {
	return (
		<div className="border-stroke-soft-100 border-t border-b">
			<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l py-8">
				<div className="border-stroke-soft-100 border-t border-b py-20">
					<div className="mx-auto max-w-6xl">
						<div className="grid gap-12 md:grid-cols-2 md:items-center">
							{/* Left Section */}
							<div className="space-y-6">
								<h2 className="title-h2 font-semibold text-text-strong-950">
									Scale with security.
								</h2>
								<p className="text-lg text-text-sub-600 leading-8">
									Reloop is audited and certified by industry-leading third
									party standards for email security and compliance.
								</p>
								<Link
									href="/contact"
									className={Button.buttonVariants({
										variant: "neutral",
										mode: "stroke",
									}).root({})}
								>
									Talk to sales
								</Link>
							</div>

							{/* Right Section - Compliance Badges */}
							<div className="flex flex-col gap-8">
								{securityFeatures.map((feature, index) => (
									<div key={index} className="flex items-center gap-4">
										<div className="flex-shrink-0">{feature.icon}</div>
										<div className="flex items-center gap-2">
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
											<span className="font-medium text-sm text-text-sub-600">
												{feature.label}
											</span>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
