import { redirect } from "next/navigation";

export default function EmailsPageRedirect() {
	redirect("/emails/sent");
}
