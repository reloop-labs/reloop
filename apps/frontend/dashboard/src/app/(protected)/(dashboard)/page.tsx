import { HomePage } from "./home-client";

// Client-only home (session/org gates) cannot opt into instant navigation.
// Without this, client transitions from onboarding "Go to Dashboard" drop the
// segment and leave the user stuck (Next: instant-unrendered-segment).
export const instant = false;

export default function DashboardHomePage() {
	return <HomePage />;
}
