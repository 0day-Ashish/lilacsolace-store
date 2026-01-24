import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const EMAILS_FILE = path.join(process.cwd(), 'data', 'emails.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }
}

// Read existing emails
async function readEmails(): Promise<string[]> {
  try {
    if (!existsSync(EMAILS_FILE)) {
      return [];
    }
    const data = await readFile(EMAILS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write emails to file
async function writeEmails(emails: string[]): Promise<void> {
  await ensureDataDir();
  await writeFile(EMAILS_FILE, JSON.stringify(emails, null, 2), 'utf-8');
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Read existing emails
    const emails = await readEmails();

    // Check if email already exists (prevent duplicates)
    if (!emails.includes(email.toLowerCase())) {
      emails.push(email.toLowerCase());
      await writeEmails(emails);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email stored successfully',
      totalEmails: emails.length 
    });
  } catch (error: any) {
    console.error('Store email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve all emails (for admin use)
export async function GET(request: NextRequest) {
  try {
    const emails = await readEmails();
    return NextResponse.json({ 
      success: true, 
      emails,
      count: emails.length 
    });
  } catch (error: any) {
    console.error('Read emails error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
