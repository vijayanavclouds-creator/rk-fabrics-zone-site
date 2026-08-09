import { NextResponse } from 'next/server';

export async function GET() {
  const user = process.env.SMTP_USER || 'undefined';
  const pass = process.env.SMTP_PASS || 'undefined';
  
  return NextResponse.json({
    user,
    passLength: pass.length,
    passPreview: pass !== 'undefined' ? pass.substring(0, 3) + '...' : 'undefined',
    host: process.env.SMTP_HOST || 'undefined',
  });
}
