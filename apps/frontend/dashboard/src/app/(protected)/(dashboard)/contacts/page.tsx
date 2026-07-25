import { pageMetadata } from "#/app/_lib/page-metadata";
import { ContactList } from "./client";

export const metadata = pageMetadata(
	"Contacts · Reloop",
	"Manage your contacts and audience data.",
);

export default function ContactsRoute() {
	return <ContactList />;
}
