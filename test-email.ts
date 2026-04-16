import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 25,
  secure: false, // TLS on 25 is starttls, secure: false means no implicit TLS
  auth: {
    user: "testuser",
    pass: "rl_live_bChwFljrqG0R7saD3aDLC9M-1m2rhYjc58ImHNRlSAFTrNXbrJ2c2PjVcKxF0OsG4tenHxexjmepqUTOsjEQWQ"
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function main() {
  try {
    const info = await transporter.sendMail({
      from: "pranav@local.reloop.sh",
      to: "test@example.com",
      subject: "Test email from Node",
      text: "This is a test email sent through the local KumoMTA server!"
    });
    console.log("Email sent successfully: ", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

main();
