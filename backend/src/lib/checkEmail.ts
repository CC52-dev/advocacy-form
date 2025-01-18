import db from "../db/db.js";
import { applicantsTable } from "../db/schema.js";
import { usersTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import type { User, Session, Applicant } from "../db/schema.js";
type checkEmail = boolean | string;
export async function checkEmail(email: string): Promise<checkEmail> {
  const result: Applicant[] = await db
    .select()
    .from(applicantsTable)
    .where(eq(applicantsTable.email, email));
  const result2: User[] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  if (result2[0]) {
    return "sign";
  }
  if (!result[0] && !result2[0]) {
    return true;
  }

  return false;
}
