"use client";

import {
	Accordion,
	Callout,
	Card,
	CodeGroup as CodeBlock,
	Icon,
	Info,
	Steps as MintlifySteps,
	Tabs as MintlifyTabs,
	Note,
	Tip,
	Warning,
} from "@mintlify/components";

// Mintlify components use sub-components for items
export const Tabs = MintlifyTabs;
export const Tab = (MintlifyTabs as any).Item;
export const Steps = MintlifySteps;
export const Step = (MintlifySteps as any).Item;

export { Accordion, Callout, Card, CodeBlock, Icon, Info, Note, Tip, Warning };
