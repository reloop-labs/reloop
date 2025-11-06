import { authMiddleware } from "@be/domain/middleware/auth";
import { deleteDNSRecordsRoute } from "@be/domain/routes/dns/routes/delete-dns-records.route";
import { generateDNSRecordsRoute } from "@be/domain/routes/dns/routes/generate-dns-records.route";
import { getDKIMKeysRoute } from "@be/domain/routes/dns/routes/get-dkim-keys.route";
import { getDNSRecordsRoute } from "@be/domain/routes/dns/routes/get-dns-records.route";
import { verifyDNSRecordRoute } from "@be/domain/routes/dns/routes/verify-dns-record.route";
import { Elysia } from "elysia";

export const dnsRoutes = new Elysia({
	prefix: "/v1/dns",
	name: "DNSRoutes",
})
	.use(authMiddleware)
	.use(getDNSRecordsRoute)
	.use(getDKIMKeysRoute)
	.use(verifyDNSRecordRoute)
	.use(generateDNSRecordsRoute)
	.use(deleteDNSRecordsRoute);
