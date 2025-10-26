import PageLayout from "@reloop/web/components/page-layout";

const PrivacyPage = () => {
	return (
		<PageLayout title="Privacy Policy" subtitle="Last update: August 4th, 2025">
			<div>
				<p className="mb-6 text-[20px]">
					Welcome to <span className="font-bold">Reloop</span> ("Company", "we",
					"our", or "us"). By using our platform — a service for transactional
					and marketing email sending — you agree to the following terms and
					conditions. Please read them carefully.
				</p>

				<section className="ml-3 space-y-8">
					<div>
						<h2 className="mb-2 font-semibold text-lg">
							1. Who We Are & Scope
						</h2>
						<p>
							For most data collected on our websites and for account
							administration, Reloop acts as a
							<span className="font-semibold"> data controller</span>. When
							customers upload or send email content and contact data through
							the Service, Reloop generally acts as a{" "}
							<span className="font-semibold">data processor</span> on behalf of
							the customer (who is the data controller). This Policy applies to
							information we collect through the Service and does not cover
							third-party sites linked from our Service.
						</p>
					</div>
					<div>
						<h2 className="mb-2 font-semibold text-lg">
							2. Information We Collect
						</h2>
						<ul className="list-disc space-y-2 pl-6">
							<li>
								<span className="font-semibold">
									Account & Contact Information
								</span>
								: name, company, role, email address, password (hashed),
								preferences, and billing contact details you provide when
								creating or managing an account.
							</li>
							<li>
								<span className="font-semibold">Service & Usage Data</span>: IP
								address, device and browser type, pages viewed, referring URLs,
								timestamps, product interactions, and diagnostics. When you log
								in from multiple devices we may associate sessions to secure
								your account.
							</li>
							<li>
								<span className="font-semibold">Email Content & Metadata</span>:
								content and metadata of emails you create, send, receive or
								store via the Service (including recipients, subject lines,
								headers, engagement events like opens and clicks). To prevent
								abuse (e.g., spam, phishing, malware links) we may automatically
								scan email content and, where flagged by automated systems,
								perform limited manual review strictly to ensure compliance with
								our policies and safety standards.
							</li>
							<li>
								<span className="font-semibold">Support & Communications</span>:
								messages you send to support, feedback, survey responses, and
								other communications.
							</li>
							<li>
								<span className="font-semibold">
									Cookies & Similar Technologies
								</span>
								: small files and tracking technologies used to operate the
								site, remember preferences, secure sessions, and understand
								product usage. You can control cookies via your browser
								settings; some features may not function without essential
								cookies.
							</li>
							<li>
								<span className="font-semibold">Payments</span>: if you purchase
								a paid plan, we use third-party payment processors (e.g.,
								Stripe) to process payments. We do not store full payment card
								numbers; processors handle them under their own privacy policies
								and PCI-DSS requirements.
							</li>
						</ul>
					</div>
					<div>
						<h2 className="mb-2 font-semibold text-lg">
							3. How We Use Information
						</h2>
						<ul className="list-disc space-y-2 pl-6">
							<li>
								Provide, operate, secure, troubleshoot, and improve the Service.
							</li>
							<li>
								Authenticate you, manage accounts, and provide customer support.
							</li>
							<li>
								Monitor performance, detect/prevent abuse, fraud, and security
								incidents.
							</li>
							<li>
								Send transactional communications (e.g., account, security,
								billing) and, with your consent where required, marketing
								communications you can opt out of at any time.
							</li>
							<li>Comply with legal obligations and enforce our terms.</li>
							<li>
								Analyze aggregated or de-identified data to develop features and
								insights.
							</li>
						</ul>
					</div>

					<div>
						<h2 className="mb-2 font-semibold text-lg">
							4. Sharing & Disclosures
						</h2>
						<p>
							We do not sell personal information. We may share information with
							trusted <span className="font-semibold">service providers</span>{" "}
							(subprocessors) who help us operate the Service (e.g., cloud
							hosting, email delivery, analytics, customer support, and payment
							processing). These providers access information only to perform
							services for us and are bound by confidentiality obligations. We
							may also disclose information (i) to comply with law or valid
							legal process; (ii) in connection with a merger, acquisition, or
							asset sale; (iii) to protect Reloop, our customers, and the public
							from harm; and (iv) with your consent or at your direction.
						</p>
					</div>
					<div>
						<p>
							We implement technical and organizational measures designed to
							protect personal data. However, no method of transmission over the
							Internet or electronic storage is completely secure, and we cannot
							guarantee absolute security.
						</p>
					</div>
					<div>
						<h2 className="mb-2 font-semibold text-lg">
							5. Your Privacy Choices & Rights
						</h2>
						<ul className="list-disc space-y-2 pl-6">
							<li>
								<span className="font-semibold">
									Access, correction, deletion
								</span>{" "}
								(where applicable): you may request access to, rectification of,
								or deletion of your personal data. We may ask you to verify your
								identity before fulfilling requests.
							</li>
							<li>
								<span className="font-semibold">Opt out of marketing</span>:
								follow unsubscribe links in emails or adjust preferences in your
								account. Transactional emails will still be sent.
							</li>
						</ul>
					</div>
					<div>
						<h2 className="mb-2 font-semibold text-lg">
							6. Cookies & Tracking
						</h2>
						<p>
							We use essential, performance/analytics, and preference cookies to
							operate and improve the Service. You can control cookies through
							your browser or device settings. Disabling certain cookies may
							impact functionality.
						</p>
					</div>

					<div>
						<h2 className="mb-2 font-semibold text-lg">
							7. Changes to This Policy
						</h2>
						<p>
							We may update this Policy from time to time. We will post the
							updated version with a new "Last update" date. For material
							changes, we may provide additional notice (e.g., email or in-app
							notice) where required by law.
						</p>
					</div>
					<div>
						<h2 className="mb-2 font-semibold text-lg">8. Contact</h2>
						<p>
							For questions or requests about this Policy or your data, contact
							us at{" "}
							<a
								href="mailto:support@example.com"
								className="text-blue-600 underline"
							>
								info@reloop.sh
							</a>
							.
						</p>
					</div>
					<div>
						<h2 className="mb-2 font-semibold text-lg">
							9. Additional Information for Customers
						</h2>
						<p>
							When you use Reloop to send emails to your own customers or
							subscribers, you are the data controller of that personal data and
							responsible for providing appropriate privacy notices and
							obtaining any legally required consents. Upon request and where
							applicable, we will execute a Data Processing Addendum (DPA) and
							publish a list of our subprocessors.
						</p>
					</div>
				</section>
			</div>
		</PageLayout>
	);
};

export default PrivacyPage;
