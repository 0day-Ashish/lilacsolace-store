import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, imageData } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Validate image data
    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Send email with image attachment
    const { data, error } = await resend.emails.send({
      from: 'Lilacsolace Photo Booth <noreply@resend.dev>', // Update with your verified domain
      to: email,
      subject: 'Your Photo from Lilacsolace Photo Booth',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c8a2c8;">Your Photo is Ready! 📸</h2>
          <p>Thank you for using Lilacsolace Photo Booth!</p>
          <p>Your generated photo is attached to this email.</p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Made with ❤️ by <a href="https://arddev.vercel.app" style="color: #c8a2c8;">ard.dev</a>
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `photo-${Date.now()}.jpg`,
          content: imageBuffer,
        },
      ],
    });

    if (error) {
      console.error('Resend error:', error);
      
      // Handle Resend validation errors
      if (error.message?.includes('only send testing emails')) {
        return NextResponse.json(
          { 
            error: 'Email service is in testing mode. Please verify your domain in Resend to send emails to all recipients.',
            testingMode: true
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Send email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
