import { VerifyToken } from '@/server/OperatorAuth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token } = body;

        if (!token || typeof token !== 'string') {
            return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
        }

        const operator = await VerifyToken(token);

        if (!operator) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const response = NextResponse.json({
            success: true,
            operator,
        });

        response.cookies.set('token', token, {
            httpOnly: false,
            secure: false,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
        });

        return response;
    } catch (error) {
        console.error('Error in auth:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        const operator = await VerifyToken(token);

        if (!operator) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        return NextResponse.json({
            authenticated: true,
            operator,
        });
    } catch (error) {
        console.error('Error checking auth:', error);
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}