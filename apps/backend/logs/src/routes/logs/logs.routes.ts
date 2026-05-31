import { Elysia } from "elysia";
import { contactActivityRoute } from "./contact-activity/contact-activity.route";
import { getEmailLogRoute } from "./get-email-log/get-email-log.route";
import { getEmailStatsRoute } from "./get-email-stats/get-email-stats.route";
import { getLogRoute } from "./get-log/get-log.route";
import { listEmailLogsRoute } from "./list-email-logs/list-email-logs.route";
import { listLogsRoute } from "./list-logs/list-logs.route";

export const logsRoutes = new Elysia({
	prefix: "/v1",
	name: "LogsRoutes",
})
	.use(listLogsRoute)
	.use(getLogRoute)
	.use(listEmailLogsRoute)
	.use(contactActivityRoute) // Must come before getEmailLogRoute (:id param)
	.use(getEmailLogRoute)
	.use(getEmailStatsRoute);
