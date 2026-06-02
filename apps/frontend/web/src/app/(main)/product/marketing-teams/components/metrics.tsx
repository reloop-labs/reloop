"use client";

export default function Metrics() {
	return (
		<section className="border-[#0a0d12]/5 border-t bg-white py-24 sm:py-32">
			<div className="mx-auto max-w-4xl text-center">
				<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
					Drive Engagement and Growth
				</h2>
				<p className="mx-auto mt-6 max-w-xl text-[#0a0d12]/50 text-base">
					Achieve high delivery rates and conversion scores across all global ISP routes.
				</p>

				<div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
					<div className="text-center">
						<div className="mb-4 font-bold text-4xl text-teal-600">
							99.8%
						</div>
						<div className="font-medium text-gray-900">
							Inbox Placement
						</div>
						<div className="text-sm text-text-sub-600">
							Consistently avoid the spam folder
						</div>
					</div>
					<div className="text-center">
						<div className="mb-4 font-bold text-4xl text-blue-600">
							3x
						</div>
						<div className="font-medium text-gray-900">
							Faster Drafts
						</div>
						<div className="text-sm text-text-sub-600">
							Using AI template suggestions
						</div>
					</div>
					<div className="text-center">
						<div className="mb-4 font-bold text-4xl text-purple-600">
							&lt;0.05%
						</div>
						<div className="font-medium text-gray-900">
							Bounce Score
						</div>
						<div className="text-sm text-text-sub-600">
							Aggressive automated list sanitation
						</div>
					</div>
					<div className="text-center">
						<div className="mb-4 font-bold text-4xl text-emerald-600">
							24/7
						</div>
						<div className="font-medium text-gray-900">
							Live Insights
						</div>
						<div className="text-sm text-text-sub-600">
							Track real-time click and conversion metrics
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
