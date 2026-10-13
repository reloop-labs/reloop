import pkg from "../package.json" with { type: "json" };

export const VERSION: string = pkg.version;
export const PACKAGE_NAME = "reloop-mcp";
export const SERVER_NAME = "reloop";
/**
 * Git commit the running build was made from, baked into the Docker image by
 * CI (`RELOOP_COMMIT` build arg). `dev` for local runs and npm installs.
 */
export const COMMIT: string = process.env.RELOOP_COMMIT?.trim() || "dev";
export const USER_AGENT = `${PACKAGE_NAME}/${VERSION}`;
