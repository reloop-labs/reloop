import { kumomtaClient } from "@reloop/be-mail/lib/kumomta-client";
import type { Logger } from "@reloop/logger";

export interface TestKumomtaSendResponse {
  success: boolean;
  messageId?: string;
  response?: string;
  timestamp: string;
  config: {
    from: string;
    to: string;
    subject: string;
  };
  error?: string;
}

export async function testKumomtaSendController({
  logger,
}: {
  logger: Logger;
}): Promise<TestKumomtaSendResponse> {
  const timestamp = new Date().toISOString();

  const TEST_CONFIG = {
    from: "test@deployx.dev",
    to: "jxgyc.test@inbox.testmail.app",
    subject: "Kumomta Health Check",
    text: `Kumomta test email sent at ${timestamp}.\n\nIf you receive this, the mail server is operational.`,
  };

  try {
    logger.info(
      {
        from: TEST_CONFIG.from,
        to: TEST_CONFIG.to,
        baseUrl: kumomtaClient.getConfig().baseUrl,
      },
      "Starting Kumomta test email send via HTTP API",
    );

    const result = await kumomtaClient.sendEmail({
      from: TEST_CONFIG.from,
      to: TEST_CONFIG.to,
      subject: TEST_CONFIG.subject,
      text: TEST_CONFIG.text,
    });

    logger.info(
      {
        messageId: result.messageId,
      },
      "Kumomta test email sent successfully",
    );

    return {
      success: true,
      messageId: result.messageId,
      response: "Email injected via KumoMTA HTTP API",
      timestamp,
      config: {
        from: TEST_CONFIG.from,
        to: TEST_CONFIG.to,
        subject: TEST_CONFIG.subject,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    logger.error(
      {
        error: errorMessage,
        from: TEST_CONFIG.from,
        to: TEST_CONFIG.to,
      },
      "Kumomta test email failed",
    );

    return {
      success: false,
      timestamp,
      config: {
        from: TEST_CONFIG.from,
        to: TEST_CONFIG.to,
        subject: TEST_CONFIG.subject,
      },
      error: errorMessage,
    };
  }
}
