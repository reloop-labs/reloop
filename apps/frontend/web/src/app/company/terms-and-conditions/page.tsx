const TermsPage = () => {
	const columns = 14; // Adjust number of vertical lines
	const columnGap = (1 / columns) * 300;

	return (
		<div className="mx-auto w-full max-w-4xl pt-12 md:max-w-4xl">
			<div className="relative border border-gray-200 px-6 pt-12 md:p-16 dark:border-gray-800">
				<div className="-top-[2px] absolute left-0">
					<div className="md:-left-[11px] absolute top-[1px] left-[11px] h-[11px] w-[11px] border-gray-400 border-t-[1px] md:top-[1px] md:h-[21px] md:w-[21px]" />
					<div className="-top-[4px] -left-[1px] md:-top-[11px] md:-left-[1px] absolute h-[11px] w-[11px] border-gray-400 border-l-[1px] md:h-[21px] md:w-[21px]" />
				</div>
				<div className="-bottom-[0px] absolute right-0">
					<div className="md:-left-[9px] -top-[0.2px] absolute -md:top-[0.2px] left-[8px] h-[11px] w-[11px] border-gray-400 border-t-[1px] md:h-[21px] md:w-[21px]" />
					<div className="-top-[8px] -left-[0.2px] md:-top-[8px] md:-left-[0.2px] absolute h-[11px] w-[11px] border-gray-400 border-l-[1px] md:h-[21px] md:w-[21px]" />
				</div>
				<div className="absolute inset-0 z-10 flex h-full w-full items-center justify-center">
					{Array.from({ length: columns + 1 }).map((_, idx) => (
						<div
							key={idx}
							className={`border-gray-900 border-l border-dashed opacity-10 dark:border-gray-100 ${idx === 0 ? "h-0" : "h-full"}`}
							style={{ width: `${columnGap}%` }}
						/>
					))}
				</div>
				<div>
					<h1 className="bg-gradient-to-r from-[#1e1d1d] to-[#b8b5b55c] bg-clip-text text-center font-bold text-5xl dark:from-[#ffffff] dark:via-[#d3d1d1] dark:to-[#535353]">
						Terms of Service
					</h1>
					<p className="mt-2 text-center">Last update: August 4th, 2025</p>
				</div>
			</div>

			<div className="border-gray-200 border-r border-b border-l px-6 py-12 md:max-w-6xl dark:border-gray-800">
				<p className="mb-6 text-[20px]">
					Welcome to <span className="font-bold">Reloop</span> ("Company", "we",
					"our", or "us"). By using our platform — a service for transactional
					and marketing email sending — you agree to the following terms and
					conditions. Please read them carefully.
				</p>

				<section className="ml-3 space-y-6">
					<div>
						<h2 className="mb-2 font-semibold text-lg">
							1. Acceptance of Terms
						</h2>
						<p>
							By accessing or using our services, you agree to be bound by these
							Terms of Service. If you do not agree, do not use our platform.
						</p>
					</div>
					<div>
						<h2 className="mb-2 font-semibold text-lg">
							2. Description of Service
						</h2>
						<p>
							We provide APIs and interfaces to send transactional and marketing
							emails. We may modify or discontinue any part of our services at
							any time.
						</p>
					</div>
					<div>
						<h2 className="mb-2 font-semibold text-lg">
							3. User Responsibilities
						</h2>
						<p>
							You agree to use our services lawfully and not to abuse our
							platform, send spam, or violate privacy laws. You are responsible
							for the content you send and must obtain consent from your
							recipients.
						</p>
					</div>

					<div>
						<h2 className="mb-2 font-semibold text-lg">4. Account Security</h2>
						<p>
							You are responsible for maintaining the confidentiality of your
							account and password and for all activities under your account.
						</p>
					</div>

					<div>
						<h2 className="mb-2 font-semibold text-lg">5. Fees and Payments</h2>
						<p>
							Paid plans are billed monthly or annually. All fees are
							non-refundable except as required by law.
						</p>
					</div>

					<div>
						<h2 className="mb-2 font-semibold text-lg">6. Termination</h2>
						<p>
							We may suspend or terminate your access to the service at any time
							if we believe you have violated these terms.
						</p>
					</div>

					<div>
						<h2 className="mb-2 font-semibold text-lg">
							7. Intellectual Property
						</h2>
						<p>
							All content, trademarks, and branding on the platform are the
							property of [Your Company Name]. You retain ownership of your
							data.
						</p>
					</div>

					<div>
						<h2 className="mb-2 font-semibold text-lg">
							8. Limitation of Liability
						</h2>
						<p>
							To the fullest extent permitted by law, we are not liable for any
							indirect, incidental, or consequential damages arising from your
							use of the platform.
						</p>
					</div>

					<div>
						<h2 className="mb-2 font-semibold text-lg">9. Changes to Terms</h2>
						<p>
							We may update these Terms from time to time. Continued use of the
							service after changes constitutes acceptance of the new terms.
						</p>
					</div>

					<div>
						<h2 className="mb-2 font-semibold text-lg">10. Contact</h2>
						<p>
							If you have any questions about these Terms, please contact us at{" "}
							<a
								href="mailto:support@example.com"
								className="text-blue-600 underline"
							>
								support@example.com
							</a>
							.
						</p>
					</div>
				</section>
			</div>
		</div>
	);
};

export default TermsPage;
