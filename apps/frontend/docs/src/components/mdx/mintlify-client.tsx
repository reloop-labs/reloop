"use client";

import {
	Accordion,
	Callout,
	Card,
	CodeBlock as MintlifyCodeBlock,
	CodeGroup as MintlifyCodeGroup,
	Icon,
	Info,
	Steps as MintlifySteps,
	Tabs as MintlifyTabs,
	Note,
	Tip,
	Warning,
} from "@mintlify/components";
import React from "react";

/**
 * Wrappers around Mintlify's code components that suppress hydration warnings.
 *
 * @mintlify/components sets `fontVariantLigatures: "none"` on the
 * `code-block-root` element only on the client, causing a React 19
 * hydration mismatch. The wrapper's `suppressHydrationWarning`
 * tells React to tolerate the difference.
 */
const CodeGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof MintlifyCodeGroup>>(
	(props, ref) => (
		<div ref={ref} suppressHydrationWarning>
			<MintlifyCodeGroup {...props} />
		</div>
	),
);
CodeGroup.displayName = "CodeGroup";

const CodeBlock = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof MintlifyCodeBlock>>(
	(props, ref) => (
		<div ref={ref} suppressHydrationWarning>
			<MintlifyCodeBlock {...props} />
		</div>
	),
);
CodeBlock.displayName = "CodeBlock";

// Mintlify components use sub-components for items
export const Tabs = MintlifyTabs;
export const Tab = (MintlifyTabs as any).Item;
const Steps = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof MintlifySteps>>(
	({ children, ...props }, ref) => {
		const validChildren = React.Children.toArray(children).filter(React.isValidElement);
		return (
			<div ref={ref} suppressHydrationWarning>
				<MintlifySteps {...props}>{validChildren as any}</MintlifySteps>
			</div>
		);
	},
);
Steps.displayName = "Steps";

const Step = (MintlifySteps as any).Item;

export { Accordion, Callout, Card, CodeBlock, CodeGroup, Icon, Info, Note, Steps, Step, Tip, Warning };

