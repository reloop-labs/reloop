import type { Metadata } from "next";
import { ContactDetailContent } from "./contact-detail-content";

export const metadata: Metadata = {
	title: "Contact Detail · Reloop",
	description: "View and manage contact details.",
};

export default function ContactDetailPage() {
	return <ContactDetailContent />;
}
