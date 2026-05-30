import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, message } = body;

    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // In a production environment, you would use Resend, SendGrid, etc. here.
    // Example with Resend:
    // await resend.emails.send({ from: 'DSAT.JO <noreply@dsat.jo>', to, subject, text: message });

    console.log('\n--- 📧 MOCK EMAIL SENT ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message:\n${message}`);
    console.log('--------------------------\n');

    return NextResponse.json({ success: true, message: 'Email mock sent successfully' });
  } catch (error: any) {
    console.error('Email API Error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
