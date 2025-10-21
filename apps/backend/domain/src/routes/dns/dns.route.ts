import { Elysia } from "elysia";
import { authMiddleware } from "../../middleware/auth";
import { deleteDNSRecordsRoute } from "./routes/delete-dns-records.route";
import { generateDNSRecordsRoute } from "./routes/generate-dns-records.route";
import { getDKIMKeysRoute } from "./routes/get-dkim-keys.route";
import { getDNSRecordsRoute } from "./routes/get-dns-records.route";
import { verifyDNSRecordRoute } from "./routes/verify-dns-record.route";

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
