"use client";

// Re-export @mintlify/components through a client boundary.
// The package uses React.createContext internally but doesn't include
// a "use client" directive, which causes a Runtime TypeError when
// rendered via next-mdx-remote/rsc (React Server Components).
export {
	Accordion,
	Callout,
	Card,
	CodeGroup as CodeBlock,
	Info,
	Note,
	Steps,
	Tabs,
	Tip,
	Warning,
} from "@mintlify/components";
