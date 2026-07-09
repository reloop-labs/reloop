import { Elysia } from "elysia";
import { archiveThreadRoute } from "./archive-thread/archive-thread.route";
import { batchThreadsRoute } from "./batch-threads/batch-threads.route";
import { deleteThreadRoute } from "./delete-thread/delete-thread.route";
import { getThreadRoute } from "./get-thread/get-thread.route";
import { getThreadAttachmentRoute } from "./get-thread-attachment/get-thread-attachment.route";
import { listThreadsRoute } from "./list-threads/list-threads.route";
import { markThreadReadRoute } from "./mark-thread-read/mark-thread-read.route";
import { restoreThreadRoute } from "./restore-thread/restore-thread.route";
import { snoozeThreadRoute } from "./snooze-thread/snooze-thread.route";
import { toggleThreadStarRoute } from "./toggle-thread-star/toggle-thread-star.route";
import { trashThreadRoute } from "./trash-thread/trash-thread.route";
import { unsnoozeThreadRoute } from "./unsnooze-thread/unsnooze-thread.route";
import { updateThreadRoute } from "./update-thread/update-thread.route";

export const threadsRoutes = new Elysia({
	prefix: "/v1/threads",
	name: "ThreadsRoutes",
})
	.use(listThreadsRoute)
	.use(batchThreadsRoute)
	.use(getThreadRoute)
	.use(getThreadAttachmentRoute)
	.use(updateThreadRoute)
	.use(markThreadReadRoute)
	.use(toggleThreadStarRoute)
	.use(archiveThreadRoute)
	.use(trashThreadRoute)
	.use(restoreThreadRoute)
	.use(snoozeThreadRoute)
	.use(unsnoozeThreadRoute)
	.use(deleteThreadRoute);
