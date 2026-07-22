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

interface DomainVerifiedEmailProps {
	fullName: string;
	domain: string;
	dashboardUrl: string;
	baseUrl?: string;
	theme?: "light" | "dark";
	/** Whether sending features are enabled for this domain */
	isSendingEmailEnabled?: boolean;
	/** Whether inbound receiving is enabled */
	isReceivingEmailEnabled?: boolean;
	/** Whether open/click tracking is enabled */
	isTrackingEnabled?: boolean;
}

const defaultBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
	? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
	: "https://reloop.sh";

export const DomainVerifiedEmail = ({
	fullName = "User",
	domain = "mail.yourdomain.com",
	dashboardUrl = "https://reloop.sh/dashboard",
	baseUrl = defaultBaseUrl,
	theme = "light",
	isSendingEmailEnabled = true,
	isReceivingEmailEnabled = false,
	isTrackingEnabled = false,
}: DomainVerifiedEmailProps) => {
	const firstName = fullName ? fullName.split(" ").at(0) : "there";
	const isDark = theme === "dark";

	const unlocked: { title: string; desc: string }[] = [];
	if (isSendingEmailEnabled) {
		unlocked.push({
			title: "Send Transactional Email",
			desc: "Fire API calls and send from your own domain with full deliverability — SPF, DKIM, and DMARC all configured.",
		});
		unlocked.push({
			title: "Broadcast Campaigns",
			desc: "Send newsletters and bulk campaigns to your audience under your own brand.",
		});
	}
	if (isReceivingEmailEnabled) {
		unlocked.push({
			title: "Receive Inbound Email",
			desc: "Mail sent to addresses on this domain is delivered to Reloop and available via the API and inbox.",
		});
	}
	if (isTrackingEnabled) {
		unlocked.push({
			title: "Open & Click Tracking",
			desc: "Track engagement on sends using your branded tracking hostname.",
		});
	}
	// Always useful once verified
	unlocked.push({
		title: "Track Reputation",
		desc: "Monitor bounce rates, spam complaints, and delivery health per domain in your dashboard.",
	});

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
		domainBadge: isDark
			? "mt-3 m-0 font-mono text-[12px] text-[#707070] uppercase tracking-[0.15em]"
			: "mt-3 m-0 font-mono text-[12px] text-[#707070] uppercase tracking-[0.15em]",
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
		footerText: isDark
			? "mt-8 text-[#707070] text-[13px] leading-[1.6]"
			: "mt-8 text-[#888888] text-[13px] leading-[1.6]",
		footerHr: isDark ? "my-10 border-[#222222]" : "my-10 border-[#e0e0e0]",
	};

	const tdBorder = isDark ? "1px solid #222222" : "1px solid #e0e0e0";

	const capabilitySummary = [
		isSendingEmailEnabled && "send",
		isReceivingEmailEnabled && "receive",
		isTrackingEnabled && "track",
	]
		.filter(Boolean)
		.join(", ");

	const previewLine = isSendingEmailEnabled
		? `${domain} is verified — you can now send emails through Reloop.`
		: `${domain} is verified on Reloop.`;

	return (
		<Html>
			<Head />
			<Preview>{previewLine}</Preview>
			<Tailwind>
				<Body className={cls.body}>
					<Wrapper baseUrl={baseUrl} theme={theme}>
						{/* Small Label */}
						<Text className={cls.label}>Domain Verified</Text>

						{/* Main Headline */}
						<Heading
							className={cls.heading}
							style={{ fontFamily: "Georgia, serif" }}
						>
							Your domain is live{" "}
							<span className={cls.headingMuted}>
								{isSendingEmailEnabled
									? "and ready to send."
									: "and ready to use."}
							</span>
						</Heading>

						<Hr className={cls.hr} />

						<Text className={cls.salutation}>
							Hey, <strong>{firstName}.</strong>
						</Text>

						<Text className={cls.bodyText}>
							Your domain has passed all required DNS checks and is now fully
							verified on Reloop
							{capabilitySummary ? ` for ${capabilitySummary}` : ""}.{" "}
							{isSendingEmailEnabled ? (
								<>
									You can start sending emails from{" "}
									<strong>{domain}</strong> right now.
								</>
							) : (
								<>
									<strong>{domain}</strong> is ready for the features you
									enabled.
								</>
							)}
						</Text>

						{/* Domain Display */}
						<Section className={cls.domainBox}>
							<Text className={cls.domainText}>{domain}</Text>
							<Text className={cls.domainBadge}>✓ Verified</Text>
						</Section>

						{/* What's unlocked */}
						<Section className={cls.capBox}>
							<Text className={cls.label}>What&apos;s now unlocked</Text>

							<table
								width="100%"
								cellPadding="0"
								cellSpacing="0"
								style={{ marginTop: "24px" }}
							>
								{unlocked.map((item, index) => {
									const isLast = index === unlocked.length - 1;
									const num = String(index + 1).padStart(2, "0");
									return (
										<tr key={item.title}>
											<td
												style={{
													verticalAlign: "top",
													width: "32px",
													paddingTop: index === 0 ? 0 : "20px",
												}}
											>
												<Text className={cls.rowNum}>{num}</Text>
											</td>
											<td
												style={{
													borderBottom: isLast ? undefined : tdBorder,
													paddingTop: index === 0 ? 0 : "20px",
													paddingBottom: isLast ? 0 : "20px",
													verticalAlign: "top",
												}}
											>
												<Text className={cls.rowTitle}>{item.title}</Text>
												<Text className={cls.rowDesc}>{item.desc}</Text>
											</td>
										</tr>
									);
								})}
							</table>
						</Section>

						{/* CTA */}
						<Section className="mt-10">
							<Button className={cls.btn} href={dashboardUrl}>
								{isSendingEmailEnabled ? "Start Sending" : "Open Dashboard"}
							</Button>
						</Section>

						<Text className={cls.footerText}>
							If you did not add this domain to Reloop, please contact our
							support team immediately.
						</Text>

						<Hr className={cls.footerHr} />
						<Footer baseUrl={baseUrl} theme={theme} />
					</Wrapper>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default DomainVerifiedEmail;
