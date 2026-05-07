import { bus, BusEvent } from "@reloop/bus";
import { logger } from "@reloop/logger";

export async function initSubscribers() {
  // Subscribe to user created event
  await bus.subscribe(
    BusEvent.USER_CREATED,
    async (payload) => {
      logger.info(`📧 Mail service received USER_CREATED for: ${payload.email}`);
      // Here you would call your mail sending logic
      // e.g., await sendWelcomeEmail(payload.email, payload.name);
    },
    { queue: "mail-service" } // Using a queue group so multiple instances of mail-service don't process the same message
  );

  logger.info("Auth subscribers initialized");
}
