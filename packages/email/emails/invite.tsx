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

interface InviteEmailProps {
	inviteeName: string;
	inviterName: string;
	inviterEmail: string;
	teamName: string;
	role: string;
	inviteUrl: string;
	expiresInHours?: number;
	baseUrl?: string;
	theme?: "light" | "dark";
}

const defaultBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
	? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
	: "https://reloop.sh";

export const InviteEmail = ({
	inviteeName = "Alex",
	inviterName = "Pranav Patel",
	inviterEmail = "pranav@reloop.sh",
	teamName = "Reloop",
	role = "Member",
	inviteUrl = "https://reloop.sh/invite/abc123",
	expiresInHours = 48,
	baseUrl = defaultBaseUrl,
	theme = "light",
}: InviteEmailProps) => {
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
		inviterBox: isDark
			? "mt-8 rounded-2xl border border-[#222222] border-solid p-8"
			: "mt-8 rounded-2xl border border-[#e0e0e0] border-solid p-8",
		inviterName: isDark
			? "m-0 font-semibold text-white text-[16px]"
			: "m-0 font-semibold text-[#0e0e0e] text-[16px]",
		inviterEmail: isDark
			? "mt-1 m-0 font-mono text-[#707070] text-[13px]"
			: "mt-1 m-0 font-mono text-[#707070] text-[13px]",
		roleRow: isDark
			? "mt-6 rounded-xl bg-[#1a1a1a] border border-[#222222] border-solid px-6 py-4"
			: "mt-6 rounded-xl bg-[#f5f5f5] border border-[#e0e0e0] border-solid px-6 py-4",
		roleLabel: isDark
			? "m-0 font-mono text-[#707070] text-[11px] uppercase tracking-[0.15em]"
			: "m-0 font-mono text-[#707070] text-[11px] uppercase tracking-[0.15em]",
		roleValue: isDark
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

	return (
		<Html>
			<Head />
			<Preview>
				{inviterName} invited you to join {teamName} on Reloop
			</Preview>
			<Tailwind>
				<Body className={cls.body}>
					<Wrapper baseUrl={baseUrl} theme={theme}>
						{/* Small Label */}
						<Text className={cls.label}>Team Invitation</Text>

						{/* Main Headline */}
						<Heading
							className={cls.heading}
							style={{ fontFamily: "Georgia, serif" }}
						>
							You&apos;ve been invited to join{" "}
							<span className={cls.headingMuted}>{teamName}.</span>
						</Heading>

						<Hr className={cls.hr} />

						{/* Salutation */}
						<Text className={cls.salutation}>
							Hey, <strong>{inviteeName}.</strong>
						</Text>

						<Text className={cls.bodyText}>
							<strong>{inviterName}</strong> has invited you to collaborate on{" "}
							<strong>{teamName}</strong> in Reloop. Accept the invitation below
							to get started.
						</Text>

						{/* Inviter + Role Card */}
						<Section className={cls.inviterBox}>
							<Text className={cls.label}>Invited by</Text>
							<Text className={cls.inviterName}>{inviterName}</Text>
							<Text className={cls.inviterEmail}>{inviterEmail}</Text>

							<Section className={cls.roleRow}>
								<table width="100%" cellPadding="0" cellSpacing="0">
									<tr>
										<td style={{ verticalAlign: "top" }}>
											<Text className={cls.roleLabel}>Team</Text>
											<Text className={cls.roleValue}>{teamName}</Text>
										</td>
										<td
											style={{
												verticalAlign: "top",
												textAlign: "right",
											}}
										>
											<Text className={cls.roleLabel}>Role</Text>
											<Text className={cls.roleValue}>{role}</Text>
										</td>
									</tr>
								</table>
							</Section>
						</Section>

						{/* CTA Button */}
						<Section className="mt-10">
							<Button className={cls.btn} href={inviteUrl}>
								Accept Invitation
							</Button>
						</Section>

						<Text className={cls.bodyText}>
							This invitation will expire in{" "}
							<strong>{expiresInHours} hours</strong>. If you weren&apos;t
							expecting this, you can safely ignore this email.
						</Text>

						<Hr className={cls.footerHr} />

						<Footer baseUrl={baseUrl} theme={theme} />
					</Wrapper>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default InviteEmail;
