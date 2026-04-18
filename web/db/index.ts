import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema'; // Импортируйте все из файла схемы
import { ensureAdminExists } from './seed';

const connectionString = process.env.DATABASE_URL!;


export const db = drizzle(connectionString, { schema });
ensureAdminExists();