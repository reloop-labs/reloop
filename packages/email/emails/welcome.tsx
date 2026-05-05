import {
	Body,
	Button,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Preview,
	Section,
	Tailwind,
	Text,
} from "react-email";
import { Footer } from "../components/footer";

interface WelcomeEmailProps {
	fullName: string;
	baseUrl?: string;
	theme?: "light" | "dark";
}

const defaultBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
	? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
	: "https://reloop.sh";

export const WelcomeEmail = ({
	fullName = "User",
	baseUrl = defaultBaseUrl,
	theme = "light",
}: WelcomeEmailProps) => {
	const firstName = fullName ? fullName.split(" ").at(0) : "";
	const previewText = `Welcome to Reloop, ${firstName}! Building software is easy. Sending emails shouldn't be hard.`;

	const isDark = theme === "dark";

	// Full class strings — must be static so Tailwind JIT can detect them
	const cls = {
		body: isDark
			? "m-0 p-0 bg-[#0e0e0e] text-white font-sans"
			: "m-0 p-0 bg-white text-[#0e0e0e] font-sans",
		logo: isDark ? "invert" : "",
		label: isDark
			? "m-0 font-mono font-medium text-[#707070] text-[10px] uppercase tracking-[0.2em]"
			: "m-0 font-mono font-medium text-[#707070] text-[10px] uppercase tracking-[0.2em]",
		heading: isDark
			? "mt-6 mb-8 p-0 font-normal font-serif text-[32px] text-white leading-[1.2]"
			: "mt-6 mb-8 p-0 font-normal font-serif text-[32px] text-[#0e0e0e] leading-[1.2]",
		headingMuted: "text-[#707070]",
		hr: isDark ? "my-8 border-[#222222]" : "my-8 border-[#e0e0e0]",
		salutation: isDark
			? "text-[15px] text-white leading-[1.6]"
			: "text-[15px] text-[#0e0e0e] leading-[1.6]",
		bodyText: isDark
			? "mt-4 text-[#b0b0b0] text-[15px] leading-[1.6]"
			: "mt-4 text-[#555555] text-[15px] leading-[1.6]",
		missionBox: isDark
			? "mt-10 mb-10 border-[#222222] border-l border-solid pl-6"
			: "mt-10 mb-10 border-[#e0e0e0] border-l border-solid pl-6",
		missionQuote: isDark
			? "mt-4 font-serif text-[18px] text-white italic leading-[1.6]"
			: "mt-4 font-serif text-[18px] text-[#0e0e0e] italic leading-[1.6]",
		capBox: isDark
			? "mt-10 rounded-lg border border-[#222222] border-solid p-8"
			: "mt-10 rounded-lg border border-[#e0e0e0] border-solid p-8",
		rowNum: "m-0 font-mono text-[#404040] text-[10px]",
		rowTitle: isDark
			? "m-0 font-semibold text-white"
			: "m-0 font-semibold text-[#0e0e0e]",
		rowDesc: "mt-1 text-[#707070] text-[13px]",
		tdBorderDark: "1px solid #222222",
		tdBorderLight: "1px solid #e0e0e0",
		btn: isDark
			? "rounded bg-[#edece1] px-6 py-3 text-center font-bold font-mono text-[12px] text-black uppercase tracking-wider no-underline"
			: "rounded bg-[#0e0e0e] px-6 py-3 text-center font-bold font-mono text-[12px] text-white uppercase tracking-wider no-underline",
		closingText: isDark
			? "mt-10 text-[#b0b0b0] text-[15px] leading-[1.6]"
			: "mt-10 text-[#555555] text-[15px] leading-[1.6]",
		footerHr: isDark
			? "mt-10 mb-8 border-[#222222]"
			: "mt-10 mb-8 border-[#e0e0e0]",
		signOff: isDark
			? "text-[#b0b0b0] text-[15px] leading-[1.6]"
			: "text-[#555555] text-[15px] leading-[1.6]",
	};

	// Table cell borders can't use Tailwind so we keep a single derived value
	const tdBorder = isDark ? "1px solid #222222" : "1px solid #e0e0e0";

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			<Tailwind>
				<Body className={cls.body}>
					<Section className="mx-auto mt-[40px] mb-[40px] max-w-[560px] px-6">
						{/* Logo */}
						<Section className="mb-8">
							<Img
								src={`${baseUrl}/web-app-manifest-192x192.png`}
								width="32"
								height="32"
								alt="Reloop Logo"
								className={cls.logo}
							/>
						</Section>

						{/* Small Label */}
						<Text className={cls.label}>Welcome to Reloop</Text>

						{/* Main Headline */}
						<Heading
							className={cls.heading}
							style={{ fontFamily: "Georgia, serif" }}
						>
							Building software is easy.
							<br />
							<span className={cls.headingMuted}>
								Sending emails shouldn't be hard.
							</span>
						</Heading>

						<Hr className={cls.hr} />

						{/* Salutation & Intro */}
						<Text className={cls.salutation}>Hi {firstName},</Text>
						<Text className={cls.bodyText}>
							Welcome aboard. We're genuinely glad you're here.
						</Text>
						<Text className={cls.bodyText}>
							A new era of software is being built — AI agents that run
							autonomously, indie developers shipping products overnight, and
							marketing teams that move at startup speed. The builders are
							getting faster. The tools around them haven't kept up.
						</Text>
						<Text className={cls.bodyText}>
							That's what Reloop is here to fix.
						</Text>

						{/* Mission Section */}
						<Section className={cls.missionBox}>
							<Text className={cls.label}>Our Mission</Text>
							<Text className={cls.missionQuote}>
								"Open-source email infrastructure built for AI agents, marketing
								teams, and developers — so you can focus on what you're
								building, not on how to reach the people who need it."
							</Text>
						</Section>

						<Text className={cls.bodyText}>
							We've seen the next generation of companies — smaller teams,
							bigger ambitions. They'll be powered by AI, built in the open, and
							run by founders who care more about their product than their
							billing stack.
						</Text>
						<Text className={cls.bodyText}>
							Reloop gives them the email layer they deserve: reliable,
							composable, and transparent — from transactional sends to
							AI-triggered sequences to developer APIs.
						</Text>

						{/* Capabilities Box */}
						<Section className={cls.capBox}>
							<Text className={cls.label}>What you can do with Reloop</Text>

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
											paddingBottom: "24px",
										}}
									>
										<Text className={cls.rowTitle}>AI Agents</Text>
										<Text className={cls.rowDesc}>
											Trigger, compose, and send emails programmatically — your
											agents communicate like humans.
										</Text>
									</td>
								</tr>
								<tr>
									<td
										style={{
											verticalAlign: "top",
											width: "32px",
											paddingTop: "24px",
										}}
									>
										<Text className={cls.rowNum}>02</Text>
									</td>
									<td
										style={{
											borderBottom: tdBorder,
											paddingTop: "24px",
											paddingBottom: "24px",
										}}
									>
										<Text className={cls.rowTitle}>Marketing Teams</Text>
										<Text className={cls.rowDesc}>
											Campaign infrastructure with no vendor lock-in. Open,
											auditable, and fast to ship.
										</Text>
									</td>
								</tr>
								<tr>
									<td
										style={{
											verticalAlign: "top",
											width: "32px",
											paddingTop: "24px",
										}}
									>
										<Text className={cls.rowNum}>03</Text>
									</td>
									<td style={{ paddingTop: "24px" }}>
										<Text className={cls.rowTitle}>Developers</Text>
										<Text className={cls.rowDesc}>
											Open-source APIs and SDKs. Self-host or use our cloud. You
											own your stack.
										</Text>
									</td>
								</tr>
							</table>
						</Section>

						{/* CTA Button */}
						<Section className="mt-10">
							<Button className={cls.btn} href={`${baseUrl}/dashboard`}>
								Get Started &rarr;
							</Button>
						</Section>

						<Text className={cls.closingText}>
							We're building Reloop in the open. That means you get a voice in
							what gets built next. If you have questions, feedback, or just
							want to say hi — reply to this email. We read everything.
						</Text>

						<Hr className={cls.footerHr} />

						<Text className={cls.signOff}>
							With love,
							<br />
							The Reloop Team
						</Text>

						<Footer baseUrl={baseUrl} />
					</Section>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default WelcomeEmail;
