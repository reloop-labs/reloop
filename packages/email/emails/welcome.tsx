import {
	Body,
	Container,
	Heading,
	Hr,
	Img,
	Link,
	Preview,
	Section,
	Text,
} from "react-email";
import {
	EmailThemeProvider,
	getEmailInlineStyles,
	getEmailThemeClasses,
} from "../components/theme";

interface Props {
	fullName: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
	? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
	: "https://reloop.sh";

export const WelcomeEmail = ({ fullName = "" }: Props) => {
	const firstName = fullName ? fullName.split(" ").at(0) : "";
	const previewText = `Welcome to Reloop, ${firstName}! We're excited to have you on board.`;
	const themeClasses = getEmailThemeClasses();
	const lightStyles = getEmailInlineStyles();

	return (
		<EmailThemeProvider preview={<Preview>{previewText}</Preview>}>
			<Body
				className={`mx-auto my-auto font-sans ${themeClasses.body}`}
				style={lightStyles.body}
			>
				<Container className="mx-auto my-[40px] max-w-[465px] p-[20px]">
					<Section className="mt-[32px]">
						<Img
							src={`${baseUrl}/web-app-manifest-192x192.png`}
							width="40"
							height="40"
							alt="Reloop"
							className="my-0"
						/>
					</Section>
					<Heading
						className={`mt-[32px] mb-[24px] p-0 font-semibold text-[24px] tracking-tight ${themeClasses.heading}`}
						style={{ color: lightStyles.text.color }}
					>
						Welcome to Reloop
					</Heading>
					<Text
						className={`text-[14px] leading-[24px] ${themeClasses.text}`}
						style={{ color: lightStyles.text.color }}
					>
						Hello, <strong>{fullName}</strong>.
					</Text>
					<Text
						className={`text-[14px] leading-[24px] ${themeClasses.text}`}
						style={{ color: lightStyles.text.color }}
					>
						Welcome to Reloop! We're excited to have you on board. Reloop is
						designed to help you manage your email infrastructure with ease.
					</Text>
					<Text
						className={`text-[14px] leading-[24px] ${themeClasses.text}`}
						style={{ color: lightStyles.text.color }}
					>
						To get started, you can explore your dashboard or check out our
						documentation.
					</Text>
					<Section className="mt-[32px] mb-[32px]">
						<Link
							href={`${baseUrl}/dashboard`}
							className="rounded bg-[#000] px-5 py-3 text-center font-semibold text-[12px] text-white no-underline"
						>
							Go to Dashboard
						</Link>
					</Section>
					<Text
						className={`text-[14px] leading-[24px] ${themeClasses.text}`}
						style={{ color: lightStyles.text.color }}
					>
						Best,
						<br />
						The Reloop Team
					</Text>
					<Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />
					<Text className="text-[#666666] text-[12px] leading-[24px]">
						If you'd like to report an issue, reach out to{" "}
						<Link
							href={`${baseUrl}/help`}
							className="text-blue-600 no-underline"
						>
							Reloop Help
						</Link>
						.
					</Text>
					<Text className="text-[#666666] text-[12px] leading-[24px]">
						<Link
							href={`${baseUrl}/notifications`}
							className="text-[#666666] no-underline"
						>
							Manage your notification settings
						</Link>
					</Text>
					<Text className="text-[#666666] text-[12px] leading-[24px]">
						Copyright © {new Date().getFullYear()} Reloop Inc. All rights
						reserved.
						<br />
						123 Reloop St, San Francisco, CA 94103
					</Text>
				</Container>
			</Body>
		</EmailThemeProvider>
	);
};

export default WelcomeEmail;
