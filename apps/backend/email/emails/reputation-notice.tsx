import { appName } from "@reloop/email/brand";
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
import { defaultBaseUrl } from "../components/base-url";
import { Footer } from "../components/footer";
import { Wrapper } from "../components/wrapper";

type NoticeLevel = 1 | 2 | 3 | 4;
type NoticeReason = "bounce_rate" | "complaint_rate" | "duplicate_burst";

interface ReputationNoticeEmailProps {
	fullName?: string | null;
	organizationName: string;
	/** 1–3 = escalating warnings, 4 = sending paused. */
	level: NoticeLevel;
	reason: NoticeReason;
	sent: number;
	bounced: number;
	complaint: number;
	bounceRate: number;
	complaintRate: number;
	bounceBlockRate: number;
	complaintBlockRate: number;
	topBouncingDomains: { domain: string; sent: number; bounced: number }[];
	/** Level 4 only, already formatted for display. */
	pausedUntil?: string | null;
	dashboardUrl: string;
	baseUrl?: string;
	theme?: "light" | "dark";
}

export function formatRate(rate: number): string {
	return `${(rate * 100).toFixed(rate < 0.01 ? 2 : 1)}%`;
}

export function reputationNoticeSubject({
	level,
	reason,
	bounceRate,
	complaintRate,
	bounceBlockRate,
	complaintBlockRate,
}: Pick<
	ReputationNoticeEmailProps,
	| "level"
	| "reason"
	| "bounceRate"
	| "complaintRate"
	| "bounceBlockRate"
	| "complaintBlockRate"
>): string {
	const isComplaint = reason === "complaint_rate";
	const metric = isComplaint ? "spam complaint rate" : "bounce rate";
	const rate = formatRate(isComplaint ? complaintRate : bounceRate);
	const limit = formatRate(isComplaint ? complaintBlockRate : bounceBlockRate);
	switch (level) {
		case 1:
			return `Heads-up: your ${metric} is ${rate}`;
		case 2:
			return `Warning: your ${metric} is ${rate} and rising`;
		case 3:
			return `Final warning: sending pauses at a ${limit} ${metric} (you're at ${rate})`;
		case 4:
			return `Sending paused: your ${metric} reached ${rate}`;
	}
}

const HEADINGS: Record<NoticeLevel, [string, string]> = {
	1: ["Your bounce rate", "is climbing."],
	2: ["Your bounce rate", "is still rising."],
	3: ["Sending will pause", "if this continues."],
	4: ["Sending is paused", "for your account."],
};

const COMPLAINT_HEADINGS: Record<NoticeLevel, [string, string]> = {
	1: ["Spam complaints", "are climbing."],
	2: ["Spam complaints", "are still rising."],
	3: ["Sending will pause", "if this continues."],
	4: ["Sending is paused", "for your account."],
};

const BOUNCE_FIXES = [
	"Remove addresses that hard-bounced. Reloop suppresses them automatically, but drop them from your own lists and imports too.",
	"Stop sending to old, purchased or scraped lists. Addresses that haven't engaged in months are the usual source of bounces.",
	"Validate new addresses at signup, and use double opt-in so typos never reach your list.",
	"Slow down large sends. Send to your most engaged contacts first, then widen the audience gradually.",
];

const COMPLAINT_FIXES = [
	"Only email people who explicitly opted in to hear from you.",
	"Put a clear unsubscribe link in every marketing email, and honor it right away.",
	"Make the sender name and subject recognizable, so recipients know who is writing to them.",
	"Send less often to contacts who haven't opened anything recently.",
];

export const ReputationNoticeEmail = ({
	fullName = "User",
	organizationName = "Acme",
	level = 2,
	reason = "bounce_rate",
	sent = 1240,
	bounced = 48,
	complaint = 0,
	bounceRate = 0.0387,
	complaintRate = 0,
	bounceBlockRate = 0.05,
	complaintBlockRate = 0.003,
	topBouncingDomains = [{ domain: "mail.acme.com", sent: 1100, bounced: 45 }],
	pausedUntil = null,
	dashboardUrl = `${defaultBaseUrl}/dashboard/metrics`,
	baseUrl = defaultBaseUrl,
	theme = "light",
}: ReputationNoticeEmailProps) => {
	const firstName = fullName ? fullName.split(" ").at(0) : "there";
	const isDark = theme === "dark";
	const isComplaint = reason === "complaint_rate";
	const isPaused = level === 4;
	const metric = isComplaint ? "spam complaint rate" : "bounce rate";
	const rate = isComplaint ? complaintRate : bounceRate;
	const limit = isComplaint ? complaintBlockRate : bounceBlockRate;
	const count = isComplaint ? complaint : bounced;
	const [headingLead, headingMuted] = (
		isComplaint ? COMPLAINT_HEADINGS : HEADINGS
	)[level];
	const fixes = isComplaint ? COMPLAINT_FIXES : BOUNCE_FIXES;

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
		rateBox: isDark
			? "mt-8 rounded-2xl border border-[#222222] border-solid py-10 text-center"
			: "mt-8 rounded-2xl border border-[#e0e0e0] border-solid py-10 text-center",
		rateText: isDark
			? "m-0 font-medium font-mono text-[32px] text-white"
			: "m-0 font-medium font-mono text-[32px] text-[#0e0e0e]",
		rateBadge:
			"mt-3 m-0 font-mono text-[12px] text-[#707070] uppercase tracking-[0.15em]",
		subheading: isDark
			? "mt-8 mb-0 font-medium text-[15px] text-white"
			: "mt-8 mb-0 font-medium text-[15px] text-[#0e0e0e]",
		listItem: isDark
			? "mt-2 mb-0 text-[#b0b0b0] text-[15px] leading-[1.6]"
			: "mt-2 mb-0 text-[#555555] text-[15px] leading-[1.6]",
		btn: isDark
			? "rounded-xl bg-[#edece1] px-6 py-3 text-center font-bold font-mono text-[12px] text-black uppercase tracking-wider no-underline"
			: "rounded-xl bg-[#0e0e0e] px-6 py-3 text-center font-bold font-mono text-[12px] text-white uppercase tracking-wider no-underline",
		footerText: isDark
			? "mt-8 text-[#707070] text-[13px] leading-[1.6]"
			: "mt-8 text-[#888888] text-[13px] leading-[1.6]",
		footerHr: isDark ? "my-10 border-[#222222]" : "my-10 border-[#e0e0e0]",
	};

	return (
		<Html>
			<Head />
			<Preview>
				{isPaused
					? `Your ${metric} reached ${formatRate(rate)}, so we paused sending for ${organizationName}.`
					: `Your ${metric} is ${formatRate(rate)}. Sending pauses automatically at ${formatRate(limit)}.`}
			</Preview>
			<Tailwind>
				<Body className={cls.body}>
					<Wrapper baseUrl={baseUrl} theme={theme}>
						<Text className={cls.label}>
							{isPaused
								? "Sending paused"
								: `Deliverability · Warning ${level} of 3`}
						</Text>

						<Heading
							className={cls.heading}
							style={{ fontFamily: "Georgia, serif" }}
						>
							{headingLead}{" "}
							<span className={cls.headingMuted}>{headingMuted}</span>
						</Heading>

						<Hr className={cls.hr} />

						<Text className={cls.salutation}>
							Hey, <strong>{firstName}.</strong>
						</Text>

						<Text className={cls.bodyText}>
							In the last 24 hours, {count.toLocaleString("en-US")} of the{" "}
							{sent.toLocaleString("en-US")} emails sent by{" "}
							<strong>{organizationName}</strong>{" "}
							{isComplaint ? "were reported as spam" : "bounced"}.{" "}
							{isPaused
								? `That's above our ${formatRate(limit)} limit, so we've paused sending for your account to protect your domain's reputation and the shared IPs other senders rely on.`
								: `We pause sending automatically at ${formatRate(limit)} to protect your domain's reputation. You can still send right now, but please act before you reach the limit.`}
						</Text>

						<Section className={cls.rateBox}>
							<Text className={cls.rateText}>{formatRate(rate)}</Text>
							<Text className={cls.rateBadge}>
								{isPaused
									? `${metric} · limit ${formatRate(limit)}`
									: `${metric} · pauses at ${formatRate(limit)}`}
							</Text>
						</Section>

						{isPaused && pausedUntil ? (
							<Text className={cls.bodyText}>
								Sending resumes automatically on <strong>{pausedUntil}</strong>.
								Until then, API, SMTP, campaign and automation sends are
								rejected. Each repeat pause lasts longer, so please clean up
								your list before sending again.
							</Text>
						) : null}

						{level === 3 ? (
							<Text className={cls.bodyText}>
								This is our last warning. If your {metric} reaches{" "}
								{formatRate(limit)}, all sending from your account stops until
								the pause expires.
							</Text>
						) : null}

						{!isComplaint && topBouncingDomains.length > 0 ? (
							<>
								<Text className={cls.subheading}>
									Where the bounces are coming from
								</Text>
								{topBouncingDomains.map((d) => (
									<Text key={d.domain} className={cls.listItem}>
										<strong>{d.domain}</strong>:{" "}
										{d.bounced.toLocaleString("en-US")} of{" "}
										{d.sent.toLocaleString("en-US")} bounced (
										{formatRate(d.sent > 0 ? d.bounced / d.sent : 0)})
									</Text>
								))}
							</>
						) : null}

						<Text className={cls.subheading}>How to bring it down</Text>
						{fixes.map((fix) => (
							<Text key={fix} className={cls.listItem}>
								• {fix}
							</Text>
						))}

						<Section className="mt-10">
							<Button className={cls.btn} href={dashboardUrl}>
								{isComplaint ? "View Metrics" : "Review Bounces"}
							</Button>
						</Section>

						<Text className={cls.footerText}>
							Questions, or think this is a mistake? Reply to this email or
							message us from the {appName} dashboard.
						</Text>

						<Hr className={cls.footerHr} />
						<Footer baseUrl={baseUrl} theme={theme} />
					</Wrapper>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default ReputationNoticeEmail;
