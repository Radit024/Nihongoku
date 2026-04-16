import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import materialsRouter from "./materials";
import quizzesRouter from "./quizzes";
import classroomRouter from "./classroom";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(classroomRouter);
router.use(materialsRouter);
router.use(quizzesRouter);

export default router;
