import type { MailModel } from "@reloop/be-mail/routes/mail/mail.model.js";

export namespace MailTypes {
    export type SendEmailBody = typeof MailModel.sendEmailBody.static;
    export type SendEmailResponse = typeof MailModel.sendEmailResponse.static;
    export type Unauthorized = typeof MailModel.unauthorized.static;
    export type Forbidden = typeof MailModel.forbidden.static;
    export type BadRequest = typeof MailModel.badRequest.static;
    export type InternalServerError = typeof MailModel.internalServerError.static;
    export type DomainNotFound = typeof MailModel.domainNotFound.static;
    export type MailboxNotFound = typeof MailModel.mailboxNotFound.static;

    // Internal interfaces for controller use
    export interface SendEmailRequest {
        from: string;
        to: string | string[];
        subject: string;
        text?: string;
        html?: string;
        replyTo?: string;
        cc?: string | string[];
        bcc?: string | string[];
    }

    export interface SendEmailHandlerResponse {
        success: boolean;
        messageId: string;
        status: string;
        timestamp: string;
    }
}
