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

interface OTPTokenEmailProps {
	otp: string;
	email: string;
	baseUrl: string;
	theme?: "light" | "dark";
}

export const OTPTokenEmail = ({
	otp = "888888",
	email = "user@example.com",
	baseUrl = "https://reloop.sh",
	theme = "light",
}: OTPTokenEmailProps) => {
	const url = `${baseUrl}/dashboard/login/verify?email=${encodeURIComponent(
		email,
	)}&otp=${otp}`;

	const isDark = theme === "dark";

	// Full class strings — must be static so Tailwind JIT can detect them
	const cls = {
		body: isDark
			? "m-0 p-0 bg-[#0e0e0e] text-white font-sans"
			: "m-0 p-0 bg-white text-[#0e0e0e] font-sans",
		logo: isDark ? "invert" : "",
		label: "font-medium text-[#707070] text-[10px] uppercase tracking-[0.2em]",
		heading: isDark
			? "mt-6 mb-8 p-0 font-normal text-[32px] text-white leading-[1.2]"
			: "mt-6 mb-8 p-0 font-normal text-[32px] text-[#0e0e0e] leading-[1.2]",
		hr: isDark ? "my-8 border-[#222222]" : "my-8 border-[#e0e0e0]",
		bodyText: isDark
			? "text-[#b0b0b0] text-[15px] leading-[1.6]"
			: "text-[#555555] text-[15px] leading-[1.6]",
		otpBox: isDark
			? "mt-8 rounded-2xl border border-[#222222] border-solid py-10 text-center"
			: "mt-8 rounded-2xl border border-[#e0e0e0] border-solid py-10 text-center",
		otpText: isDark
			? "m-0 font-medium font-mono text-5xl text-white tracking-[0.2em]"
			: "m-0 font-medium font-mono text-5xl text-[#0e0e0e] tracking-[0.2em]",
		btn: isDark
			? "rounded-xl bg-[#edece1] px-6 py-3 text-center font-bold text-[12px] text-black uppercase tracking-wider"
			: "rounded-xl bg-[#0e0e0e] px-6 py-3 text-center font-bold text-[12px] text-white uppercase tracking-wider",
		footerText: isDark
			? "mt-8 text-[#707070] text-[13px] leading-[1.6]"
			: "mt-8 text-[#888888] text-[13px] leading-[1.6]",
		footerHr: isDark ? "my-10 border-[#222222]" : "my-10 border-[#e0e0e0]",
	};

	return (
		<Html>
			<Head />
			<Preview>Your login code for Reloop is {otp}</Preview>
			<Tailwind>
				<Body className={cls.body}>
					<Section className="mx-auto mt-[40px] mb-[40px] max-w-[560px] px-6">
						{/* Logo */}
						<Section className="mb-2">
							<Img
								src={`${baseUrl}/web-app-manifest-192x192.png`}
								width="52"
								height="52"
								alt="Reloop Logo"
								className={cls.logo}
							/>
						</Section>

						{/* Small Label */}
						<Text className={cls.label}>Login Verification</Text>

						{/* Main Headline */}
						<Heading
							className={cls.heading}
							style={{ fontFamily: "Georgia, serif" }}
						>
							Your login code for Reloop.
						</Heading>

						<Hr className={cls.hr} />

						<Text className={cls.bodyText}>
							This link and code will only be valid for the next 5 minutes. If
							the link does not work, you can use the login verification code
							directly:
						</Text>

						{/* OTP Block */}
						<Section className={cls.otpBox}>
							<Text className={cls.otpText}>{otp}</Text>
						</Section>

						{/* CTA Button */}
						<Section className="mt-10">
							<Button className={cls.btn} href={url}>
								Login to Reloop
							</Button>
						</Section>

						<Text className={cls.footerText}>
							If you didn't request this code, you can safely ignore this email.
						</Text>

						<Hr className={cls.footerHr} />

						<Footer baseUrl={baseUrl} />
					</Section>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default OTPTokenEmail;
