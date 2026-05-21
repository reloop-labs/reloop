import { Elysia } from "elysia";
import { createVersionRoute } from "./create-version/create-version.route";
import { deleteVersionRoute } from "./delete-version/delete-version.route";
import { listVersionsRoute } from "./list-versions/list-versions.route";
import { restoreVersionRoute } from "./restore-version/restore-version.route";

export const versionRoutes = new Elysia({
	name: "VersionRoutes",
})
	.use(createVersionRoute)
	.use(listVersionsRoute)
	.use(deleteVersionRoute)
	.use(restoreVersionRoute);
