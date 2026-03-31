import { Elysia } from "elysia";
import { createLogRoute } from "./create-log/create-log.route";
import { getLogRoute } from "./get-log/get-log.route";
import { listLogsRoute } from "./list-logs/list-logs.route";

export const logsRoutes = new Elysia({
	prefix: "/v1",
	name: "LogsRoutes",
})
	.use(createLogRoute)
	.use(listLogsRoute)
	.use(getLogRoute);
