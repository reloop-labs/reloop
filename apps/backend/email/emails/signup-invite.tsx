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

interface SignupInviteEmailProps {
	inviteeName?: string;
	inviterName: string;
	inviterEmail: string;
	inviteUrl: string;
	inviteCode?: string;
	baseUrl?: string;
	theme?: "light" | "dark";
}

const defaultBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
	? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
	: "https://reloop.sh";

export const SignupInviteEmail = ({
	inviteeName,
	inviterName = "Pranav Patel",
	inviterEmail = "reloop.sh@gmail.com",
	inviteUrl = "https://reloop.sh/dashboard/signup?inviteCode=abc123",
	inviteCode,
	baseUrl = defaultBaseUrl,
	theme = "light",
}: SignupInviteEmailProps) => {
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
		hr: isDark ? "my-8 border-[#222222]" : "my-8 border-[#e0e0e0]",
		bodyText: isDark
			? "mt-4 text-[#b0b0b0] text-[15px] leading-[1.6]"
			: "mt-4 text-[#555555] text-[15px] leading-[1.6]",
		btn: isDark
			? "rounded-xl bg-[#edece1] px-6 py-3 text-center font-bold font-mono text-[12px] text-black uppercase tracking-wider no-underline"
			: "rounded-xl bg-[#0e0e0e] px-6 py-3 text-center font-bold font-mono text-[12px] text-white uppercase tracking-wider no-underline",
		footerText: isDark
			? "mt-8 text-[#707070] text-[13px] leading-[1.6]"
			: "mt-8 text-[#888888] text-[13px] leading-[1.6]",
		link: isDark ? "text-[#edece1] underline" : "text-[#0e0e0e] underline",
		footerHr: isDark ? "my-10 border-[#222222]" : "my-10 border-[#e0e0e0]",
		code: isDark
			? "mt-4 inline-block rounded-lg bg-[#1a1a1a] px-3 py-2 font-mono text-[13px] text-[#edece1]"
			: "mt-4 inline-block rounded-lg bg-[#f5f5f5] px-3 py-2 font-mono text-[13px] text-[#0e0e0e]",
	};

	return (
		<Html>
			<Head />
			<Preview>You're invited to join Reloop</Preview>
			<Tailwind>
				<Body className={cls.body}>
					<Wrapper baseUrl={baseUrl} theme={theme}>
						<Text className={cls.label}>Signup Invitation</Text>

						<Heading
							className={cls.heading}
							style={{ fontFamily: "Georgia, serif" }}
						>
							You're invited to join{" "}
							<span className="font-bold">Reloop.</span>
						</Heading>

						<Hr className={cls.hr} />

						{inviteeName && (
							<Text className={cls.bodyText}>
								Hello, <strong>{inviteeName}.</strong>
							</Text>
						)}

						<Text className={cls.bodyText}>
							<strong>{inviterName}</strong> (<strong>{inviterEmail}</strong>)
							has invited you to create a Reloop account.
						</Text>

						{inviteCode && (
							<Text className={cls.bodyText}>
								Your invite code:{" "}
								<span className={cls.code}>{inviteCode}</span>
							</Text>
						)}

						<Section className="mt-10">
							<Button className={cls.btn} href={inviteUrl}>
								Create your account
							</Button>
						</Section>

						<Text className={cls.footerText}>
							or copy and paste this URL into your browser:{" "}
							<a href={inviteUrl} className={cls.link}>
								{inviteUrl}
							</a>
						</Text>

						<Hr className={cls.footerHr} />

						<Footer baseUrl={baseUrl} theme={theme} />
					</Wrapper>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default SignupInviteEmail;
