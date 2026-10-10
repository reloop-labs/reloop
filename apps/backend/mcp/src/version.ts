import pkg from "../package.json" with { type: "json" };

export const VERSION: string = pkg.version;
export const PACKAGE_NAME = "reloop-mcp";
export const SERVER_NAME = "reloop";
export const USER_AGENT = `${PACKAGE_NAME}/${VERSION}`;
