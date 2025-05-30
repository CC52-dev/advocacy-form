import db from "../db/db.js";
import { usersTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import type { User, Session } from "../db/schema.js";
type checkEmail = boolean | string;


export async function checkEmail(email: string): Promise<checkEmail> {

  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  const type: string | null = users[0]?.type ?? null;
  if (!type) {
    return true;
  }
  if (type === "user" || type === "admin" || type === "adminviewer") {

    return "sign";
  }
  if (type === "applicant") {
    return false;
  }


  return false;
}
