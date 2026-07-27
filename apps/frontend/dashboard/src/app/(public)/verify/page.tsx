import { pageMetadata } from "../../_lib/page-metadata";
import { AutoLoginPage } from "./client";

export const metadata = pageMetadata(
	"Verify | Reloop Dashboard",
	"Reloop Dashboard",
);

export default function VerifyRoute() {
	return <AutoLoginPage />;
}
