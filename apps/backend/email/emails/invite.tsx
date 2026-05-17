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
	inviteeName?: string;
	inviterName: string;
	inviterEmail: string;
	teamName: string;
	inviteUrl: string;
	baseUrl?: string;
	theme?: "light" | "dark";
}

const defaultBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
	? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
	: "https://reloop.sh";

export const InviteEmail = ({
	inviteeName,
	inviterName = "Pranav Patel",
	inviterEmail = "pranav@reloop.sh",
	teamName = "Reloop",
	inviteUrl = "https://reloop.sh/invite/abc123",
	baseUrl = defaultBaseUrl,
	theme = "light",
}: InviteEmailProps) => {
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
	};

	return (
		<Html>
			<Head />
			<Preview>Join {teamName} on Reloop</Preview>
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
							Join <span className="font-bold">{teamName}</span> on{" "}
							<span className="font-bold">Reloop.</span>
						</Heading>

						<Hr className={cls.hr} />

						{/* Salutation */}
						{inviteeName && (
							<Text className={cls.bodyText}>
								Hello, <strong>{inviteeName}.</strong>
							</Text>
						)}

						{/* Body Text */}
						<Text className={cls.bodyText}>
							<strong>{inviterName}</strong> (<strong>{inviterEmail}</strong>)
							has invited you to the <strong>{teamName}</strong> team on{" "}
							<strong>Reloop</strong>.
						</Text>

						{/* CTA Button */}
						<Section className="mt-10">
							<Button className={cls.btn} href={inviteUrl}>
								Join the team
							</Button>
						</Section>

						{/* Fallback URL */}
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

export default InviteEmail;
