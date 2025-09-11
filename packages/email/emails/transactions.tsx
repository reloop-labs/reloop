import {
	Body,
	Button,
	Container,
	Heading,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";
import { format } from "date-fns";
import {
	EmailThemeProvider,
	getEmailInlineStyles,
	getEmailThemeClasses,
} from "../components/theme";

type Transaction = {
	id: string;
	date: string;
	amount: number;
	name: string;
	currency: string;
	category?: string;
};

interface Props {
	fullName: string;
	transactions: Transaction[];
	locale: string;
	teamName: string;
}

const defaultTransactions = [
	{
		id: "1",
		date: new Date().toISOString(),
		amount: -1000,
		currency: "USD",
		name: "Spotify",
	},
	{
		id: "2",
		date: new Date().toISOString(),
		amount: 1000,
		currency: "USD",
		name: "Insurance",
		category: "income",
	},
	{
		id: "3",
		date: new Date().toISOString(),
		amount: -1000,
		currency: "USD",
		name: "Airbnb",
	},
];

const baseAppUrl = "https://reloop.sh/";

export const TransactionsEmail = ({
	transactions = defaultTransactions,
	locale = "en",
}: Props) => {
	const themeClasses = getEmailThemeClasses();
	const lightStyles = getEmailInlineStyles();

	const previewText = "Transactions";

	const displayedTransactions = transactions.slice(0, 10);

	return (
		<EmailThemeProvider preview={<Preview>{previewText}</Preview>}>
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
						Transactions
					</Heading>

					<br />

					<table
						style={{ width: "100% !important", minWidth: "100%" }}
						className="w-full border-collapse"
					>
						<thead style={{ width: "100%" }}>
							<tr
								className={`h-[45px] border-0 border-t-[1px] border-b-[1px] border-solid ${themeClasses.border}`}
								style={{ borderColor: lightStyles.container.borderColor }}
							>
								<th align="left">
									<Text
										className={`m-0 p-0 font-semibold text-[14px] ${themeClasses.text}`}
										style={{ color: lightStyles.text.color }}
									>
										Date
									</Text>
								</th>
								<th align="left" style={{ width: "50%" }}>
									<Text
										className={`m-0 p-0 font-semibold text-[14px] ${themeClasses.text}`}
										style={{ color: lightStyles.text.color }}
									>
										Description
									</Text>
								</th>
								<th align="left">
									<Text
										className={`m-0 p-0 font-semibold text-[14px] ${themeClasses.text}`}
										style={{ color: lightStyles.text.color }}
									>
										$100
									</Text>
								</th>
							</tr>
						</thead>

						<tbody style={{ width: "100%", minWidth: "100% !important" }}>
							{displayedTransactions.map((transaction) => (
								<tr
									key={transaction.id}
									className={`h-[45px] border-0 border-b-[1px] border-solid ${themeClasses.border}`}
									style={{ borderColor: lightStyles.container.borderColor }}
								>
									<td align="left">
										<Text
											className={`m-0 mt-1 p-0 pb-1 text-[14px] ${themeClasses.text}`}
											style={{ color: lightStyles.text.color }}
										>
											{format(new Date(transaction.date), "MMM d")}
										</Text>
									</td>
									<td align="left" style={{ width: "50%" }}>
										<Link
											href={`${baseAppUrl}/transactions?id=${transaction.id}`}
											className={
												transaction?.category === "income"
													? "text-[#00C969]"
													: themeClasses.link
											}
											style={{
												color:
													transaction?.category === "income"
														? "#00C969 !important"
														: lightStyles.text.color,
												textDecoration: "none",
											}}
										>
											<Text
												className="m-0 mt-1 line-clamp-1 p-0 pb-1 text-[14px]"
												style={{
													color:
														transaction?.category === "income"
															? "#00C969 !important"
															: "inherit",
												}}
											>
												{transaction.name}
											</Text>
										</Link>
									</td>
									<td align="left">
										<Text
											className={
												"m-0 mt-1 p-0 pb-1 text-[14px]" +
													transaction?.category ===
												"income"
													? "text-[#00C969]"
													: themeClasses.text
											}
											style={{
												color:
													transaction?.category === "income"
														? "#00C969 !important"
														: lightStyles.text.color,
											}}
										>
											{Intl.NumberFormat(locale, {
												style: "currency",
												currency: transaction.currency,
											}).format(transaction.amount)}
										</Text>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					<br />

					<Section className="mt-[32px] mb-[32px] text-center">
						<Button href={`${baseAppUrl}`}>View all transactions</Button>
					</Section>

					<br />
				</Container>
			</Body>
		</EmailThemeProvider>
	);
};

export default TransactionsEmail;
