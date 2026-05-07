import { bus, BusEvent } from "./src";

async function test() {
  console.log("Connecting to NATS...");
  await bus.connect("nats://localhost:4222");
  console.log("Connected.");

  console.log("Subscribing to USER_CREATED...");
  await bus.subscribe(BusEvent.USER_CREATED, (payload) => {
    console.log("✅ Received USER_CREATED:", payload);
  });

  console.log("Publishing USER_CREATED...");
  await bus.publish(BusEvent.USER_CREATED, {
    id: "user_123",
    email: "test@example.com",
    name: "Test User",
  });

  // Wait a bit for the message to arrive
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("Closing connection...");
  await bus.close();
  console.log("Done.");
}

test().catch(console.error);
