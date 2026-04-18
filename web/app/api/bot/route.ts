import { GetUseBot, SetUseBot } from '@/server/BotState';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        const status = await GetUseBot();
        return NextResponse.json({ useBot: status });
    } catch (error) {
        console.error('Error fetching bot status:', error);
        return NextResponse.json({ error: 'Failed to fetch bot status' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { useBot } = body;
        
        if (typeof useBot !== 'boolean') {
            return NextResponse.json({ error: 'Invalid parameter: useBot must be boolean' }, { status: 400 });
        }
        
        await SetUseBot(useBot);
        return NextResponse.json({ useBot });
    } catch (error) {
        console.error('Error updating bot status:', error);
        return NextResponse.json({ error: 'Failed to update bot status' }, { status: 500 });
    }
}
