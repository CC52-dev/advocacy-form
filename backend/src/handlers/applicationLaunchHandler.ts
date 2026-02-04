import db from "../db/db.js";
import { eq, and, lt, sql } from "drizzle-orm";
import { 
  applicationsTable, 
  applicationSessionsTable, 
  applicationUserRolesTable,
  usersTable 
} from "../db/schema.js";
import { validateSessionToken } from "../lib/session.js";
import type { SessionValidationResult } from "../lib/session.js";
import type { Response, Request } from "express";
import { randomBytes } from "crypto";
import { hasApplicationAccess } from "./applicationRolesHandler.js";

// Generate a secure launch token
function generateLaunchToken(): string {
  return `launch_${randomBytes(32).toString('hex')}`;
}

// Generate a launch token for an application (user must have access)
// Reuses existing session if the same user session created it and there's >1 hour left
export async function generateLaunchTokenHandler(token: string, applicationId: string, res: Response) {
  try {
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);

    if (!sessionValidationResult.session || !sessionValidationResult.user) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;
    const userSessionId = sessionValidationResult.session.id;

    // Get application details
    const application = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.id, applicationId))
      .limit(1);

    if (!application[0]) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    // Check if application is active
    if (application[0].status !== "active") {
      res.status(400).json({ message: "Application is not active" });
      return;
    }

    // Check if application has a URL configured
    if (!application[0].url) {
      res.status(400).json({ message: "Application does not have a URL configured" });
      return;
    }

    // Check if user has access to this application
    const hasAccess = await hasApplicationAccess(userId, applicationId);
    if (!hasAccess) {
      res.status(403).json({ message: "You do not have access to this application" });
      return;
    }

    // Check for existing reusable session
    // Criteria: same user session ID, same application, >1 hour remaining
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
    
    const existingSession = await db
      .select()
      .from(applicationSessionsTable)
      .where(
        and(
          eq(applicationSessionsTable.userId, userId),
          eq(applicationSessionsTable.applicationId, applicationId),
          eq(applicationSessionsTable.userSessionId, userSessionId)
        )
      )
      .limit(1);

    // If existing session has more than 1 hour remaining, reuse it
    if (existingSession[0] && new Date(existingSession[0].expiresAt) > oneHourFromNow) {
      const redirectUrl = new URL(application[0].url);
      redirectUrl.searchParams.set('launch_token', existingSession[0].token);

      res.status(200).json({
        message: "Reusing existing session",
        launchToken: existingSession[0].token,
        redirectUrl: redirectUrl.toString(),
        expiresAt: existingSession[0].expiresAt,
        reused: true,
      });
      return;
    }

    // Generate new launch token
    const launchToken = generateLaunchToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour validity

    // Store the token with user session ID for future reuse
    await db.insert(applicationSessionsTable).values({
      token: launchToken,
      userId: userId,
      applicationId: applicationId,
      userSessionId: userSessionId,
      expiresAt: expiresAt,
      used: false,
    } as any);

    // Build redirect URL
    const redirectUrl = new URL(application[0].url);
    redirectUrl.searchParams.set('launch_token', launchToken);

    res.status(200).json({
      message: "Launch token generated successfully",
      launchToken: launchToken,
      redirectUrl: redirectUrl.toString(),
      expiresAt: expiresAt.toISOString(),
      reused: false,
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

// Verify a launch token (called by external applications)
// This endpoint uses API key authentication, not session
export async function verifyLaunchToken(req: Request, res: Response) {
  try {
    const { token: launchToken, apiKey } = req.body;

    if (!launchToken || !apiKey) {
      res.status(400).json({ message: "Missing token or apiKey" });
      return;
    }

    // Find the application by API key
    const application = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.apiKey, apiKey))
      .limit(1);

    if (!application[0]) {
      res.status(401).json({ message: "Invalid API key" });
      return;
    }

    // Find the session token
    const session = await db
      .select()
      .from(applicationSessionsTable)
      .where(
        and(
          eq(applicationSessionsTable.token, launchToken),
          eq(applicationSessionsTable.applicationId, application[0].id)
        )
      )
      .limit(1);

    if (!session[0]) {
      res.status(401).json({ message: "Invalid launch token" });
      return;
    }

    // Check if token is expired
    if (new Date(session[0].expiresAt) < new Date()) {
      res.status(401).json({ message: "Launch token has expired" });
      return;
    }

    // Mark token as used on first verification (for tracking purposes)
    // Note: We allow reusing the token within the session validity period
    if (!session[0].used) {
      await db
        .update(applicationSessionsTable)
        .set({ used: true } as any)
        .where(eq(applicationSessionsTable.id, session[0].id));
    }

    // Get user details including interests
    const user = await db
      .select({
        id: usersTable.id,
        firstname: usersTable.firstname,
        lastname: usersTable.lastname,
        email: usersTable.email,
        interest: usersTable.interest,
      })
      .from(usersTable)
      .where(eq(usersTable.id, session[0].userId))
      .limit(1);

    if (!user[0]) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Get user's roles/permissions in this application
    const userRoles = await db
      .select({
        roleCode: applicationUserRolesTable.roleCode,
        title: applicationUserRolesTable.title,
      })
      .from(applicationUserRolesTable)
      .where(
        and(
          eq(applicationUserRolesTable.userId, session[0].userId),
          eq(applicationUserRolesTable.applicationId, application[0].id)
        )
      );

    // Parse interests (they might be stored as JSON string or array)
    let interests: string[] = [];
    if (user[0].interest) {
      if (Array.isArray(user[0].interest)) {
        interests = user[0].interest;
      } else if (typeof user[0].interest === 'string') {
        try {
          const parsed = JSON.parse(user[0].interest);
          interests = Array.isArray(parsed) ? parsed : [];
        } catch {
          interests = [];
        }
      }
    }

    res.status(200).json({
      message: "Token verified successfully",
      session: {
        valid: true,
        expiresAt: session[0].expiresAt,
        expiresIn: Math.max(0, new Date(session[0].expiresAt).getTime() - Date.now()),
      },
      user: {
        id: user[0].id,
        firstname: user[0].firstname,
        lastname: user[0].lastname,
        email: user[0].email,
        interests: interests,
      },
      permissions: userRoles.map(ur => ({
        code: ur.roleCode,
        title: ur.title,
      })),
      application: {
        id: application[0].id,
        name: application[0].name,
      },
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

// Clean up expired sessions (can be called by a cron job)
export async function cleanupExpiredSessions() {
  try {
    await db
      .delete(applicationSessionsTable)
      .where(lt(applicationSessionsTable.expiresAt, sql`NOW()`));
    
    console.log("Cleaned up expired application sessions");
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error);
  }
}
