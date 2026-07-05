import type { Metadata } from "next";
import { ContactDetailContent } from "./contact-detail-content";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "Contact Detail · Reloop",
	description: "View and manage contact details.",
};

export default function ContactDetailPage() {
	return <ContactDetailContent />;
}
