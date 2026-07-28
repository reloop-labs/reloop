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
	/** Verified sending domain */
	domainName?: string;
}

const defaultBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
	? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
	: "https://reloop.sh";

export const OnboardingTestEmail = ({
	baseUrl = defaultBaseUrl,
	theme = "light",
	recipientEmail,
	fromAddress,
	domainName,
}: OnboardingTestEmailProps) => {
	const isDark = theme === "dark";

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

	return (
		<Html>
			<Head />
			<Preview>
				Your Reloop email channel is live and fully authenticated.
			</Preview>
			<Tailwind>
				<Body className={cls.body}>
					<Wrapper baseUrl={baseUrl} theme={theme}>
						<Text className={cls.label}>Integration Test</Text>

						<Heading
							className={cls.heading}
							style={{ fontFamily: "Georgia, serif" }}
						>
							Your email channel is live{" "}
							<span className={cls.headingMuted}>and fully authenticated.</span>
						</Heading>

						<Hr className={cls.hr} />

						<Text className={cls.salutation}>Hello there,</Text>

						<Text className={cls.bodyText}>
							If you are reading this email, congratulations! Your domain
							{domainName ? ` (${domainName})` : ""}, DNS settings, and
							workspace session are working. This message was sent from{" "}
							{fromAddress ?? "your verified domain"}
							{recipientEmail ? ` to ${recipientEmail}` : " to your account"}.
						</Text>

						{/* Next steps */}
						<Section className={cls.capBox}>
							<Text className={cls.label}>Next Steps</Text>

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
										<Text className={cls.rowTitle}>Integrate the SDK</Text>
										<Text className={cls.rowDesc}>
											Copy the generated code snippet from your dashboard
											playground and drop it into your codebase.
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
										<Text className={cls.rowTitle}>Add Templates</Text>
										<Text className={cls.rowDesc}>
											Define reusable layouts in the template designer to format
											agent outputs dynamically.
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
										<Text className={cls.rowTitle}>Monitor Analytics</Text>
										<Text className={cls.rowDesc}>
											Track delivery success, click rates, and reputation health
											in real-time.
										</Text>
									</td>
								</tr>
							</table>
						</Section>

						{/* CTA */}
						<Section className="mt-10">
							<Button className={cls.btn} href={`${baseUrl}/dashboard`}>
								Go to Dashboard →
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
