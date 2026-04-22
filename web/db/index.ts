import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from './schema'; // Импортируйте все из файла схемы
import { ensureAdminExists } from './seed';
import path from 'path';

const connectionString = process.env.DATABASE_URL!;

export const db = drizzle(connectionString, { schema });

// Автоматически запускаем миграции при инициализации
async function initializeDatabase() {
  try {
    await ensureAdminExists();
    console.log('[DB] Running migrations...');
    await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });
    console.log('[DB] Migrations completed successfully');
  } catch (error) {
    console.error('[DB] Migration failed:', error);
    throw error;
  }
}

initializeDatabase()
