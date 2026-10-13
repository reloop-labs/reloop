import { ImageResponse } from "next/og";
import {
	Bar,
	CheckCircle,
	INK,
	MUTED,
	PageOgCard,
	Panel,
	ReloopMark,
	RULE,
	SOFT,
	WEAK,
} from "../components/og-page-card";
import { loadFonts, size } from "../domain-age/og/og-card";

export { contentType, size } from "../domain-age/og/og-card";
export const alt = "Free BIMI Checker | Reloop";

const BRAND_ROWS = [
	{ subject: "Our logo is live", time: "1:12 PM" },
	{ subject: "What's new", time: "1:08 PM" },
];

function Avatar() {
	return (
		<div
			style={{
				display: "flex",
				width: 30,
				height: 30,
				borderRadius: 30,
				overflow: "hidden",
				border: `1px solid ${RULE}`,
				flexShrink: 0,
			}}
		>
			<ReloopMark size={30} />
		</div>
	);
}

function MailClient() {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				flex: 1,
				backgroundColor: "#ffffff",
				border: `1px solid ${RULE}`,
				borderRadius: 12,
				overflow: "hidden",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 10,
					padding: "10px 12px",
					borderBottom: `1px solid ${RULE}`,
				}}
			>
				<div style={{ display: "flex", gap: 5 }}>
					{[0, 1, 2].map((dot) => (
						<div
							key={dot}
							style={{
								display: "flex",
								width: 8,
								height: 8,
								borderRadius: 8,
								backgroundColor: RULE,
							}}
						/>
					))}
				</div>
				<div
					style={{
						display: "flex",
						flex: 1,
						height: 24,
						borderRadius: 6,
						backgroundColor: WEAK,
						alignItems: "center",
						paddingLeft: 10,
						fontSize: 12,
						color: SOFT,
					}}
				>
					Search mail
				</div>
			</div>
			<div
				style={{
					display: "flex",
					gap: 18,
					padding: "8px 14px 0",
					fontSize: 12,
					borderBottom: `1px solid ${RULE}`,
				}}
			>
				<div
					style={{
						display: "flex",
						paddingBottom: 7,
						fontWeight: 700,
						borderBottom: `2px solid ${INK}`,
					}}
				>
					Primary
				</div>
				<div style={{ display: "flex", color: SOFT }}>Social</div>
				<div style={{ display: "flex", color: SOFT }}>Promotions</div>
			</div>
			{BRAND_ROWS.map((row) => (
				<div
					key={row.subject}
					style={{
						display: "flex",
						alignItems: "center",
						gap: 10,
						padding: "10px 14px",
						borderBottom: `1px solid ${RULE}`,
						fontSize: 14,
					}}
				>
					<Avatar />
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 4,
							width: 82,
							fontWeight: 700,
						}}
					>
						Reloop
					</div>
					<div
						style={{
							display: "flex",
							flex: 1,
							fontWeight: 500,
							whiteSpace: "nowrap",
						}}
					>
						{row.subject}
					</div>
					<div style={{ display: "flex", fontSize: 12, fontWeight: 700 }}>
						{row.time}
					</div>
				</div>
			))}
			{[64, 80, 56].map((width) => (
				<div
					key={width}
					style={{
						display: "flex",
						alignItems: "center",
						gap: 10,
						padding: "13px 14px",
						borderBottom: `1px solid ${RULE}`,
					}}
				>
					<div
						style={{
							display: "flex",
							width: 30,
							height: 30,
							borderRadius: 30,
							backgroundColor: WEAK,
						}}
					/>
					<div style={{ display: "flex", width: 82 }}>
						<Bar width={width} height={7} />
					</div>
					<div style={{ display: "flex", flex: 1 }}>
						<Bar width="100%" height={7} />
					</div>
					<Bar width={28} height={7} />
				</div>
			))}
		</div>
	);
}

export default async function OpenGraphImage() {
	return new ImageResponse(
		<PageOgCard
			titleLines={["Free BIMI", "Checker"]}
			subtitle="See how your logo shows up next to your email in the inbox."
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
						<CheckCircle size={22} />
						Logo found
					</div>
					<div style={{ display: "flex", fontSize: 14, color: MUTED }}>
						Your logo shows next to your mail in supporting inboxes.
					</div>
				</div>
				<div style={{ display: "flex", gap: 12 }}>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							width: 150,
							flexShrink: 0,
							gap: 14,
							backgroundColor: "#ffffff",
							border: `1px solid ${RULE}`,
							borderRadius: 12,
						}}
					>
						<div
							style={{
								display: "flex",
								width: 104,
								height: 104,
								borderRadius: 24,
								overflow: "hidden",
								border: `1px solid ${RULE}`,
							}}
						>
							<ReloopMark size={104} />
						</div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 7,
								fontSize: 12,
								color: MUTED,
							}}
						>
							<Avatar />
							In the inbox
						</div>
					</div>
					<MailClient />
				</div>
			</Panel>
		</PageOgCard>,
		{ ...size, fonts: await loadFonts() },
	);
}
