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

interface TrialEndingEmailProps {
	fullName: string;
	daysLeft: number;
	trialEndDate: string;
	currentPlan: string;
	upgradeUrl: string;
	baseUrl?: string;
	theme?: "light" | "dark";
}

const defaultBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
	? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
	: "https://reloop.sh";

export const TrialEndingEmail = ({
	fullName = "User",
	daysLeft = 3,
	trialEndDate = "May 9, 2026",
	currentPlan = "Pro Trial",
	upgradeUrl = "https://reloop.sh/dashboard/billing",
	baseUrl = defaultBaseUrl,
	theme = "light",
}: TrialEndingEmailProps) => {
	const firstName = fullName ? fullName.split(" ").at(0) : "there";
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
		countdownBox: isDark
			? "mt-8 rounded-2xl border border-[#222222] border-solid py-10 text-center"
			: "mt-8 rounded-2xl border border-[#e0e0e0] border-solid py-10 text-center",
		countdownNum: isDark
			? "m-0 font-bold font-mono text-[64px] text-white leading-[1]"
			: "m-0 font-bold font-mono text-[64px] text-[#0e0e0e] leading-[1]",
		countdownLabel: isDark
			? "mt-2 m-0 font-mono text-[#707070] text-[12px] uppercase tracking-[0.2em]"
			: "mt-2 m-0 font-mono text-[#707070] text-[12px] uppercase tracking-[0.2em]",
		capBox: isDark
			? "mt-10 rounded-lg border border-[#222222] border-solid p-8"
			: "mt-10 rounded-lg border border-[#e0e0e0] border-solid p-8",
		rowNum: "m-0 font-mono text-[#404040] text-[12px]",
		rowTitle: isDark
			? "m-0 font-semibold text-white text-[16px]"
			: "m-0 font-semibold text-[#0e0e0e] text-[16px]",
		rowDesc: "mt-1 text-[#707070] text-[15px]",
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
				{`Your Reloop trial ends in ${daysLeft} day${daysLeft !== 1 ? "s" : ""} — upgrade to keep access.`}
			</Preview>
			<Tailwind>
				<Body className={cls.body}>
					<Wrapper baseUrl={baseUrl} theme={theme}>
						<Text className={cls.label}>Trial Ending Soon</Text>

						<Heading
							className={cls.heading}
							style={{ fontFamily: "Georgia, serif" }}
						>
							Your trial ends{" "}
							<span className={cls.headingMuted}>
								in {daysLeft} day{daysLeft !== 1 ? "s" : ""}.
							</span>
						</Heading>

						<Hr className={cls.hr} />

						<Text className={cls.salutation}>
							Hey, <strong>{firstName}.</strong>
						</Text>

						<Text className={cls.bodyText}>
							Your <strong>{currentPlan}</strong> trial expires on{" "}
							<strong>{trialEndDate}</strong>. After that, your account will
							revert to the free plan and access to paid features will be
							restricted.
						</Text>

						{/* Countdown */}
						<Section className={cls.countdownBox}>
							<Text className={cls.countdownNum}>{daysLeft}</Text>
							<Text className={cls.countdownLabel}>
								Day{daysLeft !== 1 ? "s" : ""} Remaining
							</Text>
						</Section>

						{/* What you'll lose */}
						<Section className={cls.capBox}>
							<Text className={cls.label}>
								What you&apos;ll lose after trial
							</Text>

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
										<Text className={cls.rowTitle}>Higher Sending Volume</Text>
										<Text className={cls.rowDesc}>
											Free plan is limited to 500 emails/month. Paid plans start
											at 10,000.
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
										<Text className={cls.rowTitle}>Custom Domains</Text>
										<Text className={cls.rowDesc}>
											Send from your own verified domain instead of shared
											Reloop infrastructure.
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
										<Text className={cls.rowTitle}>Team Collaboration</Text>
										<Text className={cls.rowDesc}>
											Multi-member workspaces, shared inboxes, and role-based
											access are paid-plan features.
										</Text>
									</td>
								</tr>
							</table>
						</Section>

						{/* CTA */}
						<Section className="mt-10">
							<Button className={cls.btn} href={upgradeUrl}>
								Upgrade Now
							</Button>
						</Section>

						<Text className={cls.bodyText}>
							No credit card was required for your trial. You&apos;ll only be
							charged after you choose a plan and confirm billing.
						</Text>

						<Hr className={cls.footerHr} />
						<Footer baseUrl={baseUrl} theme={theme} />
					</Wrapper>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default TrialEndingEmail;
