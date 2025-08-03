"use server";
import nodemailer from "nodemailer";

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"DUBME" <${process.env.GMAIL_USER}>`,
      to: to.toLowerCase().trim(),
      subject: subject.trim(),
      text: text.trim(),
      html: html?.trim(),
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Errore invio email:", error);
    return {
      success: false,
      message: "Errore invio email",
    };
  }
}
