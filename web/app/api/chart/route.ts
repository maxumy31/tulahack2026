import { GetChartData } from '@/server/State';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const category = request.nextUrl.searchParams.get('category') as 'total' | 'opened' | 'closed' | 'opened-human' | 'opened-bot' | 'closed-human' | 'closed-bot' || 'total';
        const dateParam = request.nextUrl.searchParams.get('date');
        const date = dateParam ? new Date(dateParam) : undefined;
        
        const data = await GetChartData(category, date);
        
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching chart data:', error);
        return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
    }
}
