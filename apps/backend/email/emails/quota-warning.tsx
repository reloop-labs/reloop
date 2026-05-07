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

interface QuotaWarningEmailProps {
	fullName: string;
	percentUsed: number;
	emailsSent: number;
	emailsLimit: number;
	resetDate: string;
	upgradeUrl: string;
	dashboardUrl: string;
	baseUrl?: string;
	theme?: "light" | "dark";
}

const defaultBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
	? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
	: "https://reloop.sh";

export const QuotaWarningEmail = ({
	fullName = "User",
	percentUsed = 80,
	emailsSent = 8000,
	emailsLimit = 10000,
	resetDate = "June 1, 2026",
	upgradeUrl = "https://reloop.sh/dashboard/billing",
	dashboardUrl = "https://reloop.sh/dashboard",
	baseUrl = defaultBaseUrl,
	theme = "light",
}: QuotaWarningEmailProps) => {
	const firstName = fullName ? fullName.split(" ").at(0) : "there";
	const isDark = theme === "dark";
	const isOver = percentUsed >= 100;

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
		statsBox: isDark
			? "mt-8 rounded-2xl border border-[#222222] border-solid p-8"
			: "mt-8 rounded-2xl border border-[#e0e0e0] border-solid p-8",
		statLabel: isDark
			? "m-0 font-mono text-[#707070] text-[11px] uppercase tracking-[0.15em]"
			: "m-0 font-mono text-[#707070] text-[11px] uppercase tracking-[0.15em]",
		statValue: isDark
			? "m-0 mt-1 font-bold font-mono text-white text-[24px]"
			: "m-0 mt-1 font-bold font-mono text-[#0e0e0e] text-[24px]",
		progressTrack: isDark ? "#222222" : "#e0e0e0",
		progressFill: isOver
			? "#ef4444"
			: percentUsed >= 80
				? "#f59e0b"
				: "#22c55e",
		btn: isDark
			? "rounded-xl bg-[#edece1] px-6 py-3 text-center font-bold font-mono text-[12px] text-black uppercase tracking-wider no-underline"
			: "rounded-xl bg-[#0e0e0e] px-6 py-3 text-center font-bold font-mono text-[12px] text-white uppercase tracking-wider no-underline",
		footerHr: isDark ? "my-10 border-[#222222]" : "my-10 border-[#e0e0e0]",
		footerText: isDark
			? "mt-8 text-[#707070] text-[13px] leading-[1.6]"
			: "mt-8 text-[#888888] text-[13px] leading-[1.6]",
	};

	const remaining = emailsLimit - emailsSent;

	return (
		<Html>
			<Head />
			<Preview>
				{isOver
					? "You've reached your sending limit — upgrade to keep sending."
					: `You've used ${percentUsed}% of your monthly sending quota.`}
			</Preview>
			<Tailwind>
				<Body className={cls.body}>
					<Wrapper baseUrl={baseUrl} theme={theme}>
						{/* Small Label */}
						<Text className={cls.label}>
							{isOver ? "Limit Reached" : "Quota Warning"}
						</Text>

						{/* Main Headline */}
						<Heading
							className={cls.heading}
							style={{ fontFamily: "Georgia, serif" }}
						>
							{isOver ? (
								<>
									You&apos;ve hit your{" "}
									<span className={cls.headingMuted}>sending limit.</span>
								</>
							) : (
								<>
									{percentUsed}% of your quota{" "}
									<span className={cls.headingMuted}>has been used.</span>
								</>
							)}
						</Heading>

						<Hr className={cls.hr} />

						<Text className={cls.salutation}>
							Hey, <strong>{firstName}.</strong>
						</Text>

						<Text className={cls.bodyText}>
							{isOver
								? `Your account has reached its monthly sending limit of ${emailsLimit.toLocaleString()} emails. Sending is currently paused. Upgrade your plan to resume immediately, or wait until your quota resets on ${resetDate}.`
								: `You've sent ${emailsSent.toLocaleString()} of your ${emailsLimit.toLocaleString()} monthly emails. You have ${remaining.toLocaleString()} emails remaining before your quota resets on ${resetDate}.`}
						</Text>

						{/* Stats Box */}
						<Section className={cls.statsBox}>
							{/* Progress Bar */}
							<table width="100%" cellPadding="0" cellSpacing="0">
								<tr>
									<td>
										<Text className={cls.statLabel}>Usage this month</Text>
										<div
											style={{
												marginTop: "10px",
												height: "8px",
												borderRadius: "9999px",
												backgroundColor: cls.progressTrack,
												overflow: "hidden",
											}}
										>
											<div
												style={{
													height: "8px",
													width: `${Math.min(percentUsed, 100)}%`,
													borderRadius: "9999px",
													backgroundColor: cls.progressFill,
												}}
											/>
										</div>
									</td>
								</tr>
							</table>

							{/* Stat Numbers */}
							<table
								width="100%"
								cellPadding="0"
								cellSpacing="0"
								style={{ marginTop: "28px" }}
							>
								<tr>
									<td style={{ verticalAlign: "top" }}>
										<Text className={cls.statLabel}>Sent</Text>
										<Text className={cls.statValue}>
											{emailsSent.toLocaleString()}
										</Text>
									</td>
									<td style={{ verticalAlign: "top", textAlign: "center" }}>
										<Text className={cls.statLabel}>Limit</Text>
										<Text className={cls.statValue}>
											{emailsLimit.toLocaleString()}
										</Text>
									</td>
									<td style={{ verticalAlign: "top", textAlign: "right" }}>
										<Text className={cls.statLabel}>Resets</Text>
										<Text className={cls.statValue}>{resetDate}</Text>
									</td>
								</tr>
							</table>
						</Section>

						{/* CTA */}
						<Section className="mt-10">
							<Button className={cls.btn} href={upgradeUrl}>
								{isOver ? "Upgrade Now" : "View Plans"}
							</Button>
						</Section>

						<Text className={cls.bodyText}>
							You can also review your usage breakdown in your{" "}
							<a href={dashboardUrl} style={{ color: "inherit" }}>
								dashboard
							</a>
							.
						</Text>

						<Hr className={cls.footerHr} />
						<Footer baseUrl={baseUrl} theme={theme} />
					</Wrapper>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default QuotaWarningEmail;
