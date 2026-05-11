import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// Upsert user in DB from Clerk identity
async function upsertUser(userId: string, email: string, name?: string | null, avatarUrl?: string | null) {
  const existing = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (existing.length === 0) {
    await db.insert(usersTable).values({
      id: userId,
      email,
      name: name ?? null,
      avatarUrl: avatarUrl ?? null,
      role: "user",
    });
  }
}

router.get("/me", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const auth = getAuth(req);

  try {
    let [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      // Auto-create user on first access
      const email = (auth as any)?.sessionClaims?.email ?? `${userId}@unknown.com`;
      await upsertUser(userId, email);
      [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching user profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me/role", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;

  try {
    let [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      const auth = getAuth(req);
      const email = (auth as any)?.sessionClaims?.email ?? `${userId}@unknown.com`;
      await upsertUser(userId, email);
      [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    }

    res.json({
      role: user?.role ?? "user",
      isAdmin: user?.role === "admin",
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching user role");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
