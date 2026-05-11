import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { readingProgressTable, booksTable, purchasesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { UpdateReadingProgressBody, UpdateReadingProgressParams, GetReadingProgressParams } from "@workspace/api-zod";

const router: IRouter = Router();

function formatProgress(progress: any, book: any) {
  return {
    id: progress.id,
    userId: progress.userId,
    bookId: progress.bookId,
    currentPage: progress.currentPage,
    totalPages: progress.totalPages,
    percentComplete: parseFloat(progress.percentComplete ?? "0"),
    lastReadAt: progress.lastReadAt instanceof Date ? progress.lastReadAt.toISOString() : progress.lastReadAt,
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

router.get("/reading-progress", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  try {
    const progress = await db
      .select()
      .from(readingProgressTable)
      .leftJoin(booksTable, eq(readingProgressTable.bookId, booksTable.id))
      .where(eq(readingProgressTable.userId, userId))
      .orderBy(readingProgressTable.lastReadAt);

    res.json(
      progress
        .filter((p) => p.books !== null)
        .map((p) => formatProgress(p.reading_progress, p.books))
    );
  } catch (err) {
    req.log.error({ err }, "Error listing reading progress");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/reading-progress/:bookId", requireAuth, async (req, res): Promise<void> => {
  const params = GetReadingProgressParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = (req as any).userId as string;
  try {
    const [result] = await db
      .select()
      .from(readingProgressTable)
      .leftJoin(booksTable, eq(readingProgressTable.bookId, booksTable.id))
      .where(
        and(
          eq(readingProgressTable.userId, userId),
          eq(readingProgressTable.bookId, params.data.bookId),
        )
      );

    if (!result || !result.books) {
      res.status(404).json({ error: "Reading progress not found" });
      return;
    }

    res.json(formatProgress(result.reading_progress, result.books));
  } catch (err) {
    req.log.error({ err }, "Error fetching reading progress");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/reading-progress/:bookId", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateReadingProgressParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateReadingProgressBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = (req as any).userId as string;
  const { bookId } = params.data;
  const { currentPage, totalPages } = parsed.data;

  try {
    // Verify purchase
    const [purchase] = await db
      .select()
      .from(purchasesTable)
      .where(
        and(
          eq(purchasesTable.userId, userId),
          eq(purchasesTable.bookId, bookId),
          eq(purchasesTable.status, "completed"),
        )
      );

    if (!purchase) {
      res.status(403).json({ error: "You must purchase this book to track progress" });
      return;
    }

    const [book] = await db.select().from(booksTable).where(eq(booksTable.id, bookId));
    if (!book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }

    const effectiveTotalPages = totalPages ?? book.totalPages;
    const percentComplete = Math.min(100, (currentPage / effectiveTotalPages) * 100);

    // Upsert reading progress
    const existing = await db
      .select()
      .from(readingProgressTable)
      .where(
        and(
          eq(readingProgressTable.userId, userId),
          eq(readingProgressTable.bookId, bookId),
        )
      );

    let progress;
    if (existing.length > 0) {
      const [updated] = await db
        .update(readingProgressTable)
        .set({
          currentPage,
          totalPages: effectiveTotalPages,
          percentComplete: String(percentComplete.toFixed(2)),
          lastReadAt: new Date(),
        })
        .where(
          and(
            eq(readingProgressTable.userId, userId),
            eq(readingProgressTable.bookId, bookId),
          )
        )
        .returning();
      progress = updated;
    } else {
      const [inserted] = await db
        .insert(readingProgressTable)
        .values({
          userId,
          bookId,
          currentPage,
          totalPages: effectiveTotalPages,
          percentComplete: String(percentComplete.toFixed(2)),
          lastReadAt: new Date(),
        })
        .returning();
      progress = inserted;
    }

    res.json(formatProgress(progress, book));
  } catch (err) {
    req.log.error({ err }, "Error updating reading progress");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
