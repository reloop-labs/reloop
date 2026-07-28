declare module "reloop-email" {
	interface ReloopClientOptions {
		apiKey: string;
		baseUrl?: string;
		url?: string;
		key?: string;
	}

	interface SendMailParams {
		from: string;
		to: string | string[];
		subject: string;
		html?: string;
		text?: string;
		reply_to?: string | string[];
		cc?: string | string[];
		bcc?: string | string[];
		headers?: Record<string, string>;
		tags?: Array<{ name: string; value: string }>;
	}

	interface SendMailResponse {
		success?: boolean;
		messageId?: string;
		status?: string;
		timestamp?: string;
		id?: string;
		[key: string]: unknown;
	}

	class MailService {
		send(params: SendMailParams): Promise<SendMailResponse>;
	}

	export class Reloop {
		mail: MailService;
		constructor(options: ReloopClientOptions);
	}
}
