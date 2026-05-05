import * as React from "react";
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
import { Footer } from "../components/footer";

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
						<Section className="mb-2">
							<Img
								src={`${baseUrl}/web-app-manifest-192x192.png`}
								width="52"
								height="52"
								alt="Reloop Logo"
								style={{ filter: "invert(1)" }}
							/>
						</Section>

						{/* Small Label */}
						<Text className="font-medium text-[#707070] text-[10px] uppercase tracking-[0.2em]">
							Login Verification
						</Text>

						{/* Main Headline */}
						<Heading
							className="mt-6 mb-8 p-0 font-normal font-serif text-[32px] text-white leading-[1.2]"
							style={{ fontFamily: "Georgia, serif" }}
						>
							Your login code for Reloop.
						</Heading>

						<Hr className="my-8 border-[#222222]" />

						<Text className="text-[#b0b0b0] text-[15px] leading-[1.6]">
							This link and code will only be valid for the next 5 minutes. If
							the link does not work, you can use the login verification code
							directly:
						</Text>

						{/* OTP Block */}
						<Section className="mt-8 rounded-2xl border border-[#222222] border-solid py-10 text-center">
							<Text className="m-0 font-medium font-mono text-5xl text-white tracking-[0.2em]">
								{otp}
							</Text>
						</Section>

						{/* CTA Button */}
						<Section className="mt-10">
							<Button
								className="rounded-xl bg-[#edece1] px-6 py-3 text-center font-bold text-[12px] text-black uppercase tracking-wider"
								href={url}
							>
								Login to Reloop
							</Button>
						</Section>

						<Text className="mt-8 text-[#707070] text-[13px] leading-[1.6]">
							If you didn't request this code, you can safely ignore this email.
						</Text>

						<Hr className="my-10 border-[#222222]" />

						<Footer baseUrl={baseUrl} />
					</Section>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default OTPTokenEmail;
