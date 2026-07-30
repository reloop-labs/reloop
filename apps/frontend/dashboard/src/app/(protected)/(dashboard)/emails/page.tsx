import { redirect } from "next/navigation";

/** Legacy `/emails` → dashboard home (sent). */
export default function EmailsIndexRoute() {
	redirect("/");
}
