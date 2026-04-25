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
    pass: "rl_prod_aQu-7wmZCSQUDzg2bqkyD2MyJ9GjnUziuupidfDHo9TOnknqxk7h689fTqRSz0I--RtsPgKSMswYw4x7G_Ra-Q",
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
      from: "pranav@mail.qubit.email",
      to: "test@example.com",
      subject: "tttt",
      html: emailHtml,
      text: emailText,
    });
    console.log("Email sent successfully: ", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

main();
