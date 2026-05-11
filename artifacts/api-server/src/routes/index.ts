import { Router, type IRouter } from "express";
import healthRouter from "./health";
import meRouter from "./me";
import booksRouter from "./books";
import purchasesRouter from "./purchases";
import readingProgressRouter from "./reading_progress";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(meRouter);
router.use(booksRouter);
router.use(purchasesRouter);
router.use(readingProgressRouter);
router.use(adminRouter);

export default router;
