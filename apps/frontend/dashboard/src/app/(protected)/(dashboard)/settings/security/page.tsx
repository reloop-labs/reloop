import { pageMetadata } from "#/app/_lib/page-metadata";
import { SecurityPage } from "./client";

export const metadata = pageMetadata(
	"Security · Reloop",
	"Manage your account security, connected accounts, and active sessions.",
);

export default function SecurityRoute() {
	return <SecurityPage />;
}
