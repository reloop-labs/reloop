import { redirect } from "next/navigation";

export default function EmailsIndexRoute() {
	redirect("/emails/sent");
}
