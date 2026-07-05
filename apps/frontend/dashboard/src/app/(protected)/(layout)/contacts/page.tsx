import type { Metadata } from "next";
import { ContactList } from "./components/contacts/contact-list";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "Contacts · Reloop",
	description: "Manage your contacts and audience data.",
};

const ContactsPage = () => {
	return <ContactList />;
};

export default ContactsPage;
