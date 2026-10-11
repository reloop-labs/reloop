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
import { Footer } from "../components/footer";
import { Wrapper } from "../components/wrapper";

interface StartupApprovedEmailProps {
	fullName?: string;
	company?: string;
	email?: string;
	baseUrl?: string;
	theme?: "light" | "dark";
}

const defaultBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
	? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
	: "https://reloop.sh";

export const StartupApprovedEmail = ({
	fullName = "there",
	company = "your startup",
	email,
	baseUrl = defaultBaseUrl,
	theme = "light",
}: StartupApprovedEmailProps) => {
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
		bodyText: isDark
			? "mt-4 text-[#b0b0b0] text-[15px] leading-[1.6]"
			: "mt-4 text-[#555555] text-[15px] leading-[1.6]",
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
		footerText: isDark
			? "mt-8 text-[#707070] text-[13px] leading-[1.6]"
			: "mt-8 text-[#888888] text-[13px] leading-[1.6]",
		footerHr: isDark ? "my-10 border-[#222222]" : "my-10 border-[#e0e0e0]",
	};

	const tdBorder = isDark ? "1px solid #222222" : "1px solid #e0e0e0";

	const steps = [
		{
			title: "Create your account",
			desc: email
				? `Sign up with ${email} so we can match your workspace to this approval.`
				: "Sign up with the same email you applied with so we can match your workspace.",
		},
		{
			title: "Send your first email",
			desc: "Create an API key, verify your sending domain, and fire your first transactional send.",
		},
		{
			title: "Claim your credits",
			desc: "Reply to this email once you're in — we'll apply up to $1,000 in credits (valid 12 months) and help with deliverability.",
		},
	];

	return (
		<Html>
			<Head />
			<Preview>Your {appName} for Startups application is approved.</Preview>
			<Tailwind>
				<Body className={cls.body}>
					<Wrapper baseUrl={baseUrl} theme={theme}>
						<Text className={cls.label}>{appName} for Startups</Text>

						<Heading
							className={cls.heading}
							style={{ fontFamily: "Georgia, serif" }}
						>
							You&apos;re in.{" "}
							<span className={cls.headingMuted}>
								Let&apos;s launch your email.
							</span>
						</Heading>

						<Hr className={cls.hr} />

						<Text className={cls.bodyText}>
							Hey <strong>{firstName}</strong>,
						</Text>

						<Text className={cls.bodyText}>
							Great news — <strong>{company}</strong>&apos;s application to{" "}
							{appName} for Startups is approved. You get up to{" "}
							<strong>$1,000 in {appName} Cloud credits</strong>, valid for 12
							months, plus engineer-level deliverability support.
						</Text>

						<Section className={cls.capBox}>
							<Text className={cls.label}>What to do next</Text>

							<table
								width="100%"
								cellPadding="0"
								cellSpacing="0"
								style={{ marginTop: "24px" }}
							>
								{steps.map((item, index) => {
									const isLast = index === steps.length - 1;
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

						<Section className="mt-10">
							<Button className={cls.btn} href={`${baseUrl}/dashboard/signup`}>
								Create your account
							</Button>
						</Section>

						<Text className={cls.footerText}>
							Questions about migration, DNS, or deliverability? Just reply to
							this email — an engineer will help.
						</Text>

						<Hr className={cls.footerHr} />
						<Footer baseUrl={baseUrl} theme={theme} />
					</Wrapper>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default StartupApprovedEmail;
