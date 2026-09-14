import { connection } from "next/server";
import { Suspense } from "react";
import { pageMetadata } from "#/app/_lib/page-metadata";
import { DEFAULT_SMTP_HOST } from "#/features/smtp/smtp-code-examples";
import { SmtpPage } from "./client";

export const metadata = pageMetadata(
	"SMTP Relay · Reloop",
	"Send emails using SMTP relay with Reloop credentials.",
);

async function SmtpRelay() {
	await connection();

	return (
		<SmtpPage
			smtpHost={process.env.SMTP_HOSTNAME?.trim() || DEFAULT_SMTP_HOST}
		/>
	);
}

export default function SmtpRoute() {
	return (
		<Suspense>
			<SmtpRelay />
		</Suspense>
	);
}
