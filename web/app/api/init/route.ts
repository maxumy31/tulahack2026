import { db } from '@/db';
import { operators } from '@/db/schema';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        // Добавляем тестовых операторов
        const testOperators = [
            { token: 'test-token-1', fullName: 'Иван Петров' },
            { token: 'test-token-2', fullName: 'Мария Сидорова' },
            { token: 'admin-token', fullName: 'Администратор' },
        ];

        for (const op of testOperators) {
            try {
                await db.insert(operators).values({
                    token: op.token,
                    fullName: op.fullName,
                });
            } catch (error) {
                // Игнорируем если оператор уже существует (due to unique constraint)
                console.log(`Operator ${op.token} already exists`);
            }
        }

        return NextResponse.json({ success: true, message: 'Database initialized' });
    } catch (error) {
        console.error('Init error:', error);
        return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 });
    }
}
