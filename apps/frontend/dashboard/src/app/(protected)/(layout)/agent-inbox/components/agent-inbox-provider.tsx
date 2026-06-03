"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import {
	type AgentMailbox,
	agentMailboxes as initialMailboxes,
} from "../mock-data";

export type NewAgentAddressInput = {
	label: string;
	localPart: string;
	domain: string;
	description: string;
	securityLevel: AgentMailbox["securityLevel"];
};

interface AgentInboxContextValue {
	mailboxes: AgentMailbox[];
	getMailbox: (id: string) => AgentMailbox | undefined;
	addMailbox: (input: NewAgentAddressInput) => AgentMailbox;
}

const AgentInboxContext = createContext<AgentInboxContextValue | null>(null);

export const AgentInboxProvider = ({ children }: { children: ReactNode }) => {
	const [mailboxes, setMailboxes] = useState<AgentMailbox[]>(initialMailboxes);

	const getMailbox = useCallback(
		(id: string) => mailboxes.find((m) => m.id === id),
		[mailboxes],
	);

	const addMailbox = useCallback((input: NewAgentAddressInput) => {
		const email = `${input.localPart}@${input.domain}`;
		const mailbox: AgentMailbox = {
			id: `mb-${Date.now()}`,
			email,
			label: input.label,
			description: input.description,
			status: "active",
			securityLevel: input.securityLevel,
			createdAt: new Date().toISOString(),
		};
		setMailboxes((prev) => [...prev, mailbox]);
		return mailbox;
	}, []);

	const value = useMemo(
		() => ({ mailboxes, getMailbox, addMailbox }),
		[mailboxes, getMailbox, addMailbox],
	);

	return (
		<AgentInboxContext.Provider value={value}>
			{children}
		</AgentInboxContext.Provider>
	);
};

export const useAgentInbox = () => {
	const ctx = useContext(AgentInboxContext);
	if (!ctx) {
		throw new Error("useAgentInbox must be used within AgentInboxProvider");
	}
	return ctx;
};
