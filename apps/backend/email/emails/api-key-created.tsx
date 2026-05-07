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

interface ApiKeyCreatedEmailProps {
	fullName: string;
	keyName: string;
	keyPrefix: string;
	createdAt: string;
	ipAddress: string;
	location: string;
	manageKeysUrl: string;
	baseUrl?: string;
	theme?: "light" | "dark";
}

const defaultBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
	? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
	: "https://reloop.sh";

export const ApiKeyCreatedEmail = ({
	fullName = "User",
	keyName = "Production Key",
	keyPrefix = "rl_live_abc1",
	createdAt = "May 6, 2026 at 15:27 UTC",
	ipAddress = "192.168.1.1",
	location = "San Francisco, CA",
	manageKeysUrl = "https://reloop.sh/dashboard/settings/api-keys",
	baseUrl = defaultBaseUrl,
	theme = "light",
}: ApiKeyCreatedEmailProps) => {
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
		keyBox: isDark
			? "mt-8 rounded-2xl border border-[#222222] border-solid py-10 text-center"
			: "mt-8 rounded-2xl border border-[#e0e0e0] border-solid py-10 text-center",
		keyText: isDark
			? "m-0 font-medium font-mono text-[20px] text-white tracking-[0.08em]"
			: "m-0 font-medium font-mono text-[20px] text-[#0e0e0e] tracking-[0.08em]",
		keyLabel: isDark
			? "mt-3 m-0 font-mono text-[#707070] text-[12px] uppercase tracking-[0.15em]"
			: "mt-3 m-0 font-mono text-[#707070] text-[12px] uppercase tracking-[0.15em]",
		detailsBox: isDark
			? "mt-8 rounded-2xl border border-[#222222] border-solid p-8"
			: "mt-8 rounded-2xl border border-[#e0e0e0] border-solid p-8",
		detailLabel: isDark
			? "m-0 font-mono text-[#707070] text-[11px] uppercase tracking-[0.15em]"
			: "m-0 font-mono text-[#707070] text-[11px] uppercase tracking-[0.15em]",
		detailValue: isDark
			? "m-0 mt-1 font-semibold text-white text-[15px]"
			: "m-0 mt-1 font-semibold text-[#0e0e0e] text-[15px]",
		btn: isDark
			? "rounded-xl bg-[#edece1] px-6 py-3 text-center font-bold font-mono text-[12px] text-black uppercase tracking-wider no-underline"
			: "rounded-xl bg-[#0e0e0e] px-6 py-3 text-center font-bold font-mono text-[12px] text-white uppercase tracking-wider no-underline",
		footerHr: isDark ? "my-10 border-[#222222]" : "my-10 border-[#e0e0e0]",
	};

	const tdBorder = isDark ? "1px solid #222222" : "1px solid #e0e0e0";

	return (
		<Html>
			<Head />
			<Preview>A new API key was created on your Reloop account.</Preview>
			<Tailwind>
				<Body className={cls.body}>
					<Wrapper baseUrl={baseUrl} theme={theme}>
						<Text className={cls.label}>Security Alert</Text>

						<Heading
							className={cls.heading}
							style={{ fontFamily: "Georgia, serif" }}
						>
							A new API key was{" "}
							<span className={cls.headingMuted}>created on your account.</span>
						</Heading>

						<Hr className={cls.hr} />

						<Text className={cls.salutation}>
							Hey, <strong>{firstName}.</strong>
						</Text>

						<Text className={cls.bodyText}>
							A new API key named <strong>&ldquo;{keyName}&rdquo;</strong> was
							just created on your Reloop account. If this was you, no action is
							needed.
						</Text>

						{/* Key Prefix Display */}
						<Section className={cls.keyBox}>
							<Text className={cls.keyText}>{keyPrefix}••••••••</Text>
							<Text className={cls.keyLabel}>{keyName}</Text>
						</Section>

						{/* Details */}
						<Section className={cls.detailsBox}>
							<table width="100%" cellPadding="0" cellSpacing="0">
								<tr>
									<td
										style={{
											borderBottom: tdBorder,
											paddingBottom: "16px",
											verticalAlign: "top",
										}}
									>
										<Text className={cls.detailLabel}>Created At</Text>
										<Text className={cls.detailValue}>{createdAt}</Text>
									</td>
									<td
										style={{
											borderBottom: tdBorder,
											paddingBottom: "16px",
											verticalAlign: "top",
											textAlign: "right",
										}}
									>
										<Text className={cls.detailLabel}>Location</Text>
										<Text className={cls.detailValue}>{location}</Text>
									</td>
								</tr>
								<tr>
									<td
										colSpan={2}
										style={{ paddingTop: "16px", verticalAlign: "top" }}
									>
										<Text className={cls.detailLabel}>IP Address</Text>
										<Text className={cls.detailValue}>{ipAddress}</Text>
									</td>
								</tr>
							</table>
						</Section>

						<Section className="mt-10">
							<Button className={cls.btn} href={manageKeysUrl}>
								Manage API Keys
							</Button>
						</Section>

						<Text className={cls.bodyText}>
							If you didn&apos;t create this key, revoke it immediately from
							your API keys settings and contact our support team.
						</Text>

						<Hr className={cls.footerHr} />
						<Footer baseUrl={baseUrl} theme={theme} />
					</Wrapper>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default ApiKeyCreatedEmail;
