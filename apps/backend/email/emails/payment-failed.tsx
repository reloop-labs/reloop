import {
	Body,
	Button,
	Head,
	Heading,
	Hr,
	Html,
	Preview,
	Section,
	Tailwind,
	Text,
} from "react-email";
import { Footer } from "../components/footer";
import { Wrapper } from "../components/wrapper";

interface PaymentFailedEmailProps {
	fullName: string;
	planName: string;
	amount: string;
	failureReason: string;
	nextRetryDate: string;
	updateBillingUrl: string;
	baseUrl?: string;
	theme?: "light" | "dark";
}

const defaultBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
	? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
	: "https://reloop.sh";

export const PaymentFailedEmail = ({
	fullName = "User",
	planName = "Pro",
	amount = "$29.00",
	failureReason = "Your card was declined.",
	nextRetryDate = "May 13, 2026",
	updateBillingUrl = "https://reloop.sh/dashboard/billing",
	baseUrl = defaultBaseUrl,
	theme = "light",
}: PaymentFailedEmailProps) => {
	const firstName = fullName ? fullName.split(" ").at(0) : "there";
	const isDark = theme === "dark";

	const cls = {
		body: isDark
			? "m-0 p-0 bg-[#0e0e0e] text-white font-sans"
			: "m-0 p-0 bg-white text-[#0e0e0e] font-sans",
		label: "m-0 font-mono font-medium text-[#707070] text-[12px] uppercase tracking-[0.2em]",
		heading: isDark
			? "mt-6 mb-8 p-0 font-normal text-[32px] text-white leading-[1.2]"
			: "mt-6 mb-8 p-0 font-normal text-[32px] text-[#0e0e0e] leading-[1.2]",
		headingMuted: "text-[#707070]",
		hr: isDark ? "my-8 border-[#222222]" : "my-8 border-[#e0e0e0]",
		salutation: isDark
			? "text-[15px] text-white leading-[1.6]"
			: "text-[15px] text-[#0e0e0e] leading-[1.6]",
		bodyText: isDark
			? "mt-4 text-[#b0b0b0] text-[15px] leading-[1.6]"
			: "mt-4 text-[#555555] text-[15px] leading-[1.6]",
		detailsBox: isDark
			? "mt-8 rounded-2xl border border-[#222222] border-solid p-8"
			: "mt-8 rounded-2xl border border-[#e0e0e0] border-solid p-8",
		detailLabel: isDark
			? "m-0 font-mono text-[#707070] text-[11px] uppercase tracking-[0.15em]"
			: "m-0 font-mono text-[#707070] text-[11px] uppercase tracking-[0.15em]",
		detailValue: isDark
			? "m-0 mt-1 font-semibold text-white text-[15px]"
			: "m-0 mt-1 font-semibold text-[#0e0e0e] text-[15px]",
		amountValue: isDark
			? "m-0 mt-1 font-bold font-mono text-white text-[28px]"
			: "m-0 mt-1 font-bold font-mono text-[#0e0e0e] text-[28px]",
		reasonBox: isDark
			? "mt-6 rounded-xl bg-[#1a1a1a] border border-[#333333] border-solid px-6 py-4"
			: "mt-6 rounded-xl bg-[#fef9f0] border border-[#e0e0e0] border-solid px-6 py-4",
		reasonText: isDark
			? "m-0 text-[#b0b0b0] text-[14px] leading-[1.6]"
			: "m-0 text-[#555555] text-[14px] leading-[1.6]",
		btn: isDark
			? "rounded-xl bg-[#edece1] px-6 py-3 text-center font-bold font-mono text-[12px] text-black uppercase tracking-wider no-underline"
			: "rounded-xl bg-[#0e0e0e] px-6 py-3 text-center font-bold font-mono text-[12px] text-white uppercase tracking-wider no-underline",
		footerHr: isDark ? "my-10 border-[#222222]" : "my-10 border-[#e0e0e0]",
	};

	const tdBorder = isDark ? "1px solid #222222" : "1px solid #e0e0e0";

	return (
		<Html>
			<Head />
			<Preview>
				Action required — your payment of {amount} for Reloop {planName} failed.
			</Preview>
			<Tailwind>
				<Body className={cls.body}>
					<Wrapper baseUrl={baseUrl} theme={theme}>
						<Text className={cls.label}>Payment Failed</Text>

						<Heading
							className={cls.heading}
							style={{ fontFamily: "Georgia, serif" }}
						>
							We couldn&apos;t process{" "}
							<span className={cls.headingMuted}>your payment.</span>
						</Heading>

						<Hr className={cls.hr} />

						<Text className={cls.salutation}>
							Hey, <strong>{firstName}.</strong>
						</Text>

						<Text className={cls.bodyText}>
							Your payment of <strong>{amount}</strong> for the Reloop{" "}
							<strong>{planName}</strong> plan was unsuccessful. Please update
							your payment method to avoid any interruption to your service.
						</Text>

						<Section className={cls.detailsBox}>
							<table width="100%" cellPadding="0" cellSpacing="0">
								<tr>
									<td
										style={{
											borderBottom: tdBorder,
											paddingBottom: "20px",
											verticalAlign: "top",
										}}
									>
										<Text className={cls.detailLabel}>Amount Due</Text>
										<Text className={cls.amountValue}>{amount}</Text>
									</td>
									<td
										style={{
											borderBottom: tdBorder,
											paddingBottom: "20px",
											verticalAlign: "top",
											textAlign: "right",
										}}
									>
										<Text className={cls.detailLabel}>Plan</Text>
										<Text className={cls.detailValue}>{planName}</Text>
									</td>
								</tr>
								<tr>
									<td
										colSpan={2}
										style={{ paddingTop: "20px", verticalAlign: "top" }}
									>
										<Text className={cls.detailLabel}>Next Retry</Text>
										<Text className={cls.detailValue}>{nextRetryDate}</Text>
									</td>
								</tr>
							</table>

							<Section className={cls.reasonBox}>
								<Text className={cls.reasonText}>
									<strong>Reason:</strong> {failureReason}
								</Text>
							</Section>
						</Section>

						<Section className="mt-10">
							<Button className={cls.btn} href={updateBillingUrl}>
								Update Payment Method
							</Button>
						</Section>

						<Text className={cls.bodyText}>
							We&apos;ll automatically retry on <strong>{nextRetryDate}</strong>
							. If payment continues to fail, your account will be downgraded to
							the free plan.
						</Text>

						<Hr className={cls.footerHr} />
						<Footer baseUrl={baseUrl} theme={theme} />
					</Wrapper>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default PaymentFailedEmail;
