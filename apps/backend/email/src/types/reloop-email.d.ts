declare module "reloop-email" {
	interface ReloopClientOptions {
		apiKey: string;
		baseUrl?: string;
	}

	interface ReloopApiErrorBody {
		message?: string;
		why?: string;
		fix?: string;
		link?: string;
		[key: string]: unknown;
	}

	class ReloopApiError extends Error {
		readonly status: number;
		readonly statusText: string;
		readonly body: ReloopApiErrorBody;
	}

	type ReloopResult<T> =
		| { response: T; error: null }
		| { response: null; error: ReloopApiError };

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
		thread_id?: string;
	}

	interface SendMailResponse {
		success: boolean;
		messageId: string;
		status: string;
		timestamp: string;
		id: string;
	}

	class MailService {
		send(params: SendMailParams): Promise<ReloopResult<SendMailResponse>>;
	}

	export class Reloop {
		public mail: MailService;
		constructor(options: ReloopClientOptions);
	}

	export type {
		ReloopClientOptions,
		ReloopApiErrorBody,
		ReloopResult,
		SendMailParams,
		SendMailResponse,
		MailService,
	};

	export { ReloopApiError };
}
