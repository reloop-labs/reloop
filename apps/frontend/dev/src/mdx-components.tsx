import * as File from "fumadocs-ui/components/files";
import * as TabsComponents from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { openapi } from '@/lib/source';
import { APIPage } from 'fumadocs-openapi/ui'

export function getMDXComponents(components?: MDXComponents): MDXComponents {
	return {
		...defaultMdxComponents,
		APIPage: (props) => <APIPage {...openapi.getAPIPageProps(props)} />,
		...TabsComponents,
		...components,
		...File,
	};
}
