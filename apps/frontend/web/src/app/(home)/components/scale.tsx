export const Scale = () => {
	const stats = [
		{ value: "50K+", label: "Emails sent" },
		{ value: "99.9%", label: "Inbox placement" },
		{ value: "< 900ms", label: "Delivery latency" },
		{ value: "99.9%", label: "Uptime" },
	];

	return (
		<div className="border-stroke-soft-100 border-t">
			<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
				<div className="flex items-center justify-between border-stroke-soft-100 border-b px-10 py-4">
					<span className="text-sm text-text-sub-600">
						[04] BUILT FOR SCALE
					</span>
					<span className="text-sm text-text-sub-600">/ GROWTH + SECURITY</span>
				</div>
				<div className="relative overflow-hidden">
					<div className="flex items-stretch pb-30">
						<div className="flex-1 space-y-8 py-20 pr-20 pl-10">
							<div className="space-y-4">
								<h2 className="max-w-3xl font-semibold text-3xl text-text-strong-950">
									Email infrastructure for the next generation.{" "}
									<span className="text-text-sub-600 leading-8">
										Reloop sends millions of emails with sub-900ms latency and
										99.9% inbox placement.
									</span>
								</h2>
							</div>
							<div className="grid max-w-sm grid-cols-2 gap-8 pt-8">
								{stats.map((stat, index) => (
									<div key={index} className="pr-8">
										<div className="space-y-2">
											<div className="border-stroke-soft-100 border-l-2 pl-4 font-semibold text-3xl text-text-strong-950">
												{stat.value}
											</div>
											<div className="pl-4 font-semibold text-sm text-text-sub-600">
												{stat.label}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
					<div className="-right-10 -left-10 absolute inset-0 bottom-0">
						<svg
							className="h-full w-full"
							viewBox="0 0 1400 900"
							preserveAspectRatio="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<rect width="1400" height="900" fill="none" />
							<line
								x1="0"
								y1="520"
								x2="0"
								y2="900"
								stroke="#292929"
								strokeWidth="1"
								strokeDasharray="8,5"
							/>
							<line
								x1="350"
								y1="200"
								x2="350"
								y2="900"
								stroke="#292929"
								strokeWidth="1"
								strokeDasharray="8,5"
							/>
							<line
								x1="700"
								y1="200"
								x2="700"
								y2="900"
								stroke="#292929"
								strokeWidth="1"
								strokeDasharray="8,5"
							/>
							<line
								x1="1050"
								y1="200"
								x2="1050"
								y2="900"
								stroke="#292929"
								strokeDasharray="8,5"
								strokeWidth="1"
							/>
							<path
								d="M 0 520 Q 350 200, 700 200 Q 1050 200, 1400 0"
								fill="none"
								stroke="#4a90e2"
								strokeWidth="2"
							/>
						</svg>
					</div>
				</div>
			</div>
		</div>
	);
};
