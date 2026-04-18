import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import React from "react";
import { WelcomeEmail } from "./packages/email/emails/welcome";

const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 25,
  secure: false, // TLS on 25 is starttls, secure: false means no implicit TLS
  auth: {
    user: "reloop",
    pass: "rl_live_bChwFljrqG0R7saD3aDLC9M-1m2rhYjc58ImHNRlSAFTrNXbrJ2c2PjVcKxF0OsG4tenHxexjmepqUTOsjEQWQ",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function main() {
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
      to: "test@example.com",
      subject: "ssss",
      html: emailHtml,
      text: emailText,
    });
    console.log("Email sent successfully: ", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

main();
