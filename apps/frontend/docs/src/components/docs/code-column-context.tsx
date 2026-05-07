"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface CodeColumnContextType {
	codeContent: React.ReactNode | null;
	setCodeContent: (content: React.ReactNode | null) => void;
}

const CodeColumnContext = createContext<CodeColumnContextType | undefined>(
	undefined,
);

export function CodeColumnProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [codeContent, setCodeContent] = useState<React.ReactNode | null>(null);

	return (
		<CodeColumnContext.Provider value={{ codeContent, setCodeContent }}>
			{children}
		</CodeColumnContext.Provider>
	);
}

export function useCodeColumn() {
	const context = useContext(CodeColumnContext);
	if (context === undefined) {
		throw new Error("useCodeColumn must be used within a CodeColumnProvider");
	}
	return context;
}

export function CodePortal({ children }: { children: React.ReactNode }) {
	const { setCodeContent } = useCodeColumn();

	useEffect(() => {
		setCodeContent(children);
		return () => setCodeContent(null);
	}, [children, setCodeContent]);

	return null;
}

export function CodeDisplay() {
	const { codeContent } = useCodeColumn();
	return codeContent;
}
