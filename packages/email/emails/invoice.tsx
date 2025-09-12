import {
	Body,
	Container,
	Heading,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";
import {
	EmailThemeProvider,
	getEmailInlineStyles,
	getEmailThemeClasses,
} from "../components/theme";

interface Props {
	customerName: string;
	teamName: string;
	link: string;
}

export const InvoiceEmail = ({
	customerName = "Customer",
	teamName = "Reloop",
	link = "https://reloop.sh/",
}: Props) => {
	const text = `You've Received an Invoice from ${teamName}`;
	const themeClasses = getEmailThemeClasses();
	const lightStyles = getEmailInlineStyles();

	return (
		<EmailThemeProvider preview={<Preview>{text}</Preview>}>
			<Body
				className={`mx-auto my-auto font-sans ${themeClasses.body}`}
				style={lightStyles.body}
			>
				<Container
					className={`mx-auto my-[40px] max-w-[600px] p-[20px] ${themeClasses.container}`}
					style={{
						borderStyle: "solid",
						borderWidth: 1,
						borderColor: lightStyles.container.borderColor,
					}}
				>
					<Heading
						className={`mx-0 my-[30px] p-0 text-center font-normal text-[21px] ${themeClasses.heading}`}
						style={{ color: lightStyles.text.color }}
					>
						You've Received an Invoice <br /> from {teamName}
					</Heading>

					<br />

					<span
						className={`font-medium ${themeClasses.text}`}
						style={{ color: lightStyles.text.color }}
					>
						Hi {customerName},
					</span>
					<Text
						className={themeClasses.text}
						style={{ color: lightStyles.text.color }}
					>
						Please review your invoice and make sure to pay it on time. If you
						have any questions, feel free to reply to this email.
					</Text>

					<Section className="mt-[50px] mb-[50px] text-center">
						<Link href={link}>View invoice</Link>
					</Section>

					<br />
				</Container>
			</Body>
		</EmailThemeProvider>
	);
};

export default InvoiceEmail;
