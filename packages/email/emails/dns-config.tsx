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

interface DNSRecord {
	recordType: string;
	recordTypeName: string;
	name: string;
	value: string;
	ttl: string;
	priority: number | null;
}

interface DnsConfigEmailProps {
	fullName: string;
	domain: string;
	dkimRecords?: DNSRecord[];
	spfRecords?: DNSRecord[];
	dmarcRecords?: DNSRecord[];
	dashboardUrl: string;
	baseUrl?: string;
	theme?: "light" | "dark";
}

const defaultBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
	? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
	: "https://reloop.sh";

const sampleDkim: DNSRecord[] = [
	{
		recordType: "CNAME",
		recordTypeName: "CNAME",
		name: "reloop1._domainkey.yourdomain.com",
		value: "reloop1.dkim.reloop.sh",
		ttl: "auto",
		priority: null,
	},
	{
		recordType: "CNAME",
		recordTypeName: "CNAME",
		name: "reloop2._domainkey.yourdomain.com",
		value: "reloop2.dkim.reloop.sh",
		ttl: "auto",
		priority: null,
	},
];

const sampleSpf: DNSRecord[] = [
	{
		recordType: "TXT",
		recordTypeName: "TXT",
		name: "yourdomain.com",
		value: "v=spf1 include:spf.reloop.sh ~all",
		ttl: "auto",
		priority: null,
	},
];

const sampleDmarc: DNSRecord[] = [
	{
		recordType: "TXT",
		recordTypeName: "TXT",
		name: "_dmarc.yourdomain.com",
		value: "v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com",
		ttl: "auto",
		priority: null,
	},
];

export const DnsConfigEmail = ({
	fullName = "User",
	domain = "yourdomain.com",
	dkimRecords = sampleDkim,
	spfRecords = sampleSpf,
	dmarcRecords = sampleDmarc,
	dashboardUrl = "https://reloop.sh/dashboard",
	baseUrl = defaultBaseUrl,
	theme = "light",
}: DnsConfigEmailProps) => {
	const firstName = fullName ? fullName.split(" ").at(0) : "there";
	const isDark = theme === "dark";

	// ── Design tokens ──────────────────────────────────────────────────────────
	const color = {
		bg: isDark ? "#0e0e0e" : "#ffffff",
		cardBg: isDark ? "#141414" : "#f9f9f9",
		fieldBg: isDark ? "#1c1c1c" : "#ffffff",
		border: isDark ? "#222222" : "#e8e8e8",
		fieldBorder: isDark ? "#2a2a2a" : "#e0e0e0",
		text: isDark ? "#ffffff" : "#0e0e0e",
		muted: isDark ? "#707070" : "#888888",
		mono: isDark ? "#d4d4d4" : "#1a1a1a",
		label: "#707070",
		badge: isDark ? "#252525" : "#efefef",
		badgeText: isDark ? "#a0a0a0" : "#555555",
		btnBg: isDark ? "#edece1" : "#0e0e0e",
		btnText: isDark ? "#000000" : "#ffffff",
		separator: isDark ? "#1a1a1a" : "#f0f0f0",
	};

	// ── Tailwind classes (static strings for JIT) ──────────────────────────────
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
		salutation: isDark
			? "text-[15px] text-white leading-[1.6]"
			: "text-[15px] text-[#0e0e0e] leading-[1.6]",
		bodyText: isDark
			? "mt-4 text-[#b0b0b0] text-[15px] leading-[1.6]"
			: "mt-4 text-[#555555] text-[15px] leading-[1.6]",
		btn: isDark
			? "rounded-xl bg-[#edece1] px-6 py-3 text-center font-bold font-mono text-[12px] text-black uppercase tracking-wider no-underline"
			: "rounded-xl bg-[#0e0e0e] px-6 py-3 text-center font-bold font-mono text-[12px] text-white uppercase tracking-wider no-underline",
		footerHr: isDark ? "my-10 border-[#222222]" : "my-10 border-[#e0e0e0]",
	};

	// ── Record card renderer ───────────────────────────────────────────────────
	// Each DNS record becomes a self-contained card.
	// Fields are stacked vertically — name and value take the full card width,
	// making it trivial to triple-click and copy each value individually.
	const RecordCard = ({
		record,
		index,
		total,
	}: {
		record: DNSRecord;
		index: number;
		total: number;
	}) => {
		const isLast = index === total - 1;

		return (
			<div
				style={{
					padding: "20px",
					borderBottom: isLast ? "none" : `1px solid ${color.separator}`,
				}}
			>
				{/* Row index + type badge */}
				<table width="100%" cellPadding="0" cellSpacing="0">
					<tr>
						<td style={{ verticalAlign: "middle" }}>
							<span
								style={{
									fontFamily: "monospace",
									fontSize: "10px",
									fontWeight: "700",
									letterSpacing: "0.12em",
									textTransform: "uppercase",
									backgroundColor: color.badge,
									color: color.badgeText,
									borderRadius: "5px",
									padding: "3px 8px",
									display: "inline-block",
								}}
							>
								{record.recordType}
							</span>
						</td>
						<td style={{ verticalAlign: "middle", textAlign: "right" }}>
							<span
								style={{
									fontFamily: "monospace",
									fontSize: "11px",
									color: color.muted,
								}}
							>
								TTL: {record.ttl}
								{record.priority !== null && record.priority !== undefined
									? `  ·  Priority: ${record.priority}`
									: ""}
							</span>
						</td>
					</tr>
				</table>

				{/* Name field */}
				<div style={{ marginTop: "14px" }}>
					<p
						style={{
							margin: "0 0 5px 0",
							fontFamily: "monospace",
							fontSize: "10px",
							fontWeight: "600",
							letterSpacing: "0.12em",
							textTransform: "uppercase",
							color: color.label,
						}}
					>
						Name
					</p>
					<div
						style={{
							backgroundColor: color.fieldBg,
							border: `1px solid ${color.fieldBorder}`,
							borderRadius: "8px",
							padding: "10px 14px",
						}}
					>
						<p
							style={{
								margin: 0,
								fontFamily: "monospace",
								fontSize: "13px",
								fontWeight: "500",
								color: color.mono,
								wordBreak: "break-all",
								lineHeight: "1.5",
							}}
						>
							{record.name}
						</p>
					</div>
				</div>

				{/* Value field — full-width, most important to copy */}
				<div style={{ marginTop: "10px" }}>
					<p
						style={{
							margin: "0 0 5px 0",
							fontFamily: "monospace",
							fontSize: "10px",
							fontWeight: "600",
							letterSpacing: "0.12em",
							textTransform: "uppercase",
							color: color.label,
						}}
					>
						Value
					</p>
					<div
						style={{
							backgroundColor: color.fieldBg,
							border: `1px solid ${color.fieldBorder}`,
							borderRadius: "8px",
							padding: "12px 14px",
						}}
					>
						<p
							style={{
								margin: 0,
								fontFamily: "monospace",
								fontSize: "13px",
								color: color.mono,
								wordBreak: "break-all",
								lineHeight: "1.6",
								whiteSpace: "pre-wrap",
							}}
						>
							{record.value}
						</p>
					</div>
				</div>
			</div>
		);
	};

	// ── Group section renderer ─────────────────────────────────────────────────
	const RecordGroup = ({
		stepNum,
		title,
		subtitle,
		records,
	}: {
		stepNum: string;
		title: string;
		subtitle: string;
		records: DNSRecord[];
	}) => (
		<Section style={{ marginTop: "32px" }}>
			{/* Group header */}
			<table width="100%" cellPadding="0" cellSpacing="0">
				<tr>
					<td
						style={{
							verticalAlign: "top",
							width: "32px",
							paddingTop: "2px",
						}}
					>
						<p
							style={{
								margin: 0,
								fontFamily: "monospace",
								fontSize: "12px",
								color: color.muted,
							}}
						>
							{stepNum}
						</p>
					</td>
					<td style={{ verticalAlign: "top" }}>
						<p
							style={{
								margin: 0,
								fontSize: "15px",
								fontWeight: "600",
								color: color.text,
							}}
						>
							{title}
						</p>
						<p
							style={{
								margin: "3px 0 0 0",
								fontSize: "13px",
								color: color.muted,
								lineHeight: "1.5",
							}}
						>
							{subtitle}
						</p>
					</td>
				</tr>
			</table>

			{/* Cards container */}
			<div
				style={{
					marginTop: "14px",
					backgroundColor: color.cardBg,
					border: `1px solid ${color.border}`,
					borderRadius: "16px",
					overflow: "hidden",
				}}
			>
				{records.map((record, i) => (
					<RecordCard
						key={i}
						record={record}
						index={i}
						total={records.length}
					/>
				))}
			</div>
		</Section>
	);

	// ──────────────────────────────────────────────────────────────────────────
	return (
		<Html>
			<Head />
			<Preview>
				Your DNS records for {domain} — add these to verify and start sending.
			</Preview>
			<Tailwind>
				<Body className={cls.body}>
					<Wrapper baseUrl={baseUrl} theme={theme}>
						<Text className={cls.label}>DNS Configuration</Text>

						<Heading
							className={cls.heading}
							style={{ fontFamily: "Georgia, serif" }}
						>
							Add these records to{" "}
							<span className={cls.headingMuted}>verify {domain}.</span>
						</Heading>

						<Hr className={cls.hr} />

						<Text className={cls.salutation}>
							Hey, <strong>{firstName}.</strong>
						</Text>

						<Text className={cls.bodyText}>
							Add all three groups of records to your DNS provider. Each value
							field below is on its own line — just click inside a box and
							select all to copy it.
						</Text>

						{/* ── Record Groups ── */}
						{dkimRecords.length > 0 && (
							<RecordGroup
								stepNum="01"
								title="Domain Verification (DKIM)"
								subtitle="Authenticates that Reloop is authorised to send email on behalf of your domain."
								records={dkimRecords}
							/>
						)}

						{spfRecords.length > 0 && (
							<RecordGroup
								stepNum="02"
								title="Sending Email (SPF)"
								subtitle="Tells receiving servers that Reloop's infrastructure is a permitted sender."
								records={spfRecords}
							/>
						)}

						{dmarcRecords.length > 0 && (
							<RecordGroup
								stepNum="03"
								title="Reject Spoofed Emails (DMARC)"
								subtitle="Sets a policy for how receivers should handle unauthenticated mail from your domain."
								records={dmarcRecords}
							/>
						)}

						<Text className={cls.bodyText}>
							DNS changes can take up to 48 hours to propagate. Once all records
							are detected, your domain status will update automatically.
						</Text>

						<Section className="mt-10">
							<Button className={cls.btn} href={dashboardUrl}>
								Check Verification Status
							</Button>
						</Section>

						<Text className={cls.bodyText}>
							Need help? Visit our{" "}
							<a href="https://reloop.sh/docs/dns" style={{ color: "inherit" }}>
								DNS setup docs
							</a>{" "}
							or reply and we&apos;ll walk you through it.
						</Text>

						<Hr className={cls.footerHr} />
						<Footer baseUrl={baseUrl} theme={theme} />
					</Wrapper>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default DnsConfigEmail;
