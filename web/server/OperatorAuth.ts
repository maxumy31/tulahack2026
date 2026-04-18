import { db } from '@/db';
import { operators } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface Operator {
    id: string;
    token: string;
    fullName: string;
}

export async function VerifyToken(token: string): Promise<Operator | null> {
    try {
        const result = await db
            .select()
            .from(operators)
            .where(eq(operators.token, token))
            .limit(1);

        if (result.length === 0) {
            return null;
        }

        const operator = result[0];
        return {
            id: operator.id,
            token: operator.token,
            fullName: operator.fullName,
        };
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
}

export async function verifyTokenFromCookie(token: string): Promise<Operator | null> {
    return VerifyToken(token);
}