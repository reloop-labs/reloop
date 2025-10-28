import type {
    HealthResponse,
    SendEmailResponse,
} from "@reloop/be-mail/routes/mail/mail.type";

export function formatSendEmailResponse(
    data: SendEmailResponse,
): SendEmailResponse {
    return {
        success: data.success,
        messageId: data.messageId,
        status: data.status,
        timestamp: data.timestamp,
    };
}

export function formatHealthResponse(
    status: string,
    smtpConnected: boolean,
    smtpHost: string,
    smtpPort: number,
): HealthResponse {
    return {
        status,
        smtp: {
            connected: smtpConnected,
            host: smtpHost,
            port: smtpPort,
        },
        timestamp: new Date().toISOString(),
    };
}
