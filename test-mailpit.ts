import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import React from "react";
import { WelcomeEmail } from "./packages/email/emails/welcome";

const transporter = nodemailer.createTransport({
  host: "mailpit.reloop.sh",
  port: 1025,
  secure: false,
  auth: {
    user: "reloop",
    pass: "reloop-smpt-auth",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function main() {
  console.log("Sending test email to mailpit.reloop.sh:1025...");

  try {
    const emailHtml = await render(
      React.createElement(WelcomeEmail, { fullName: "Pranav Patel" }),
    );
    const emailText = await render(
      React.createElement(WelcomeEmail, { fullName: "Pranav Patel" }),
      { plainText: true },
    );

    const info = await transporter.sendMail({
      from: "pranav@marketing.reloop.sh",
      to: "test@reloop.sh",
      subject: "Test Email from Reloop SDK",
      html: emailHtml,
      text: emailText,
    });

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("View it at: https://mailpit.reloop.sh/");
  } catch (error) {
    console.error("❌ Error sending email:", error);

    // Suggest alternative if 1025 fails
    if ((error as any).code === 'ECONNREFUSED' || (error as any).code === 'ETIMEDOUT') {
      console.log("\nTip: If port 1025 is not reachable, try port 25 or 587.");
    }
  }
}

main();
