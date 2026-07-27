import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return new Response('Unauthorized', { status: 401 });
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const updated = await prisma.order.updateMany({
      where: {
        status: 'CONFIRMED',
        createdAt: {
          lte: oneHourAgo,
        },
      },
      data: {
        status: 'PROCESSING',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Updated ${updated.count} orders to PROCESSING`,
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
