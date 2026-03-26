import { createOpenAPI } from "fumadocs-openapi/server";
import path from "path";

export const openapi = createOpenAPI({
	input: [path.resolve("../api-yaml/contact.yaml")],
});
