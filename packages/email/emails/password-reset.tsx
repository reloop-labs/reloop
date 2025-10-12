import {
	Body,
	Button,
	Container,
	Heading,
	Preview,
	Section,
	Text,
} from "@react-email/components";
import { EmailThemeProvider } from "../components/theme";

interface PasswordResetEmailProps {
	resetUrl: string;
}

export const PasswordResetEmail = ({ resetUrl }: PasswordResetEmailProps) => {
	return (
		<EmailThemeProvider preview={<Preview>Reset your Reloop password</Preview>}>
			<Body className="bg-gray-50 font-sans">
				<Container className="mx-auto mb-16 bg-white py-5 pb-12">
					<Section className="mb-5 rounded-lg bg-gray-50 p-5 text-center">
						<Text className="m-0 font-bold text-2xl text-blue-600">Reloop</Text>
					</Section>

					<Section className="rounded-lg bg-white p-8 shadow-sm">
						<Heading className="mb-5 font-bold text-2xl text-gray-800">
							Reset Your Password
						</Heading>
						<Text className="mb-4 text-base text-gray-800 leading-relaxed">
							Hello,
						</Text>
						<Text className="mb-4 text-base text-gray-800 leading-relaxed">
							We received a request to reset your password for your Reloop
							account. If you made this request, click the button below to reset
							your password:
						</Text>

						<Section className="my-5 text-center">
							<Button
								className="inline-block rounded-md bg-blue-600 px-6 py-3 font-medium text-base text-white leading-none no-underline"
								href={resetUrl}
							>
								Reset Password
							</Button>
						</Section>

						<Text className="mb-4 text-base text-gray-800 leading-relaxed">
							If the button doesn't work, you can copy and paste this link into
							your browser:
						</Text>

						<Text className="break-all rounded bg-gray-100 p-2.5 font-mono text-gray-800 text-sm leading-snug">
							{resetUrl}
						</Text>

						<Text className="my-4 font-bold text-base text-red-600">
							<strong>
								This link will expire in 1 hour for security reasons.
							</strong>
						</Text>

						<Text className="mb-4 text-base text-gray-800 leading-relaxed">
							If you didn't request a password reset, you can safely ignore this
							email. Your password will not be changed.
						</Text>
					</Section>

					<Section className="mt-8 border-gray-200 border-t pt-5">
						<Text className="mb-2 text-gray-500 text-sm leading-snug">
							This email was sent from Reloop. If you have any questions, please
							contact our support team.
						</Text>
						<Text className="mb-2 text-gray-500 text-sm leading-snug">
							&copy; 2024 Reloop. All rights reserved.
						</Text>
					</Section>
				</Container>
			</Body>
		</EmailThemeProvider>
	);
};

export default PasswordResetEmail;
