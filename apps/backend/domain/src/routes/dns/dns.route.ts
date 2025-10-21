import { Elysia } from "elysia";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { deleteDNSRecordsRoute } from "@reloop/domain/routes/dns/routes/delete-dns-records.route";
import { generateDNSRecordsRoute } from "@reloop/domain/routes/dns/routes/generate-dns-records.route";
import { getDKIMKeysRoute } from "@reloop/domain/routes/dns/routes/get-dkim-keys.route";
import { getDNSRecordsRoute } from "@reloop/domain/routes/dns/routes/get-dns-records.route";
import { verifyDNSRecordRoute } from "@reloop/domain/routes/dns/routes/verify-dns-record.route";

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
