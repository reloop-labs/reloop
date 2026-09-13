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

interface ExportReadyEmailProps {
	totalRows: number;
	fileName: string;
	downloadUrl: string;
	expiresAt: string;
	dashboardUrl: string;
	baseUrl?: string;
	theme?: "light" | "dark";
}

const defaultBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
	? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
	: "https://reloop.sh";

export const ExportReadyEmail = ({
	totalRows = 0,
	fileName = "contacts.csv",
	downloadUrl = "https://reloop.sh/dashboard/contacts",
	expiresAt = "",
	dashboardUrl = "https://reloop.sh/dashboard/contacts",
	baseUrl = defaultBaseUrl,
	theme = "light",
}: ExportReadyEmailProps) => {
	const isDark = theme === "dark";

	const cls = {
		body: isDark
			? "m-0 p-0 bg-[#0e0e0e] text-white font-sans"
			: "m-0 p-0 bg-white text-[#0e0e0e] font-sans",
		label:
			"m-0 font-mono font-medium text-[#707070] text-[12px] uppercase tracking-[0.2em]",
		heading: isDark
			? "mt-6 mb-8 p-0 font-normal text-[32px] text-white leading-[1.2]"
			: "mt-6 mb-8 p-0 font-normal text-[32px] text-[#0e0e0e] leading-[1.2]",
		headingMuted: "text-[#707070]",
		hr: isDark ? "my-8 border-[#222222]" : "my-8 border-[#e0e0e0]",
		bodyText: isDark
			? "mt-4 text-[#b0b0b0] text-[15px] leading-[1.6]"
			: "mt-4 text-[#555555] text-[15px] leading-[1.6]",
		statsBox: isDark
			? "mt-8 rounded-2xl border border-[#222222] border-solid p-8"
			: "mt-8 rounded-2xl border border-[#e0e0e0] border-solid p-8",
		statLabel:
			"m-0 font-mono text-[#707070] text-[11px] uppercase tracking-[0.15em]",
		statValue: isDark
			? "m-0 mt-1 font-bold font-mono text-white text-[24px]"
			: "m-0 mt-1 font-bold font-mono text-[#0e0e0e] text-[24px]",
		btn: isDark
			? "rounded-xl bg-[#edece1] px-6 py-3 text-center font-bold font-mono text-[12px] text-black uppercase tracking-wider no-underline"
			: "rounded-xl bg-[#0e0e0e] px-6 py-3 text-center font-bold font-mono text-[12px] text-white uppercase tracking-wider no-underline",
		footerHr: isDark ? "my-10 border-[#222222]" : "my-10 border-[#e0e0e0]",
	};

	const expiryLabel = expiresAt
		? new Date(expiresAt).toLocaleDateString("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric",
			})
		: "in 7 days";

	return (
		<Html>
			<Head />
			<Preview>
				Your contacts export ({totalRows.toLocaleString()} rows) is ready to
				download.
			</Preview>
			<Tailwind>
				<Body className={cls.body}>
					<Wrapper baseUrl={baseUrl} theme={theme}>
						<Text className={cls.label}>Export Ready</Text>

						<Heading
							className={cls.heading}
							style={{ fontFamily: "Georgia, serif" }}
						>
							Your contacts export{" "}
							<span className={cls.headingMuted}>is ready.</span>
						</Heading>

						<Hr className={cls.hr} />

						<Text className={cls.bodyText}>
							We&apos;ve prepared your CSV export. The download link below
							expires on {expiryLabel} — no sign-in required.
						</Text>

						<Section className={cls.statsBox}>
							<table width="100%" cellPadding="0" cellSpacing="0">
								<tr>
									<td style={{ verticalAlign: "top" }}>
										<Text className={cls.statLabel}>Rows</Text>
										<Text className={cls.statValue}>
											{totalRows.toLocaleString()}
										</Text>
									</td>
									<td
										style={{
											verticalAlign: "top",
											textAlign: "right",
										}}
									>
										<Text className={cls.statLabel}>File</Text>
										<Text className={cls.statValue}>{fileName}</Text>
									</td>
								</tr>
							</table>
						</Section>

						<Section className="mt-10">
							<Button className={cls.btn} href={downloadUrl}>
								Download CSV
							</Button>
						</Section>

						<Text className={cls.bodyText}>
							If the button doesn&apos;t work, paste this link into your
							browser:
							<br />
							<a href={downloadUrl} style={{ color: "inherit" }}>
								{downloadUrl}
							</a>
						</Text>

						<Text className={cls.bodyText}>
							Need another slice of your audience? Head back to your{" "}
							<a href={dashboardUrl} style={{ color: "inherit" }}>
								contacts
							</a>{" "}
							and export again.
						</Text>

						<Hr className={cls.footerHr} />
						<Footer baseUrl={baseUrl} theme={theme} />
					</Wrapper>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default ExportReadyEmail;
