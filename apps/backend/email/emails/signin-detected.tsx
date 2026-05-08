import {
	Body,
	Button,
	Head,
	Heading,
	Hr,
	Html,
	Link,
	Preview,
	Section,
	Tailwind,
	Text,
} from "react-email";
import { Footer } from "../components/footer";
import { Wrapper } from "../components/wrapper";

interface SignInDetectedEmailProps {
	fullName: string;
	email: string;
	location: string;
	time: string;
	browser: string;
	device: string;
	ipAddress: string;
	baseUrl?: string;
	theme?: "light" | "dark";
}

const defaultBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
	? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
	: "https://reloop.sh";

export const SignInDetectedEmail = ({
	fullName = "User",
	email = "user@reloop.sh",
	location = "San Francisco, CA",
	time = "May 6, 2026 at 15:27 UTC",
	browser = "Chrome 124 on macOS 15.4",
	device = "MacBook Pro",
	ipAddress = "192.168.1.1",
	baseUrl = defaultBaseUrl,
	theme = "light",
}: SignInDetectedEmailProps) => {
	const firstName = fullName ? fullName.split(" ").at(0) : "User";

	const isDark = theme === "dark";

	// Full class strings — must be static so Tailwind JIT can detect them
	const cls = {
		body: isDark
			? "m-0 p-0 bg-[#0e0e0e] text-white font-sans"
			: "m-0 p-0 bg-white text-[#0e0e0e] font-sans",
		label:
			"m-0 font-mono font-medium text-[#707070] text-[12px] uppercase tracking-[0.2em]",
		heading: isDark
			? "mt-6 mb-8 p-0 font-normal text-[32px] text-white leading-[1.2]"
			: "mt-6 mb-8 p-0 font-normal text-[32px] text-[#0e0e0e] leading-[1.2]",
		hr: isDark ? "my-8 border-[#222222]" : "my-8 border-[#e0e0e0]",
		salutation: isDark
			? "m-0 text-[15px] text-white leading-[1.6]"
			: "m-0 text-[15px] text-[#0e0e0e] leading-[1.6]",
		bodyText: isDark
			? "m-0 mt-4 text-[#b0b0b0] text-[15px] leading-[1.6]"
			: "m-0 mt-4 text-[#555555] text-[15px] leading-[1.6]",
		detailsBox: isDark
			? "mt-8 rounded-2xl border border-[#222222] border-solid px-8 py-4"
			: "mt-8 rounded-2xl border border-[#e0e0e0] border-solid px-8 py-4",
		detailLabel: isDark
			? "m-0 font-semibold text-white text-[15px]"
			: "m-0 font-semibold text-[#0e0e0e] text-[15px]",
		detailValue: isDark
			? "m-0 text-[#b0b0b0] text-[15px]"
			: "m-0 text-[#555555] text-[15px]",
		alertBox: isDark
			? "mt-8 rounded-2xl border border-[#333333] border-solid bg-[#1a1a1a] p-6"
			: "mt-8 rounded-2xl border border-[#e0e0e0] border-solid bg-[#f9f9f9] p-6",
		alertHeading: isDark
			? "m-0 font-semibold text-white text-[16px]"
			: "m-0 font-semibold text-[#0e0e0e] text-[16px]",
		alertText: isDark
			? "m-0 mt-3 text-[#b0b0b0] text-[15px] leading-[1.6]"
			: "m-0 mt-3 text-[#555555] text-[15px] leading-[1.6]",
		link: isDark ? "text-[#edece1] underline" : "text-[#0e0e0e] underline",
		btn: isDark
			? "rounded-xl bg-[#edece1] px-6 py-3 text-center font-bold font-mono text-[12px] text-black uppercase tracking-wider no-underline"
			: "rounded-xl bg-[#0e0e0e] px-6 py-3 text-center font-bold font-mono text-[12px] text-white uppercase tracking-wider no-underline",
		footerText: isDark
			? "mt-8 text-[#707070] text-[13px] leading-[1.6]"
			: "mt-8 text-[#888888] text-[13px] leading-[1.6]",
		footerHr: isDark ? "my-10 border-[#222222]" : "my-10 border-[#e0e0e0]",
	};

	// Table cell borders can't use Tailwind so we keep a single derived value
	const tdBorder = isDark ? "1px solid #222222" : "1px solid #e0e0e0";

	return (
		<Html>
			<Head />
			<Preview>New sign-in detected on your Reloop account</Preview>
			<Tailwind>
				<Body className={cls.body}>
					<Wrapper baseUrl={baseUrl} theme={theme}>
						{/* Small Label */}
						<Text className={cls.label}>Security Alert</Text>

						{/* Main Headline */}
						<Heading
							className={cls.heading}
							style={{ fontFamily: "Georgia, serif" }}
						>
							New sign-in detected on your Reloop account.
						</Heading>

						<Hr className={cls.hr} />

						{/* Salutation */}
						<Text className={cls.salutation}>
							Hello, <strong>{firstName}.</strong>
						</Text>

						<Text className={cls.bodyText}>
							Your Reloop account <strong>{email}</strong> was recently
							signed-in from a new location, device or browser:
						</Text>

						{/* Sign-in Details Box */}
						<Section className={cls.detailsBox}>
							<table
								width="100%"
								cellPadding="0"
								cellSpacing="0"
								role="presentation"
								border={0}
							>
								<tr>
									<td
										style={{
											borderBottom: tdBorder,
											paddingBottom: "16px",
											verticalAlign: "top",
											width: "110px",
										}}
									>
										<Text className={cls.detailLabel}>Location</Text>
									</td>
									<td
										style={{
											borderBottom: tdBorder,
											paddingBottom: "16px",
											verticalAlign: "top",
										}}
									>
										<Text className={cls.detailValue}>{location}</Text>
									</td>
								</tr>
								<tr>
									<td
										style={{
											borderBottom: tdBorder,
											paddingTop: "16px",
											paddingBottom: "16px",
											verticalAlign: "top",
											width: "110px",
										}}
									>
										<Text className={cls.detailLabel}>Time</Text>
									</td>
									<td
										style={{
											borderBottom: tdBorder,
											paddingTop: "16px",
											paddingBottom: "16px",
											verticalAlign: "top",
										}}
									>
										<Text className={cls.detailValue}>{time}</Text>
									</td>
								</tr>
								<tr>
									<td
										style={{
											borderBottom: tdBorder,
											paddingTop: "16px",
											paddingBottom: "16px",
											verticalAlign: "top",
											width: "110px",
										}}
									>
										<Text className={cls.detailLabel}>Browser</Text>
									</td>
									<td
										style={{
											borderBottom: tdBorder,
											paddingTop: "16px",
											paddingBottom: "16px",
											verticalAlign: "top",
										}}
									>
										<Text className={cls.detailValue}>{browser}</Text>
									</td>
								</tr>
								<tr>
									<td
										style={{
											borderBottom: tdBorder,
											paddingTop: "16px",
											paddingBottom: "16px",
											verticalAlign: "top",
											width: "110px",
										}}
									>
										<Text className={cls.detailLabel}>Device</Text>
									</td>
									<td
										style={{
											borderBottom: tdBorder,
											paddingTop: "16px",
											paddingBottom: "16px",
											verticalAlign: "top",
										}}
									>
										<Text className={cls.detailValue}>{device}</Text>
									</td>
								</tr>
								<tr>
									<td
										style={{
											paddingTop: "16px",
											verticalAlign: "top",
											width: "110px",
										}}
									>
										<Text className={cls.detailLabel}>IP</Text>
									</td>
									<td
										style={{
											paddingTop: "16px",
											verticalAlign: "top",
										}}
									>
										<Text className={cls.detailValue}>{ipAddress}</Text>
									</td>
								</tr>
							</table>
						</Section>

						{/* Security Alert Box */}
						<Section className={cls.alertBox}>
							<Text className={cls.alertHeading}>
								Don&apos;t recognize this activity?
							</Text>
							<Text className={cls.alertText}>
								Review your{" "}
								<Link
									href={`${baseUrl}/dashboard/activity`}
									className={cls.link}
								>
									recent activity
								</Link>{" "}
								and{" "}
								<Link
									href={`${baseUrl}/dashboard/settings/security`}
									className={cls.link}
								>
									security settings
								</Link>{" "}
								now.
							</Text>
							<Text className={cls.alertText}>
								This alert triggers when we detect a sign-in from an
								unrecognized location, device, or browser. Common causes:
								traveling, VPN or Private Relay, or a new browser.
							</Text>
						</Section>

						{/* CTA Button */}
						<Section className="mt-10">
							<Button
								className={cls.btn}
								href={`${baseUrl}/dashboard/settings/security`}
							>
								Review Security Settings
							</Button>
						</Section>

						<Text className={cls.footerText}>
							If this was you, no action is needed — you can safely ignore this
							email.
						</Text>

						<Hr className={cls.footerHr} />

						<Footer baseUrl={baseUrl} theme={theme} />
					</Wrapper>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default SignInDetectedEmail;
