import {
	Body,
	Button,
	Container,
	Heading,
	Preview,
	Section,
	Text,
} from "react-email";
import { EmailThemeProvider } from "../components/theme";

interface ConfirmEmailProps {
	confirmLink: string;
}

export const ConfirmEmail = ({
	confirmLink = "https://reloop.app/confirm",
}: ConfirmEmailProps) => {
	return (
		<EmailThemeProvider
			preview={<Preview>Confirm your email address for Reloop</Preview>}
		>
			<Body className="bg-gray-50 font-sans">
				<Container className="mx-auto mb-16 bg-white py-5 pb-12">
					<Section className="mb-5 rounded-lg bg-gray-50 p-5 text-center">
						<Text className="m-0 font-bold text-2xl text-blue-600">Reloop</Text>
					</Section>

					<Section className="rounded-lg bg-white p-8 shadow-sm">
						<Heading className="mb-5 font-bold text-2xl text-gray-800">
							Confirm your email address
						</Heading>
						<Text className="mb-4 text-base text-gray-800 leading-relaxed">
							Welcome to Reloop! Before we get started, we need to verify your
							email address.
						</Text>
						<Text className="mb-6 text-base text-gray-800 leading-relaxed">
							Click the button below to confirm your account and get full access
							to our features.
						</Text>

						<Section className="my-8 text-center">
							<Button
								className="inline-block rounded-md bg-blue-600 px-6 py-3 font-medium text-base text-white leading-none no-underline"
								href={confirmLink}
							>
								Confirm Email Address
							</Button>
						</Section>

						<Text className="mb-4 text-base text-gray-800 leading-relaxed">
							If the button doesn't work, you can copy and paste this link into
							your browser:
						</Text>

						<Text className="break-all rounded bg-gray-100 p-2.5 font-mono text-gray-800 text-sm leading-snug">
							{confirmLink}
						</Text>

						<Text className="my-6 font-bold text-amber-600 text-base">
							<strong>This link will expire in 24 hours.</strong>
						</Text>

						<Text className="mt-8 border-gray-100 border-t pt-6 text-gray-500 text-sm leading-relaxed">
							Didn't request this email? You can safely ignore it. If you have
							concerns, please contact our support team.
						</Text>
					</Section>

					<Section className="mt-8 border-gray-200 border-t pt-5">
						<Text className="mb-2 text-gray-500 text-sm leading-snug">
							&copy; {new Date().getFullYear()} Reloop. All rights reserved.
						</Text>
						<Text className="mb-2 text-gray-500 text-sm leading-snug">
							San Francisco, CA
						</Text>
					</Section>
				</Container>
			</Body>
		</EmailThemeProvider>
	);
};

export default ConfirmEmail;
