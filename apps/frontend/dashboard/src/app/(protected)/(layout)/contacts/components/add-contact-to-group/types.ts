export interface Contact {
	id: string;
	email: string;
	firstName?: string | null;
	lastName?: string | null;
}

export interface AddContactToGroupModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}
