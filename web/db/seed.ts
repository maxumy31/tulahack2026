import { db } from ".";
import { operators } from "./schema";

export async function ensureAdminExists() {
  const admin = await db.select().from(operators).limit(1);
  
  if (admin.length === 0) {
    await db.insert(operators).values({
      fullName: "Системный администратор",
      token: "default-token"
    });
    console.log("Администратор создан.");
  }
  console.log("Тестовый оператор создан")
}