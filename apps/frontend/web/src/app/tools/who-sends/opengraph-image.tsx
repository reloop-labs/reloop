import { ImageResponse } from "next/og";
import {
	AlertTriangle,
	Chip,
	MUTED,
	PageOgCard,
	Panel,
	RULE,
	TitledInset,
} from "../components/og-page-card";
import { loadFonts, size } from "../domain-age/og/og-card";

export { contentType, size } from "../domain-age/og/og-card";
export const alt = "Free Email Sender Lookup | Reloop";

const SENDERS = [
	{
		vendor: "Google Workspace",
		role: "Inbox + sending",
		via: "SPF include: _spf.google.com",
		leftover: false,
	},
	{
		vendor: "Amazon SES",
		role: "Sending only",
		via: "SPF include: amazonses.com",
		leftover: false,
	},
	{
		vendor: "Zendesk",
		role: "Sending only",
		via: "SPF include: mail.zendesk.com",
		leftover: true,
	},
];

export default async function OpenGraphImage() {
	return new ImageResponse(
		<PageOgCard
			titleLines={["Free Email", "Sender Lookup"]}
			subtitle="See which services can send email as any domain."
			query="stripe.com"
		>
			<Panel>
				<TitledInset title="Who can send as stripe.com (5)">
					{SENDERS.map((sender, i) => (
						<div
							key={sender.vendor}
							style={{
								display: "flex",
								flexDirection: "column",
								gap: 5,
								padding: "13px 0",
								borderBottom:
									i === SENDERS.length - 1 ? "none" : `1px solid ${RULE}`,
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
								}}
							>
								<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
									<span style={{ fontSize: 16, fontWeight: 700 }}>
										{sender.vendor}
									</span>
									<Chip>{sender.role}</Chip>
									{sender.leftover ? (
										<Chip tone="warn">
											<AlertTriangle size={12} />
											Likely leftover
										</Chip>
									) : null}
								</div>
								<Chip>Verified in SPF</Chip>
							</div>
							<div style={{ display: "flex", fontSize: 13, color: MUTED }}>
								{sender.via}
							</div>
						</div>
					))}
				</TitledInset>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 10,
						padding: "12px 16px",
						backgroundColor: "#ffffff",
						border: `1px solid ${RULE}`,
						borderRadius: 12,
						fontSize: 13,
						color: MUTED,
					}}
				>
					<span style={{ fontWeight: 700, color: "#171717" }}>Inbox</span>
					Google Workspace · aspmx.l.google.com
				</div>
			</Panel>
		</PageOgCard>,
		{ ...size, fonts: await loadFonts() },
	);
}
