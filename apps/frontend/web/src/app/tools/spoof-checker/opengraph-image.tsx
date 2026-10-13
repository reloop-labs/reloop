import { ImageResponse } from "next/og";
import {
	CheckCircle,
	Chip,
	MUTED,
	PageOgCard,
	Panel,
	RULE,
	ShieldCheck,
	TitledInset,
	WEAK,
} from "../components/og-page-card";
import { loadFonts, size } from "../domain-age/og/og-card";

export { contentType, size } from "../domain-age/og/og-card";
export const alt = "Free Email Spoofing Checker | Reloop";

/** reloop.sh's real result, so the card stays truthful. */
const REASONS = [
	{ title: "Strict DMARC policy (p=reject)", tag: "DMARC" },
	{ title: "SPF configured (~all)", tag: "SPF" },
];

export default async function OpenGraphImage() {
	return new ImageResponse(
		<PageOgCard
			titleLines={["Free Email", "Spoofing Checker"]}
			titleSize={52}
			subtitle="Find out if someone can send email pretending to be you."
			query="reloop.sh"
		>
			<Panel>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						padding: "4px 6px 0",
						gap: 4,
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 8,
							fontSize: 19,
							fontWeight: 700,
						}}
					>
						<ShieldCheck size={22} />
						No, fakes as you@reloop.sh get rejected
					</div>
					<div style={{ display: "flex", fontSize: 14, color: MUTED }}>
						Gmail, Yahoo and Outlook are told to discard forged mail.
					</div>
				</div>
				<TitledInset title="If someone sent a fake email as you">
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 12,
							paddingTop: 12,
						}}
					>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								width: 36,
								height: 36,
								borderRadius: 36,
								backgroundColor: WEAK,
								fontSize: 11,
								fontWeight: 700,
								color: MUTED,
								flexShrink: 0,
							}}
						>
							CEO
						</div>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								flex: 1,
								gap: 2,
							}}
						>
							<div style={{ display: "flex", gap: 6, fontSize: 13 }}>
								<span style={{ fontWeight: 700 }}>CEO</span>
								<span style={{ color: MUTED }}>&lt;ceo@reloop.sh&gt;</span>
							</div>
							<div style={{ display: "flex", fontSize: 14, fontWeight: 500 }}>
								Urgent: wire $40,000 today
							</div>
						</div>
						<Chip tone="success">
							<ShieldCheck size={13} />
							Blocked before the inbox
						</Chip>
					</div>
				</TitledInset>
				<TitledInset title="Why">
					{REASONS.map((reason, i) => (
						<div
							key={reason.title}
							style={{
								display: "flex",
								alignItems: "center",
								gap: 10,
								padding: "10px 0",
								borderBottom:
									i === REASONS.length - 1 ? "none" : `1px solid ${RULE}`,
								fontSize: 14,
								fontWeight: 600,
							}}
						>
							<CheckCircle size={17} />
							{reason.title}
							<Chip>{reason.tag}</Chip>
						</div>
					))}
				</TitledInset>
			</Panel>
		</PageOgCard>,
		{ ...size, fonts: await loadFonts() },
	);
}
