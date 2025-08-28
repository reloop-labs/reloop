export interface SendMailRequest {
	user: string;
	passwd: string;
	from: string;
	to: string;
	subject: string;
	text?: string;
	html?: string;
}

export interface SendMailResponse {
	success: boolean;
	messageId?: string;
	error?: string;
}

export interface AddDomainRequest {
	domain: string;
	mail: string;
	password: string;
}

export interface AddDomainResponse {
	success: boolean;
	dns?: {
		MX: string;
		SPF: string;
		DKIM: string;
		DMARC: string;
		IP: string;
	};
	error?: string;
}

export interface RemoveDomainRequest {
	domain: string;
}

export interface RemoveDomainResponse {
	success: boolean;
	message?: string;
	error?: string;
}

export interface AddUserRequest {
	domain: string;
	username: string;
	password: string;
	aliases?: string[];
}

export interface AddUserResponse {
	success: boolean;
	user?: string;
	aliases?: string[];
	message?: string;
	error?: string;
}

export interface RemoveUserRequest {
	domain: string;
	username: string;
}

export interface RemoveUserResponse {
	success: boolean;
	user?: string;
	message?: string;
	error?: string;
}

export interface GetMailsRequest {
	email: string;
}

export interface GetMailsResponse {
	success: boolean;
	count?: number;
	mails?: Array<{
		subject: string;
		from: string;
		date: string;
		preview: string;
		fileName: string;
	}>;
	error?: string;
}

export interface GetMailsIMAPRequest {
	user: string;
	password: string;
	count?: number;
	mailbox?: string;
}

export interface GetMailsIMAPResponse {
	success: boolean;
	emails?: Array<{
		uid: number | null;
		seqno: number;
		from: string;
		to: string;
		subject: string;
		date: string;
		text: string;
		html: string;
		headers: any;
	}>;
	error?: string;
}

export interface VirtualDomain {
	id: number;
	name: string;
}

export interface VirtualUser {
	id: number;
	domainId: number;
	email: string;
	password: string;
	createdAt: Date;
}

export interface VirtualAlias {
	id: number;
	domainId: number;
	source: string;
	destination: string;
}
