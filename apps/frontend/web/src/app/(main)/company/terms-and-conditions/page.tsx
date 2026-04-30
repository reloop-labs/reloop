import PageLayout from "@reloop/web/components/page-layout";

const TermsPage = () => {
	return (
		<PageLayout
			title="Terms of Service"
			subtitle="Last update: August 4th, 2025"
		>
			<div>
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
		</PageLayout>
	);
};

export default TermsPage;
