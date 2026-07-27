import { pageMetadata } from "#/app/_lib/page-metadata";
import { ProfilePage } from "./client";

export const metadata = pageMetadata(
	"Profile · Reloop",
	"Manage your personal profile details.",
);

export default function ProfileRoute() {
	return <ProfilePage />;
}
