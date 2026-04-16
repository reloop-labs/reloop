import { domainConfig } from "@be/domain/domain.config";
import { Queue, QueueEvents } from "bullmq";

export interface DomainVerificationJobData {
  domainId: string;
  organizationId: string;
}

const connection = {
  url: domainConfig.REDIS_URL,
};

export const DOMAIN_VERIFICATION_QUEUE = "domain-verification";

export const domainVerificationQueue =
  new Queue<DomainVerificationJobData>(DOMAIN_VERIFICATION_QUEUE, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 30_000,
      },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 200 },
    },
  });

export const domainVerificationQueueEvents = new QueueEvents(
  DOMAIN_VERIFICATION_QUEUE,
  { connection },
);
