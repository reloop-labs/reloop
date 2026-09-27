import { redirect } from "next/navigation";

/** Legacy path, keeps bookmarks working. */
export default function AgentInboxRedirect() {
	redirect("/inbox");
}
