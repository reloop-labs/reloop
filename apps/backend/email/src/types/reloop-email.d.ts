declare module "reloop-email" {
	interface ReloopClientOptions {
		apiKey?: string;
		baseUrl?: string;
		key?: string;
		url?: string;
	}

	interface SendMailParams {
		from: string;
		to: string | string[];
		subject: string;
		cc?: string | string[];
		bcc?: string | string[];
		text?: string;
		html?: string;
		reply_to?: string | string[];
		scheduled_at?: string;
		headers?: Record<string, string>;
		channel_id?: string;
		attachments?: Array<{
			content?: string | unknown;
			filename?: string;
			path?: string;
			content_type?: string;
			content_id?: string;
		}>;
		tags?: Array<{
			name: string;
			value: string;
		}>;
		template?: {
			id: string;
			variables?: Record<string, string | number>;
		};
	}

	interface SendMailResponse {
		success: boolean;
		messageId: string;
		status: string;
		timestamp: string;
	}

	class MailService {
		send(params: SendMailParams): Promise<SendMailResponse>;
	}

	export class Reloop {
		public mail: MailService;
		constructor(options: ReloopClientOptions);
	}

	export { ReloopClientOptions, SendMailParams, SendMailResponse, MailService };
}
