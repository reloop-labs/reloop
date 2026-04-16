import { webhookConfig } from "@reloop/webhook/webhook.config";
import { Queue, QueueEvents } from "bullmq";

export interface WebhookDeliveryJobData {
  deliveryId: string;
  webhookId: string;
  webhookUrl: string;
  webhookSecret: string;
  customHeaders: Record<string, string> | null;
  eventId: string;
  eventType: string;
  payload: Record<string, unknown>;
  maxRetries: number;
  retryBackoffMultiplier: number;
}

const connection = {
  url: webhookConfig.REDIS_URL,
};

export const WEBHOOK_DELIVERY_QUEUE = "webhook-delivery";

export const webhookDeliveryQueue = new Queue<WebhookDeliveryJobData>(
  WEBHOOK_DELIVERY_QUEUE,
  {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 60_000, // 1 min base — overridden per-job using retryBackoffMultiplier
      },
      removeOnComplete: { count: 500 },
      removeOnFail: { count: 1000 },
    },
  },
);

export const webhookDeliveryQueueEvents = new QueueEvents(
  WEBHOOK_DELIVERY_QUEUE,
  { connection },
);
