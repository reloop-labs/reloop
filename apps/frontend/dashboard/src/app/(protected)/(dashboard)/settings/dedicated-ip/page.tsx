import { pageMetadata } from "#/app/_lib/page-metadata";
import { DedicatedIpPage } from "./client";

export const metadata = pageMetadata(
	"Dedicated IP · Reloop",
	"Dedicated sending IPs and per-provider warmup for this organization.",
);

export default function DedicatedIpRoute() {
	return <DedicatedIpPage />;
}
