import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, purchasesTable, booksTable, activityTable } from "@workspace/db";
import { eq, count, sum, desc, gte } from "drizzle-orm";
import { requireAdmin } from "../middlewares/requireAuth";

const router: IRouter = Router();

// Admin: list all users with purchase stats
router.get("/admin/users", requireAdmin, async (req, res): Promise<void> => {
  try {
    const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);

    const purchaseStats = await db
      .select({
        userId: purchasesTable.userId,
        purchaseCount: count(purchasesTable.id),
        totalSpent: sum(purchasesTable.amount),
      })
      .from(purchasesTable)
      .where(eq(purchasesTable.status, "completed"))
      .groupBy(purchasesTable.userId);

    const statsMap = new Map(purchaseStats.map((s) => [s.userId, s]));

    res.json(
      users.map((u) => {
        const stats = statsMap.get(u.id);
        return {
          id: u.id,
          email: u.email,
          name: u.name ?? null,
          role: u.role,
          createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
          purchaseCount: Number(stats?.purchaseCount ?? 0),
          totalSpent: parseFloat(String(stats?.totalSpent ?? "0")),
        };
      })
    );
  } catch (err) {
    req.log.error({ err }, "Error listing users");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Analytics overview
router.get("/analytics/overview", requireAdmin, async (req, res): Promise<void> => {
  try {
    const [totalUsersResult] = await db.select({ count: count() }).from(usersTable);
    const [totalBooksResult] = await db.select({ count: count() }).from(booksTable);
    const [totalPurchasesResult] = await db
      .select({ count: count(), total: sum(purchasesTable.amount) })
      .from(purchasesTable)
      .where(eq(purchasesTable.status, "completed"));

    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const [monthlyRevResult] = await db
      .select({ total: sum(purchasesTable.amount) })
      .from(purchasesTable)
      .where(gte(purchasesTable.createdAt, thisMonthStart));

    const [newUsersResult] = await db
      .select({ count: count() })
      .from(usersTable)
      .where(gte(usersTable.createdAt, thisMonthStart));

    // Top books by sales
    const topBooksRaw = await db
      .select({
        bookId: purchasesTable.bookId,
        salesCount: count(purchasesTable.id),
        revenue: sum(purchasesTable.amount),
      })
      .from(purchasesTable)
      .where(eq(purchasesTable.status, "completed"))
      .groupBy(purchasesTable.bookId)
      .orderBy(desc(count(purchasesTable.id)))
      .limit(5);

    const topBooks = await Promise.all(
      topBooksRaw.map(async (tb) => {
        const [book] = await db.select().from(booksTable).where(eq(booksTable.id, tb.bookId));
        return {
          id: tb.bookId,
          title: book?.title ?? "Unknown",
          salesCount: Number(tb.salesCount),
          revenue: parseFloat(String(tb.revenue ?? "0")),
        };
      })
    );

    res.json({
      totalRevenue: parseFloat(String(totalPurchasesResult?.total ?? "0")),
      totalUsers: Number(totalUsersResult?.count ?? 0),
      totalBooks: Number(totalBooksResult?.count ?? 0),
      totalPurchases: Number(totalPurchasesResult?.count ?? 0),
      activeUsers: Number(totalUsersResult?.count ?? 0),
      revenueThisMonth: parseFloat(String(monthlyRevResult?.total ?? "0")),
      newUsersThisMonth: Number(newUsersResult?.count ?? 0),
      topBooks,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching analytics overview");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Recent activity feed
router.get("/analytics/activity", requireAdmin, async (req, res): Promise<void> => {
  try {
    const activities = await db
      .select()
      .from(activityTable)
      .orderBy(desc(activityTable.createdAt))
      .limit(50);

    res.json(
      activities.map((a) => ({
        id: a.id,
        type: a.type,
        description: a.description,
        userId: a.userId ?? null,
        bookId: a.bookId ?? null,
        amount: a.amount != null ? parseFloat(a.amount) : null,
        createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Error fetching activity");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
