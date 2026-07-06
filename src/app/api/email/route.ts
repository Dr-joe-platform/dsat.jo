import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { to, subject, html } = await req.json();

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Configure Nodemailer with environment variables
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // This should be an App Password, not the regular account password
      },
    });

    // Send the email
    const info = await transporter.sendMail({
      from: `"DSAT.JO" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Email sending error:', error);
    // Return a soft success if email credentials aren't set up yet, 
    // so we don't block the user's workflow in development.
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("EMAIL_USER or EMAIL_PASS not set in .env. Skipping email sending.");
      return NextResponse.json({ success: true, warning: 'Email credentials not configured.' });
    }
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
