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
	Text,
	Tailwind,
} from "react-email";
import * as React from "react";

interface OTPTokenEmailProps {
	otp: string;
	email: string;
	url?: string;
}

export const OTPTokenEmail = ({
	otp = "482 916",
	email = "user@example.com",
	url = "https://reloop.sh/verify",
}: OTPTokenEmailProps) => {
	// Format OTP for the spaced display if it's a 6-digit string without spaces
	const displayOtp =
		otp.length === 6 && !otp.includes(" ")
			? `${otp.slice(0, 3)}  ${otp.slice(3)}`
			: otp;

	return (
		<Html>
			<Head />
			<Preview>Sign in to Reloop</Preview>
			<Tailwind>
				<Body className="bg-[#121212] font-sans text-white">
					<Container className="mx-auto my-10 max-w-[465px] rounded-xl border border-solid border-[#2d2d2d] bg-[#1e1e1e] p-0 overflow-hidden shadow-2xl">
						{/* Header */}
						<Section className="bg-black p-6">
							<Section className="flex items-center">
								<Img
									src="https://reloop.sh/logo.png"
									width="32"
									height="32"
									alt="Reloop"
									className="rounded-md inline-block align-middle"
								/>
								<Text className="m-0 ml-3 inline-block align-middle text-xl font-semibold text-white">
									Reloop
								</Text>
							</Section>
						</Section>

						<Section className="p-8">
							<Heading className="m-0 text-3xl font-bold tracking-tight text-white">
								Sign in to Reloop
							</Heading>
							<Heading
								as="h2"
								className="mt-4 m-0 text-[#a1a1a1] text-lg font-normal leading-6"
							>
								Click below to verify your identity and access your account.
							</Heading>

							<Section className="mt-8">
								<Button
									className="block w-full rounded-lg bg-[#111111] py-4 text-center text-base font-semibold text-white border border-solid border-[#333333] no-underline"
									href={url}
								>
									Verify and sign in
								</Button>
							</Section>

							<Section className="mt-6 flex items-center">
								<Text className="m-0 text-[#707070] text-sm">
									🕒 Valid for 15 minutes
								</Text>
							</Section>

							<Hr className="my-8 border-[#2d2d2d]" />

							<Text className="m-0 text-[#707070] text-[11px] font-bold uppercase tracking-widest">
								Can't use the link?
							</Text>
							<Text className="mt-1 m-0 text-[#a1a1a1] text-sm">
								Enter this code on the sign-in page instead.
							</Text>

							<Section className="mt-6 rounded-lg bg-[#0c0c0c] border border-solid border-[#2d2d2d] py-10 text-center">
								<Text className="m-0 font-mono text-5xl font-medium tracking-[0.2em] text-white">
									{displayOtp}
								</Text>
							</Section>
						</Section>

						<Section className="border-t border-solid border-[#2d2d2d] bg-[#1e1e1e] px-8 py-6">
							<Section className="flex justify-between items-center">
								<Text className="m-0 text-[#707070] text-sm inline-block">
									Not you? You can safely ignore this email.
								</Text>
								<Link
									href="https://reloop.sh"
									className="text-[#707070] text-sm no-underline float-right"
								>
									reloop.sh
								</Link>
							</Section>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default OTPTokenEmail;
