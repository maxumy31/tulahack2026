import { GetTicketStats } from '@/server/State';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const dateParam = request.nextUrl.searchParams.get('date');
        const date = dateParam ? new Date(dateParam) : undefined;
        
        const stats = await GetTicketStats(date);
        
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
