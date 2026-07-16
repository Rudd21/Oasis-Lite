import { Router } from "express";
import { tasksController } from "../controllers/tasks.controller";

const tasksRouter = Router();

tasksRouter.get('/', tasksController.getAll);
tasksRouter.post('/', tasksController.create);

export default tasksRouter;