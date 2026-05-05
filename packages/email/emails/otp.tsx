import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Img,
	Preview,
	Section,
	Tailwind,
	Text,
} from "react-email";

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
				<Body className="bg-[#f9f9f9] font-sans text-[#1a1a1a]">
					<Container className="mx-auto mt-[100px] mb-[10px] max-w-[505px] overflow-hidden rounded-4xl border border-[#e5e5e5]/50 border-solid bg-white p-0">
						{/* Header */}
						<Section className="flex items-center px-6 pt-6">
							<Img
								src={`${baseUrl}/web-app-manifest-192x192.png`}
								width="72"
								height="72"
								alt="Reloop Logo"
							/>
						</Section>

						<Section className="px-8 pb-8">
							<Heading className="m-0 font-bold text-3xl text-[#1a1a1a] tracking-tight">
								Your login code for Reloop
							</Heading>
							<Section className="mt-8">
								<Button
									className="block w-fit rounded-2xl bg-black px-6 py-3 text-center font-semibold text-base text-white"
									href={url}
								>
									Login to Reloop
								</Button>
							</Section>

							<Text className="m-0 mt-8 text-[#666666] text-sm leading-[18px]">
								This link and code will only be valid for the next 5 minutes. If
								the link does not work, you can use the login verification code
								directly:
							</Text>

							<Section className="mt-6 rounded-2xl border border-[#e5e5e5] border-solid bg-[#f4f4f4] py-4 text-center">
								<Text className="m-0 font-medium font-mono text-5xl text-[#1a1a1a] tracking-[0.2em]">
									{otp}
								</Text>
							</Section>
						</Section>
					</Container>
					<Section className="mx-auto mb-[100px] max-w-[465px]">
						<Text className="m-0 text-[#999999] text-sm">
							Not you? You can safely ignore this email. &copy;{" "}
							{new Date().getFullYear()} Reloop
						</Text>
					</Section>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default OTPTokenEmail;
