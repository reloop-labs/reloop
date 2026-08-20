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
	/** Domain verification (DKIM TXT) */
	dkimRecords?: DNSRecord[];
	/** Enable sending (SPF TXT + sending MX) */
	sendingRecords?: DNSRecord[];
	/** DMARC */
	dmarcRecords?: DNSRecord[];
	/** Enable receiving (receiving MX → inbound.*) */
	receivingRecords?: DNSRecord[];
	/** Click/open tracking (CNAME) */
	trackingRecords?: DNSRecord[];
	/** @deprecated use sendingRecords — kept for preview / old callers */
	spfRecords?: DNSRecord[];
	dashboardUrl: string;
	baseUrl?: string;
	theme?: "light" | "dark";
}

const defaultBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
	? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
	: "https://reloop.sh";

const sampleDkim: DNSRecord[] = [
	{
		recordType: "TXT",
		recordTypeName: "DKIM",
		name: "reloop._domainkey",
		value: "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...",
		ttl: "Auto",
		priority: null,
	},
];

const sampleSending: DNSRecord[] = [
	{
		recordType: "TXT",
		recordTypeName: "SPF",
		name: "@",
		value: "v=spf1 include:reloop.sh -all",
		ttl: "Auto",
		priority: null,
	},
	{
		recordType: "MX",
		recordTypeName: "MX",
		name: "send",
		value: "reloop.sh",
		ttl: "Auto",
		priority: 10,
	},
];

const sampleDmarc: DNSRecord[] = [
	{
		recordType: "TXT",
		recordTypeName: "DMARC",
		name: "_dmarc",
		value: "v=DMARC1; p=reject;",
		ttl: "Auto",
		priority: null,
	},
];

const sampleReceiving: DNSRecord[] = [
	{
		recordType: "MX",
		recordTypeName: "MX",
		name: "@",
		value: "inbound.reloop.sh",
		ttl: "Auto",
		priority: 10,
	},
];

const sampleTracking: DNSRecord[] = [
	{
		recordType: "CNAME",
		recordTypeName: "CNAME",
		name: "tracking",
		value: "track.reloop.sh",
		ttl: "Auto",
		priority: null,
	},
];

export const DnsConfigEmail = ({
	fullName = "User",
	domain = "yourdomain.com",
	dkimRecords = sampleDkim,
	sendingRecords,
	dmarcRecords = sampleDmarc,
	receivingRecords = sampleReceiving,
	trackingRecords = sampleTracking,
	spfRecords,
	dashboardUrl = "https://reloop.sh/dashboard",
	baseUrl = defaultBaseUrl,
	theme = "light",
}: DnsConfigEmailProps) => {
	const firstName = fullName ? fullName.split(" ").at(0) : "there";
	// Prefer explicit sendingRecords; fall back to legacy spfRecords prop, then samples.
	// Treat "passed empty array" as intentional (no sample fallback).
	const resolvedSending =
		sendingRecords !== undefined
			? sendingRecords
			: spfRecords !== undefined
				? spfRecords
				: sampleSending;
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
		const typeLabel = record.recordTypeName || record.recordType;
		const showPriority =
			record.priority !== null &&
			record.priority !== undefined &&
			record.recordType.toUpperCase() === "MX";

		return (
			<div
				style={{
					padding: "20px",
					borderBottom: isLast ? "none" : `1px solid ${color.separator}`,
				}}
			>
				{/* Top metadata row: Type, TTL, Priority */}
				<table
					width="100%"
					cellPadding="0"
					cellSpacing="0"
					style={{ marginBottom: "14px" }}
				>
					<tr>
						<td
							style={{
								verticalAlign: "top",
								paddingRight: "24px",
								width: "auto",
							}}
						>
							<p
								style={{
									margin: "0 0 6px 0",
									fontFamily: "monospace",
									fontSize: "10px",
									fontWeight: "600",
									letterSpacing: "0.12em",
									textTransform: "uppercase",
									color: color.label,
								}}
							>
								Type
							</p>
							<span
								style={{
									fontFamily: "monospace",
									fontSize: "13px",
									fontWeight: "700",
									backgroundColor: color.badge,
									color: color.text,
									borderRadius: "6px",
									padding: "4px 8px",
									display: "inline-block",
								}}
							>
								{record.recordType}
							</span>
							{typeLabel !== record.recordType && (
								<span
									style={{
										fontFamily: "monospace",
										fontSize: "11px",
										color: color.muted,
										marginLeft: "8px",
									}}
								>
									{typeLabel}
								</span>
							)}
						</td>
						<td
							style={{
								verticalAlign: "top",
								paddingRight: "24px",
								width: "auto",
							}}
						>
							<p
								style={{
									margin: "0 0 6px 0",
									fontFamily: "monospace",
									fontSize: "10px",
									fontWeight: "600",
									letterSpacing: "0.12em",
									textTransform: "uppercase",
									color: color.label,
								}}
							>
								TTL
							</p>
							<span
								style={{
									fontFamily: "monospace",
									fontSize: "13px",
									fontWeight: "600",
									color: color.mono,
									display: "inline-block",
									padding: "4px 0",
								}}
							>
								{record.ttl}
							</span>
						</td>
						<td style={{ verticalAlign: "top", width: "100%" }}>
							{showPriority && (
								<>
									<p
										style={{
											margin: "0 0 6px 0",
											fontFamily: "monospace",
											fontSize: "10px",
											fontWeight: "600",
											letterSpacing: "0.12em",
											textTransform: "uppercase",
											color: color.label,
										}}
									>
										Priority
									</p>
									<span
										style={{
											fontFamily: "monospace",
											fontSize: "13px",
											fontWeight: "600",
											color: color.mono,
											display: "inline-block",
											padding: "4px 0",
										}}
									>
										{record.priority}
									</span>
								</>
							)}
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
		description,
		records,
	}: {
		stepNum: string;
		title: string;
		description?: string;
		records: DNSRecord[];
	}) => (
		<Section style={{ marginTop: "32px" }}>
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
						{description ? (
							<p
								style={{
									margin: "4px 0 0 0",
									fontSize: "13px",
									color: color.muted,
									lineHeight: "1.5",
								}}
							>
								{description}
							</p>
						) : null}
					</td>
				</tr>
			</table>

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
						key={`${record.recordType}-${record.name}-${record.value}-${i}`}
						record={record}
						index={i}
						total={records.length}
					/>
				))}
			</div>
		</Section>
	);

	// Dynamic step numbers for groups that actually have records
	const groups: {
		title: string;
		description?: string;
		records: DNSRecord[];
	}[] = [];

	if (dkimRecords.length > 0) {
		groups.push({
			title: "Domain Verification (DKIM)",
			description: "Proves Reloop is authorized to sign mail for this domain.",
			records: dkimRecords,
		});
	}
	if (resolvedSending.length > 0) {
		groups.push({
			title: "Email Sending (SPF + MX)",
			description:
				"Authorizes Reloop to send mail and routes bounce/return-path traffic.",
			records: resolvedSending,
		});
	}
	if (dmarcRecords.length > 0) {
		groups.push({
			title: "Reject Spoofed Emails (DMARC)",
			description:
				"Tells receivers how to handle forged mail using your domain.",
			records: dmarcRecords,
		});
	}
	if (receivingRecords.length > 0) {
		groups.push({
			title: "Email Receiving (MX)",
			description: "Delivers inbound mail for this domain to Reloop.",
			records: receivingRecords,
		});
	}
	if (trackingRecords.length > 0) {
		groups.push({
			title: "Tracking (CNAME)",
			description: "Enables open and click tracking under your brand.",
			records: trackingRecords,
		});
	}

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
							Copy the records below into your DNS provider. Only the groups
							listed apply to this domain&apos;s current settings.
						</Text>

						{groups.map((group, index) => (
							<RecordGroup
								key={group.title}
								stepNum={String(index + 1).padStart(2, "0")}
								title={group.title}
								description={group.description}
								records={group.records}
							/>
						))}

						{groups.length === 0 && (
							<Text className={cls.bodyText}>
								No DNS records were found for this domain. Open the dashboard to
								confirm the domain was set up correctly.
							</Text>
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
							<a
								href="https://reloop.sh/docs/guides/connect-domain/dns-records-explained"
								style={{ color: "inherit" }}
							>
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
