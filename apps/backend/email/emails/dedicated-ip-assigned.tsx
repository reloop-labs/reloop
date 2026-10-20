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

interface DedicatedIpAssignedEmailProps {
	fullName?: string | null;
	organizationName: string;
	address: string;
	hostname: string;
	/** Null when the IP was assigned without a warmup. */
	warmup?: {
		day: number;
		totalDays: number;
		overflow: "shared" | "defer";
	} | null;
	dashboardUrl: string;
	baseUrl?: string;
	theme?: "light" | "dark";
}

export const DedicatedIpAssignedEmail = ({
	fullName = "User",
	organizationName = "Acme",
	address = "203.0.113.10",
	hostname = "smtp.example.com",
	warmup = { day: 1, totalDays: 42, overflow: "shared" },
	dashboardUrl = `${defaultBaseUrl}/dashboard/settings/dedicated-ip`,
	baseUrl = defaultBaseUrl,
	theme = "light",
}: DedicatedIpAssignedEmailProps) => {
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
		ipBox: isDark
			? "mt-8 rounded-2xl border border-[#222222] border-solid py-10 text-center"
			: "mt-8 rounded-2xl border border-[#e0e0e0] border-solid py-10 text-center",
		ipText: isDark
			? "m-0 font-medium font-mono text-[22px] text-white tracking-[0.05em]"
			: "m-0 font-medium font-mono text-[22px] text-[#0e0e0e] tracking-[0.05em]",
		ipBadge:
			"mt-3 m-0 font-mono text-[12px] text-[#707070] uppercase tracking-[0.15em]",
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
				{`${organizationName} now sends from its own dedicated IP, ${address}.`}
			</Preview>
			<Tailwind>
				<Body className={cls.body}>
					<Wrapper baseUrl={baseUrl} theme={theme}>
						<Text className={cls.label}>Dedicated IP</Text>

						<Heading
							className={cls.heading}
							style={{ fontFamily: "Georgia, serif" }}
						>
							You have a new IP{" "}
							<span className={cls.headingMuted}>all to yourself.</span>
						</Heading>

						<Hr className={cls.hr} />

						<Text className={cls.salutation}>
							Hey, <strong>{firstName}.</strong>
						</Text>

						<Text className={cls.bodyText}>
							<strong>{organizationName}</strong> now has its own dedicated
							sending IP. From now on, all email from {organizationName} is sent
							through this IP, so your sender reputation is yours alone.
						</Text>

						<Section className={cls.ipBox}>
							<Text className={cls.ipText}>{address}</Text>
							<Text className={cls.ipBadge}>{hostname}</Text>
						</Section>

						{warmup ? (
							<Text className={cls.bodyText}>
								We&apos;re warming the IP up gradually over {warmup.totalDays}{" "}
								days (today is day {Math.max(warmup.day, 1)}) so inbox providers
								learn to trust it. Daily volume on the IP ramps up step by step;{" "}
								{warmup.overflow === "shared"
									? "anything above the day's limit is sent through our shared pool, so nothing is delayed."
									: "anything above the day's limit is queued and sent as capacity frees up."}
							</Text>
						) : null}

						<Text className={cls.bodyText}>
							There&apos;s nothing you need to do. You can follow the progress
							in your dashboard.
						</Text>

						<Section className="mt-10">
							<Button className={cls.btn} href={dashboardUrl}>
								View Dedicated IP
							</Button>
						</Section>

						<Text className={cls.footerText}>
							Questions? Just reply to this email or message us from the{" "}
							{appName} dashboard.
						</Text>

						<Hr className={cls.footerHr} />
						<Footer baseUrl={baseUrl} theme={theme} />
					</Wrapper>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default DedicatedIpAssignedEmail;
