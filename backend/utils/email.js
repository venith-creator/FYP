// utils/email.js

import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}) => {
  try {

    console.log("Sending email to:", to);

    const response = await resend.emails.send({
      from:
        process.env.RESEND_FROM ||
        "FYP PATRICK <fyp@serviceconnect.uk>",
      to,
      subject,
      html,
      text,
    });

    console.log("RESEND RESPONSE:");
    console.dir(response, { depth: null });

    return response;

  } catch (err) {

    console.error("RESEND ERROR:");
    console.dir(err, { depth: null });

    throw err;

  }
};