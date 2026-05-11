import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { booksTable, purchasesTable } from "@workspace/db";
import { eq, ilike, and, or } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/requireAuth";
import {
  ListBooksQueryParams,
  CreateBookBody,
  UpdateBookBody,
  GetBookParams,
  UpdateBookParams,
  DeleteBookParams,
  GetBookContentParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/books", async (req, res): Promise<void> => {
  try {
    const params = ListBooksQueryParams.safeParse(req.query);
    const { category, search, featured, language } = params.success ? params.data : {};

    let query = db.select({
      id: booksTable.id,
      title: booksTable.title,
      author: booksTable.author,
      description: booksTable.description,
      coverUrl: booksTable.coverUrl,
      price: booksTable.price,
      category: booksTable.category,
      language: booksTable.language,
      level: booksTable.level,
      isFeatured: booksTable.isFeatured,
      isBestseller: booksTable.isBestseller,
      totalPages: booksTable.totalPages,
      rating: booksTable.rating,
      reviewCount: booksTable.reviewCount,
      createdAt: booksTable.createdAt,
      updatedAt: booksTable.updatedAt,
    }).from(booksTable).$dynamic();

    const conditions = [];
    if (category) conditions.push(eq(booksTable.category, category));
    if (language) conditions.push(eq(booksTable.language, language));
    if (featured === "true") conditions.push(eq(booksTable.isFeatured, true));
    if (search) {
      conditions.push(
        or(
          ilike(booksTable.title, `%${search}%`),
          ilike(booksTable.author, `%${search}%`),
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const books = await query.orderBy(booksTable.createdAt);
    res.json(books.map(formatBook));
  } catch (err) {
    req.log.error({ err }, "Error listing books");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/store/featured", async (req, res): Promise<void> => {
  try {
    const books = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.isFeatured, true))
      .limit(8);
    res.json(books.map(formatBook));
  } catch (err) {
    req.log.error({ err }, "Error fetching featured books");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/store/categories", async (req, res): Promise<void> => {
  try {
    const books = await db.select({ category: booksTable.category }).from(booksTable);
    const counts: Record<string, number> = {};
    for (const b of books) {
      counts[b.category] = (counts[b.category] ?? 0) + 1;
    }
    const categoryIcons: Record<string, string> = {
      Spanish: "🇪🇸",
      Japanese: "🇯🇵",
      Mandarin: "🇨🇳",
      French: "🇫🇷",
      Arabic: "🇸🇦",
      German: "🇩🇪",
      Korean: "🇰🇷",
      Portuguese: "🇧🇷",
      Italian: "🇮🇹",
      Russian: "🇷🇺",
    };
    const categories = Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      icon: categoryIcons[name] ?? "📚",
    }));
    res.json(categories);
  } catch (err) {
    req.log.error({ err }, "Error fetching categories");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/store/bestsellers", async (req, res): Promise<void> => {
  try {
    const books = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.isBestseller, true))
      .limit(8);
    res.json(books.map(formatBook));
  } catch (err) {
    req.log.error({ err }, "Error fetching bestsellers");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/books/:id", async (req, res): Promise<void> => {
  const params = GetBookParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  try {
    const [book] = await db.select().from(booksTable).where(eq(booksTable.id, params.data.id));
    if (!book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }
    res.json(formatBook(book));
  } catch (err) {
    req.log.error({ err }, "Error fetching book");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/books/:id/content", requireAuth, async (req, res): Promise<void> => {
  const params = GetBookContentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = (req as any).userId as string;
  try {
    const [book] = await db.select().from(booksTable).where(eq(booksTable.id, params.data.id));
    if (!book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }

    // Check if user purchased this book
    const [purchase] = await db
      .select()
      .from(purchasesTable)
      .where(
        and(
          eq(purchasesTable.userId, userId),
          eq(purchasesTable.bookId, params.data.id),
          eq(purchasesTable.status, "completed"),
        )
      );

    if (!purchase) {
      res.status(403).json({ error: "You must purchase this book to read it" });
      return;
    }

    res.json({
      id: book.id,
      title: book.title,
      content: book.content,
      totalPages: book.totalPages,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching book content");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/books", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateBookBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [book] = await db
      .insert(booksTable)
      .values({
        ...parsed.data,
        price: String(parsed.data.price),
        rating: "0",
        reviewCount: 0,
        isFeatured: parsed.data.isFeatured ?? false,
        isBestseller: parsed.data.isBestseller ?? false,
      })
      .returning();
    res.status(201).json(formatBook(book));
  } catch (err) {
    req.log.error({ err }, "Error creating book");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/books/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateBookParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateBookBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const updateData: Record<string, any> = { ...parsed.data };
    if (updateData.price != null) updateData.price = String(updateData.price);

    const [book] = await db
      .update(booksTable)
      .set(updateData)
      .where(eq(booksTable.id, params.data.id))
      .returning();

    if (!book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }
    res.json(formatBook(book));
  } catch (err) {
    req.log.error({ err }, "Error updating book");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/books/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteBookParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  try {
    const [book] = await db
      .delete(booksTable)
      .where(eq(booksTable.id, params.data.id))
      .returning();
    if (!book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }
    res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "Error deleting book");
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatBook(book: any) {
  return {
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
  };
}

export default router;
