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

interface OrgJoinedEmailProps {
	memberName: string;
	orgName: string;
	role: string;
	inviterName: string;
	dashboardUrl: string;
	baseUrl?: string;
	theme?: "light" | "dark";
}

const defaultBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
	? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
	: "https://reloop.sh";

export const OrgJoinedEmail = ({
	memberName = "Alex",
	orgName = "Reloop",
	role = "Member",
	inviterName = "Pranav Patel",
	dashboardUrl = "https://reloop.sh/dashboard",
	baseUrl = defaultBaseUrl,
	theme = "light",
}: OrgJoinedEmailProps) => {
	const firstName = memberName ? memberName.split(" ").at(0) : "there";
	const isDark = theme === "dark";

	// Full class strings — must be static so Tailwind JIT can detect them
	const cls = {
		body: isDark
			? "m-0 p-0 bg-[#0e0e0e] text-white font-sans"
			: "m-0 p-0 bg-white text-[#0e0e0e] font-sans",
		label: "m-0 font-mono font-medium text-[#707070] text-[12px] uppercase tracking-[0.2em]",
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
		detailsBox: isDark
			? "mt-8 rounded-2xl border border-[#222222] border-solid p-8"
			: "mt-8 rounded-2xl border border-[#e0e0e0] border-solid p-8",
		rowNum: "m-0 font-mono text-[#404040] text-[12px]",
		rowTitle: isDark
			? "m-0 font-semibold text-white text-[16px]"
			: "m-0 font-semibold text-[#0e0e0e] text-[16px]",
		rowDesc: "mt-1 text-[#707070] text-[15px]",
		summaryBox: isDark
			? "mt-8 rounded-xl bg-[#1a1a1a] border border-[#222222] border-solid p-6"
			: "mt-8 rounded-xl bg-[#f5f5f5] border border-[#e0e0e0] border-solid p-6",
		summaryLabel: "m-0 font-mono text-[#707070] text-[11px] uppercase tracking-[0.15em]",
		summaryValue: isDark
			? "m-0 mt-1 font-semibold text-white text-[15px]"
			: "m-0 mt-1 font-semibold text-[#0e0e0e] text-[15px]",
		btn: isDark
			? "rounded-xl bg-[#edece1] px-6 py-3 text-center font-bold font-mono text-[12px] text-black uppercase tracking-wider no-underline"
			: "rounded-xl bg-[#0e0e0e] px-6 py-3 text-center font-bold font-mono text-[12px] text-white uppercase tracking-wider no-underline",
		footerText: isDark
			? "mt-8 text-[#707070] text-[13px] leading-[1.6]"
			: "mt-8 text-[#888888] text-[13px] leading-[1.6]",
		footerHr: isDark ? "my-10 border-[#222222]" : "my-10 border-[#e0e0e0]",
	};

	const tdBorder = isDark ? "1px solid #222222" : "1px solid #e0e0e0";

	return (
		<Html>
			<Head />
			<Preview>
				You&apos;ve joined {orgName} on Reloop — welcome to the team.
			</Preview>
			<Tailwind>
				<Body className={cls.body}>
					<Wrapper baseUrl={baseUrl} theme={theme}>
						{/* Small Label */}
						<Text className={cls.label}>You&apos;re in</Text>

						{/* Main Headline */}
						<Heading
							className={cls.heading}
							style={{ fontFamily: "Georgia, serif" }}
						>
							Welcome to{" "}
							<span className={cls.headingMuted}>{orgName}.</span>
						</Heading>

						<Hr className={cls.hr} />

						{/* Salutation */}
						<Text className={cls.salutation}>
							Hey, <strong>{firstName}.</strong>
						</Text>

						<Text className={cls.bodyText}>
							You&apos;ve successfully joined <strong>{orgName}</strong> on
							Reloop. <strong>{inviterName}</strong> added you as a{" "}
							<strong>{role}</strong> — you now have access to the
							organization&apos;s workspace.
						</Text>

						{/* Membership Summary */}
						<Section className={cls.summaryBox}>
							<table width="100%" cellPadding="0" cellSpacing="0">
								<tr>
									<td style={{ verticalAlign: "top" }}>
										<Text className={cls.summaryLabel}>Organization</Text>
										<Text className={cls.summaryValue}>{orgName}</Text>
									</td>
									<td style={{ verticalAlign: "top" }}>
										<Text className={cls.summaryLabel}>Your Role</Text>
										<Text className={cls.summaryValue}>{role}</Text>
									</td>
									<td style={{ verticalAlign: "top" }}>
										<Text className={cls.summaryLabel}>Added by</Text>
										<Text className={cls.summaryValue}>{inviterName}</Text>
									</td>
								</tr>
							</table>
						</Section>

						{/* What you can do */}
						<Section className={cls.detailsBox}>
							<Text className={cls.label}>What&apos;s available to you</Text>

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
										<Text className={cls.rowTitle}>Shared Inbox</Text>
										<Text className={cls.rowDesc}>
											Access the organization&apos;s shared email workspace,
											send and manage emails together.
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
										<Text className={cls.rowTitle}>Templates & Campaigns</Text>
										<Text className={cls.rowDesc}>
											Collaborate on email templates and broadcast campaigns
											with your team in real time.
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
										<Text className={cls.rowTitle}>Analytics & Logs</Text>
										<Text className={cls.rowDesc}>
											Track delivery rates, opens, and click events across all
											emails sent from {orgName}.
										</Text>
									</td>
								</tr>
							</table>
						</Section>

						{/* CTA Button */}
						<Section className="mt-10">
							<Button className={cls.btn} href={dashboardUrl}>
								Go to Dashboard
							</Button>
						</Section>

						<Text className={cls.bodyText}>
							If you weren&apos;t expecting to be added to this organization,
							please reach out to your Reloop admin or contact our support team.
						</Text>

						<Hr className={cls.footerHr} />

						<Footer baseUrl={baseUrl} theme={theme} />
					</Wrapper>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default OrgJoinedEmail;
