import {
	Body,
	Container,
	Heading,
	Preview,
	Text,
} from "@react-email/components";
import { GetStarted } from "../components/get-started";
import {
	EmailThemeProvider,
	getEmailInlineStyles,
	getEmailThemeClasses,
} from "../components/theme";

interface Props {
	fullName: string;
}

export const WelcomeEmail = ({ fullName = "" }: Props) => {
	const firstName = fullName ? fullName.split(" ").at(0) : "";
	const text = `${firstName ? `Hi ${firstName}, ` : ""}Welcome to Midday! I'm Pontus, one of the founders. It's really important to us that you have a great experience ramping up.`;
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
						Welcome to Reloop
					</Heading>

					<br />

					<span
						className={`font-medium ${themeClasses.text}`}
						style={{ color: lightStyles.text.color }}
					>
						{firstName ? `Hi ${firstName},` : "Hello,"}
					</span>
					<Text
						className={themeClasses.text}
						style={{ color: lightStyles.text.color }}
					>
						Welcome to Reloop!
						<br />
					</Text>

					<br />

					<br />
					<br />

					<GetStarted />

					<br />
				</Container>
			</Body>
		</EmailThemeProvider>
	);
};

export default WelcomeEmail;
