import { redirect } from "next/navigation";

/** Legacy path — keep bookmarks working. */
export default function AgentInboxRedirect() {
	redirect("/inbox");
}
