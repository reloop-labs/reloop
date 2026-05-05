import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Tailwind,
	Text,
} from "react-email";
import * as React from "react";

interface OTPTokenEmailProps {
	otp: string;
	email: string;
	baseUrl: string;
}

export const OTPTokenEmail = ({
	otp = "888888",
	email = "user@example.com",
	baseUrl = "https://reloop.sh",
}: OTPTokenEmailProps) => {
	const url = `${baseUrl}/dashboard/login/verify?email=${encodeURIComponent(
		email,
	)}&otp=${otp}`;

	return (
		<Html>
			<Head />
			<Preview>Your login code for Reloop</Preview>
			<Tailwind>
				<Body className="m-0 bg-[#0e0e0e] p-0 font-sans text-white">
					<Section className="mx-auto mt-[40px] mb-[40px] max-w-[560px] px-6">
						{/* Logo */}
						<Section className="mb-8">
							<Img
								src={`${baseUrl}/web-app-manifest-192x192.png`}
								width="32"
								height="32"
								alt="Reloop Logo"
								style={{ filter: "invert(1)" }}
							/>
						</Section>

						{/* Small Label */}
						<Text className="m-0 font-mono text-[10px] uppercase tracking-[0.2em] text-[#707070]">
							Login Verification
						</Text>

						{/* Main Headline */}
						<Heading
							className="mt-6 mb-8 p-0 font-serif font-normal text-[32px] leading-[1.2] text-white"
							style={{ fontFamily: "Georgia, serif" }}
						>
							Your login code for Reloop.
						</Heading>

						<Hr className="my-8 border-[#222222]" />

						<Text className="text-[15px] leading-[1.6] text-[#b0b0b0]">
							This link and code will only be valid for the next 5 minutes. If
							the link does not work, you can use the login verification code
							directly:
						</Text>

						{/* OTP Block */}
						<Section className="mt-8 rounded-lg border border-solid border-[#222222] py-10 text-center">
							<Text className="m-0 font-mono text-5xl font-medium tracking-[0.2em] text-white">
								{otp}
							</Text>
						</Section>

						{/* CTA Button */}
						<Section className="mt-10">
							<Button
								className="rounded bg-[#edece1] px-6 py-3 text-center font-mono text-[12px] font-bold uppercase tracking-wider text-black no-underline"
								href={url}
							>
								Login to Reloop &rarr;
							</Button>
						</Section>

						<Text className="mt-10 text-[13px] leading-[1.6] text-[#707070]">
							If you didn't request this code, you can safely ignore this email.
						</Text>

						<Hr className="mt-10 mb-8 border-[#222222]" />

						<Text className="text-[15px] leading-[1.6] text-[#b0b0b0]">
							With love,
							<br />
							The Reloop Team
						</Text>

						{/* Footer */}
						<Section className="mt-12 text-[#404040]">
							<Text className="m-0 text-[11px] leading-[1.6]">
								You're receiving this because you signed up at reloop.sh
								<br />
								<Link
									href={`${baseUrl}/unsubscribe`}
									className="text-[#404040] underline"
								>
									Unsubscribe
								</Link>
								{" · "}
								<Link
									href={`${baseUrl}/view-in-browser`}
									className="text-[#404040] underline"
								>
									View in browser
								</Link>
							</Text>
						</Section>
					</Section>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default OTPTokenEmail;

