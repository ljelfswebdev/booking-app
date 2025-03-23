import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { clientEmail, fullName, bookingDate } = await req.json();

    if (!clientEmail || !fullName || !bookingDate) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Configure SMTP Transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email to Client
    const clientMailOptions = {
      from: `"Your Business" <${process.env.SMTP_USER}>`,
      to: clientEmail, // Client's email
      subject: "Booking Confirmation",
      text: `Hi ${fullName},\n\nYour booking is confirmed for ${bookingDate}.\n\nThank you!`,
    };

    // Email to Admin (You)
    const adminMailOptions = {
      from: `"Booking System" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL, // Your email
      subject: "New Booking Received",
      text: `A new booking has been made:\n\nClient Name: ${fullName}\nClient Email: ${clientEmail}\nBooking Date: ${bookingDate}`,
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(clientMailOptions),
      transporter.sendMail(adminMailOptions),
    ]);

    return NextResponse.json({ message: "Emails sent successfully!" }, { status: 200 });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Error sending email" }, { status: 500 });
  }
}