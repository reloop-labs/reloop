import { kumomtaClient } from "@reloop/be-mail/lib/kumomta-client";
import { ConfirmEmail } from "@reloop/react-email";
import { render } from "@reloop/react-email/render";

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

export async function testKumomtaSendController(): Promise<TestKumomtaSendResponse> {
  const timestamp = new Date().toISOString();

  const TEST_CONFIG = {
    from: "test@deployx.dev",
    to: "jxgyc.test@inbox.testmail.app",
    subject: "Confirm your email - Reloop Health Check",
    confirmLink: "https://reloop.app/confirm-test",
  };

  try {
    const html = await render(
      ConfirmEmail({ confirmLink: TEST_CONFIG.confirmLink }),
    );

    const result = await kumomtaClient.sendEmail({
      from: TEST_CONFIG.from,
      to: TEST_CONFIG.to,
      subject: TEST_CONFIG.subject,
      html,
    });

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
