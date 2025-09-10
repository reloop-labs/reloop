import { Column, Hr, Link, Row, Section, Text } from "@react-email/components";
import React from "react";
import { getEmailInlineStyles, getEmailThemeClasses } from "./theme";

export function Footer() {
	const themeClasses = getEmailThemeClasses();
	const lightStyles = getEmailInlineStyles("light");

	return (
		<Section className="w-full">
			<Hr
				className={themeClasses.border}
				style={{ borderColor: lightStyles.container.borderColor }}
			/>

			<br />

			<Text
				className={`font-regular text-[21px] ${themeClasses.text}`}
				style={{ color: lightStyles.text.color }}
			>
				Run your business smarter.
			</Text>

			<br />

			<Row>
				<Column
					style={{ width: "33%", paddingRight: "10px", verticalAlign: "top" }}
				>
					<Text
						className={`font-medium ${themeClasses.text}`}
						style={{ color: lightStyles.text.color }}
					>
						Features
					</Text>
					<Link
						className={`mb-1.5 block text-[14px] ${themeClasses.mutedLink}`}
						href="https://go.midday.ai/bOp4NOx"
						style={{ color: lightStyles.mutedText.color }}
					>
						Overview
					</Link>
					<Link
						className={`mb-1.5 block text-[14px] ${themeClasses.mutedLink}`}
						href="https://go.midday.ai/VFcNsmQ"
						style={{ color: lightStyles.mutedText.color }}
					>
						Inbox
					</Link>
					<Link
						className={`mb-1.5 block text-[14px] ${themeClasses.mutedLink}`}
						href="https://go.midday.ai/uA06kWO"
						style={{ color: lightStyles.mutedText.color }}
					>
						Vault
					</Link>
					<Link
						className={`mb-1.5 block text-[14px] ${themeClasses.mutedLink}`}
						href="https://go.midday.ai/x7Fow9L"
						style={{ color: lightStyles.mutedText.color }}
					>
						Tracker
					</Link>
					<Link
						className={`mb-1.5 block text-[14px] ${themeClasses.mutedLink}`}
						href="https://go.midday.ai/fkYXc95"
						style={{ color: lightStyles.mutedText.color }}
					>
						Invoice
					</Link>
					<Link
						className={`mb-1.5 block text-[14px] ${themeClasses.mutedLink}`}
						href="https://go.midday.ai/dEnP9h5"
						style={{ color: lightStyles.mutedText.color }}
					>
						Pricing
					</Link>
					<Link
						className={`mb-1.5 block text-[14px] ${themeClasses.mutedLink}`}
						href="https://midday.ai/download"
						style={{ color: lightStyles.mutedText.color }}
					>
						Download
					</Link>
				</Column>

				<Column
					style={{ width: "33%", paddingRight: "10px", verticalAlign: "top" }}
				>
					<Text
						className={`font-medium ${themeClasses.text}`}
						style={{ color: lightStyles.text.color }}
					>
						Resources
					</Text>
					<Link
						className={`mb-1.5 block text-[14px] ${themeClasses.mutedLink}`}
						href="https://go.midday.ai/fhEy5CL"
						style={{ color: lightStyles.mutedText.color }}
					>
						Homepage
					</Link>
					<Link
						className={`mb-1.5 block text-[14px] ${themeClasses.mutedLink}`}
						href="https://git.new/midday"
						style={{ color: lightStyles.mutedText.color }}
					>
						Github
					</Link>
					<Link
						className={`mb-1.5 block text-[14px] ${themeClasses.mutedLink}`}
						href="https://go.midday.ai/ZrhEMbR"
						style={{ color: lightStyles.mutedText.color }}
					>
						Support
					</Link>
					<Link
						className={`mb-1.5 block text-[14px] ${themeClasses.mutedLink}`}
						href="https://go.midday.ai/rofdWKi"
						style={{ color: lightStyles.mutedText.color }}
					>
						Terms of service
					</Link>
					<Link
						className={`mb-1.5 block text-[14px] ${themeClasses.mutedLink}`}
						href="https://go.midday.ai/TJIL5mQ"
						style={{ color: lightStyles.mutedText.color }}
					>
						Privacy policy
					</Link>
					<Link
						className={`mb-1.5 block text-[14px] ${themeClasses.mutedLink}`}
						href="https://go.midday.ai/IQ1kcN0"
						style={{ color: lightStyles.mutedText.color }}
					>
						Branding
					</Link>
				</Column>

				<Column style={{ width: "33%", verticalAlign: "top" }}>
					<Text
						className={`font-medium ${themeClasses.text}`}
						style={{ color: lightStyles.text.color }}
					>
						Company
					</Text>
					<Link
						className={`mb-1.5 block text-[14px] ${themeClasses.mutedLink}`}
						href="https://go.midday.ai/186swoH"
						style={{ color: lightStyles.mutedText.color }}
					>
						Story
					</Link>
					<Link
						className={`mb-1.5 block text-[14px] ${themeClasses.mutedLink}`}
						href="https://go.midday.ai/QWyX8Um"
						style={{ color: lightStyles.mutedText.color }}
					>
						Updates
					</Link>
					<Link
						className={`mb-1.5 block text-[14px] ${themeClasses.mutedLink}`}
						href="https://go.midday.ai/Dd7M8cl"
						style={{ color: lightStyles.mutedText.color }}
					>
						Open startup
					</Link>
					<Link
						className={`mb-1.5 block text-[14px] ${themeClasses.mutedLink}`}
						href="https://go.midday.ai/M2Hv420"
						style={{ color: lightStyles.mutedText.color }}
					>
						OSS Friends
					</Link>
				</Column>
			</Row>

			<br />
			<br />

			<br />
			<br />

			<Text
				className={`text-xs ${themeClasses.secondaryText}`}
				style={{ color: lightStyles.secondaryText.color }}
			>
				Midday Labs AB - Torsgatan 59 113 37, Stockholm, Sweden.
			</Text>

			<Link
				className={`block text-[14px] ${themeClasses.mutedLink}`}
				href="https://app.midday.ai/settings/notifications"
				title="Unsubscribe"
				style={{ color: lightStyles.mutedText.color }}
			>
				Notification preferences
			</Link>

			<br />
			<br />
		</Section>
	);
}
