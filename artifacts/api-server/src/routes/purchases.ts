import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { purchasesTable, booksTable, activityTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/requireAuth";
import { CreatePurchaseBody } from "@workspace/api-zod";

const router: IRouter = Router();

function formatPurchase(purchase: any, book: any) {
  return {
    id: purchase.id,
    userId: purchase.userId,
    bookId: purchase.bookId,
    amount: parseFloat(purchase.amount ?? "0"),
    status: purchase.status,
    createdAt: purchase.createdAt instanceof Date ? purchase.createdAt.toISOString() : purchase.createdAt,
    book: {
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description,
      coverUrl: book.coverUrl ?? null,
      price: parseFloat(book.price ?? "0"),
      category: book.category,
      language: book.language,
      level: book.level,
      isFeatured: book.isFeatured,
      isBestseller: book.isBestseller,
      totalPages: book.totalPages,
      rating: parseFloat(book.rating ?? "0"),
      reviewCount: book.reviewCount,
      createdAt: book.createdAt instanceof Date ? book.createdAt.toISOString() : book.createdAt,
      updatedAt: book.updatedAt instanceof Date ? book.updatedAt.toISOString() : book.updatedAt,
    },
  };
}

router.get("/purchases", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  try {
    const purchases = await db
      .select()
      .from(purchasesTable)
      .leftJoin(booksTable, eq(purchasesTable.bookId, booksTable.id))
      .where(eq(purchasesTable.userId, userId))
      .orderBy(purchasesTable.createdAt);

    res.json(
      purchases
        .filter((p) => p.books !== null)
        .map((p) => formatPurchase(p.purchases, p.books))
    );
  } catch (err) {
    req.log.error({ err }, "Error listing purchases");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/purchases", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const parsed = CreatePurchaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { bookId, amount } = parsed.data;

  try {
    // Check book exists
    const [book] = await db.select().from(booksTable).where(eq(booksTable.id, bookId));
    if (!book) {
      res.status(400).json({ error: "Book not found" });
      return;
    }

    // Check if already purchased
    const [existing] = await db
      .select()
      .from(purchasesTable)
      .where(
        and(
          eq(purchasesTable.userId, userId),
          eq(purchasesTable.bookId, bookId),
          eq(purchasesTable.status, "completed"),
        )
      );

    if (existing) {
      res.status(400).json({ error: "Book already purchased" });
      return;
    }

    const [purchase] = await db
      .insert(purchasesTable)
      .values({
        userId,
        bookId,
        amount: String(amount),
        status: "completed",
      })
      .returning();

    // Log activity
    await db.insert(activityTable).values({
      type: "purchase",
      description: `User purchased "${book.title}"`,
      userId,
      bookId,
      amount: String(amount),
    });

    res.status(201).json(formatPurchase(purchase, book));
  } catch (err) {
    req.log.error({ err }, "Error creating purchase");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: list all purchases
router.get("/admin/purchases", requireAdmin, async (req, res): Promise<void> => {
  try {
    const purchases = await db
      .select()
      .from(purchasesTable)
      .leftJoin(booksTable, eq(purchasesTable.bookId, booksTable.id))
      .orderBy(purchasesTable.createdAt);

    res.json(
      purchases
        .filter((p) => p.books !== null)
        .map((p) => formatPurchase(p.purchases, p.books))
    );
  } catch (err) {
    req.log.error({ err }, "Error listing all purchases");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
