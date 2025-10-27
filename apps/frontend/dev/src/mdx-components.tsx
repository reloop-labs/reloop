import { openapi } from "@reloop/fe-dev/lib/source";
import { APIPage } from "fumadocs-openapi/ui";
import * as File from "fumadocs-ui/components/files";
import * as TabsComponents from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
	return {
		...defaultMdxComponents,
		APIPage: (props) => <APIPage {...openapi.getAPIPageProps(props)} />,
		...TabsComponents,
		...components,
		...File,
	};
}
