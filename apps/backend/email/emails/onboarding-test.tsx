import {
	Body,
	Button,
	Head,
	Heading,
	Hr,
	Html,
	Preview,
	Section,
	Tailwind,
	Text,
} from "react-email";
import { Footer } from "../components/footer";
import { Wrapper } from "../components/wrapper";

interface OnboardingTestEmailProps {
	baseUrl?: string;
	theme?: "light" | "dark";
	/** Signed-in user who received this test message */
	recipientEmail?: string;
	/** Full From header used for this send */
	fromAddress?: string;
	/** Domain shown in the email (customer domain or platform test domain) */
	domainName?: string;
	/**
	 * `platform` — post–API-key test via Reloop-owned domain.
	 * `domain` — proof send after the customer verified their own domain.
	 */
	mode?: "platform" | "domain";
}

const defaultBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
	? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
	: "https://reloop.sh";

export const OnboardingTestEmail = ({
	baseUrl = defaultBaseUrl,
	theme = "light",
	recipientEmail,
	fromAddress,
	domainName = "your-domain.com",
	mode = "domain",
}: OnboardingTestEmailProps) => {
	const isDark = theme === "dark";
	const domain = domainName;
	const isPlatform = mode === "platform";

	const cls = {
		body: isDark
			? "m-0 p-0 bg-[#0e0e0e] text-white font-sans"
			: "m-0 p-0 bg-white text-[#0e0e0e] font-sans",
		label:
			"m-0 font-mono font-medium text-[#707070] text-[12px] uppercase tracking-[0.2em]",
		heading: isDark
			? "mt-6 mb-8 p-0 font-normal text-[32px] text-white leading-[1.2]"
			: "mt-6 mb-8 p-0 font-normal text-[32px] text-[#0e0e0e] leading-[1.2]",
		headingMuted: "text-[#707070]",
		hr: isDark ? "my-8 border-[#222222]" : "my-8 border-[#e0e0e0]",
		salutation: isDark
			? "text-[15px] text-white leading-[1.6]"
			: "text-[15px] text-[#0e0e0e] leading-[1.6]",
		bodyText: isDark
			? "mt-4 text-[#b0b0b0] text-[15px] leading-[1.6]"
			: "mt-4 text-[#555555] text-[15px] leading-[1.6]",
		domainBox: isDark
			? "mt-8 rounded-2xl border border-[#222222] border-solid py-10 text-center"
			: "mt-8 rounded-2xl border border-[#e0e0e0] border-solid py-10 text-center",
		domainText: isDark
			? "m-0 font-medium font-mono text-[22px] text-white tracking-[0.05em]"
			: "m-0 font-medium font-mono text-[22px] text-[#0e0e0e] tracking-[0.05em]",
		domainBadge:
			"mt-3 m-0 font-mono text-[12px] text-[#0a7a3e] uppercase tracking-[0.15em]",
		domainBadgeDark:
			"mt-3 m-0 font-mono text-[12px] text-[#4ade80] uppercase tracking-[0.15em]",
		metaRow: isDark
			? "mt-2 m-0 font-mono text-[12px] text-[#707070]"
			: "mt-2 m-0 font-mono text-[12px] text-[#888888]",
		rowNum: "m-0 font-mono text-[#404040] text-[12px]",
		rowTitle: isDark
			? "m-0 font-semibold text-white text-[16px]"
			: "m-0 font-semibold text-[#0e0e0e] text-[16px]",
		rowDesc: "mt-1 text-[#707070] text-[15px]",
		capBox: isDark
			? "mt-10 rounded-lg border border-[#222222] border-solid p-8"
			: "mt-10 rounded-lg border border-[#e0e0e0] border-solid p-8",
		btn: isDark
			? "rounded-xl bg-[#edece1] px-6 py-3 text-center font-bold font-mono text-[12px] text-black uppercase tracking-wider no-underline"
			: "rounded-xl bg-[#0e0e0e] px-6 py-3 text-center font-bold font-mono text-[12px] text-white uppercase tracking-wider no-underline",
		footerHr: isDark ? "my-10 border-[#222222]" : "my-10 border-[#e0e0e0]",
	};

	const tdBorder = isDark ? "1px solid #222222" : "1px solid #e0e0e0";
	const previewLine = isPlatform
		? "Your Reloop API key works — this message was delivered to your inbox."
		: `${domain} is ready to send emails through Reloop.`;

	return (
		<Html>
			<Head />
			<Preview>{previewLine}</Preview>
			<Tailwind>
				<Body className={cls.body}>
					<Wrapper baseUrl={baseUrl} theme={theme}>
						<Text className={cls.label}>
							{isPlatform ? "API key test" : "Domain ready"}
						</Text>

						<Heading
							className={cls.heading}
							style={{ fontFamily: "Georgia, serif" }}
						>
							{isPlatform ? (
								<>
									Your API key{" "}
									<span className={cls.headingMuted}>works.</span>
								</>
							) : (
								<>
									{domain}{" "}
									<span className={cls.headingMuted}>
										is ready to send emails.
									</span>
								</>
							)}
						</Heading>

						<Hr className={cls.hr} />

						<Text className={cls.salutation}>Hello there,</Text>

						<Text className={cls.bodyText}>
							{isPlatform ? (
								<>
									You generated an API key and asked Reloop to send a real test
									message. This email is the proof: delivery works. It was sent
									from Reloop&apos;s platform test domain (
									<strong>{domain}</strong>), not from a domain you verified
									yourself.
								</>
							) : (
								<>
									You added <strong>{domain}</strong> to Reloop and finished DNS
									verification. This message is the proof: it was delivered from
									your own domain, so outbound sending works.
								</>
							)}
						</Text>

						<Section className={cls.domainBox}>
							<Text className={cls.domainText}>{domain}</Text>
							<Text
								className={isDark ? cls.domainBadgeDark : cls.domainBadge}
							>
								{isPlatform ? "✓ Platform test domain" : "✓ Ready to send"}
							</Text>
							{fromAddress ? (
								<Text className={cls.metaRow}>From {fromAddress}</Text>
							) : null}
							{recipientEmail ? (
								<Text className={cls.metaRow}>To {recipientEmail}</Text>
							) : null}
						</Section>

						<Text className={cls.bodyText}>
							{isPlatform ? (
								<>
									For production From addresses (your brand, SPF/DKIM on your
									zone), add and verify your own domain in the dashboard. The
									platform domain is only for this first inbox check.
								</>
							) : (
								<>
									You can now send transactional and product emails from
									addresses on <strong>{domain}</strong> via the API or SMTP —
									SPF, DKIM, and DMARC are authenticated for this domain.
								</>
							)}
						</Text>

						<Section className={cls.capBox}>
							<Text className={cls.label}>What you can do next</Text>

							<table
								width="100%"
								cellPadding="0"
								cellSpacing="0"
								style={{ marginTop: "24px" }}
							>
								<tr>
									<td style={{ verticalAlign: "top", width: "32px" }}>
										<Text className={cls.rowNum}>01</Text>
									</td>
									<td
										style={{
											borderBottom: tdBorder,
											paddingBottom: "20px",
											verticalAlign: "top",
										}}
									>
										<Text className={cls.rowTitle}>
											{isPlatform ? "Add your domain" : "Send from the API"}
										</Text>
										<Text className={cls.rowDesc}>
											{isPlatform
												? "Verify SPF, DKIM, and DMARC on your domain so production mail is branded as you."
												: `Use an API key or SMTP with a From address on ${domain} to send from your app.`}
										</Text>
									</td>
								</tr>
								<tr>
									<td
										style={{
											verticalAlign: "top",
											width: "32px",
											paddingTop: "20px",
										}}
									>
										<Text className={cls.rowNum}>02</Text>
									</td>
									<td
										style={{
											borderBottom: tdBorder,
											paddingTop: "20px",
											paddingBottom: "20px",
											verticalAlign: "top",
										}}
									>
										<Text className={cls.rowTitle}>
											{isPlatform ? "Send from the API" : "Add templates"}
										</Text>
										<Text className={cls.rowDesc}>
											{isPlatform
												? "Use your API key with a From address on your verified domain."
												: "Build reusable layouts in the template designer for consistent branded mail."}
										</Text>
									</td>
								</tr>
								<tr>
									<td
										style={{
											verticalAlign: "top",
											width: "32px",
											paddingTop: "20px",
										}}
									>
										<Text className={cls.rowNum}>03</Text>
									</td>
									<td style={{ paddingTop: "20px", verticalAlign: "top" }}>
										<Text className={cls.rowTitle}>Watch deliverability</Text>
										<Text className={cls.rowDesc}>
											Track delivery, bounces, and reputation in Metrics.
										</Text>
									</td>
								</tr>
							</table>
						</Section>

						<Section className="mt-10">
							<Button
								className={cls.btn}
								href={
									isPlatform
										? `${baseUrl}/dashboard/domain`
										: `${baseUrl}/dashboard/domain`
								}
							>
								{isPlatform ? "Add a domain →" : "View domain →"}
							</Button>
						</Section>

						<Hr className={cls.footerHr} />
						<Footer baseUrl={baseUrl} theme={theme} />
					</Wrapper>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default OnboardingTestEmail;
