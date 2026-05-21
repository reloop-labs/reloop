// scratch/test-smtp.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 25,
  secure: false,
  auth: {
    user: "reloop",
    pass: "rl_prod_PsyTtywH1LAvYmcj3pSGLAtydpg", // Replace with your generated API key
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function run() {
  const info = await transporter.sendMail({
    from: '"Test Sender" <sender@local.reloop.sh>', // Must use the verified domain
    to: "recipient@external.com",
    subject: "Testing Inbound SMTP & NATS Logging",
    text: "Hello World!",
    html: "<b>Hello World!</b>",
  });
  console.log("Message sent:", info.messageId);
}

run().catch(console.error);
