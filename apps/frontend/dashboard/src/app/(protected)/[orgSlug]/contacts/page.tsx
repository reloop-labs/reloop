import type { Metadata } from "next";
import { ContactList } from "./components/contact-list";

export const metadata: Metadata = {
	title: "Contacts · Reloop",
	description: "Manage your contacts and audience data.",
};

const ContactsPage = () => {
	return <ContactList />;
};

export default ContactsPage;
