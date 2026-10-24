import { redirect } from "next/navigation";

export default function LegacyConnectedAppsRoute() {
	redirect("/settings/security/connected-apps");
}
